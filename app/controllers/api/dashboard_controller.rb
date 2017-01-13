class Api::DashboardController < Api::ApiController
  before_action :require_user

  def counts
    @user = current_user
    @properties = @user.properties
    @contracts = @user.all_contracts

    @current_year = Date.today.strftime('%Y').to_i
    @current_month = Date.today.strftime('%m').to_i
    @monthly_paid = Date::ABBR_MONTHNAMES[1..12].map {|m| [m, 0]}

    @all_payments = if @user.user_type == User::LANDLORD
                      Payment.year(@current_year)
                      .joins(:contract)
                      .where('contracts.landlord_id = ?', @user.id)
                      .order(:contract_id, :due_date)
                    else
                      Payment.year(@current_year)
                      .joins(:contract)
                      .where('contracts.tenant_id = ?', @user.id)
                      .order(:contract_id, :due_date)
                    end
    @paid_payments = @all_payments.paid.all
    @paid_payments = @paid_payments.group_by { |p| p.date_paid.beginning_of_month }
    @outstanding_payments = @all_payments.outstanding.all + @all_payments.refunded.all
    @outstanding_payments = @outstanding_payments.group_by { |p| p.due_date.beginning_of_month }

    # @year_paid_total = 0
    @paid_payments.sort.map do |month, p|
      index = @monthly_paid.index {|e| e[0] == month.strftime('%b')}
      total = p.map(&:amount).reduce(&:+).to_f
      @monthly_paid[index][1] = total
      # @year_paid_total += total
      @monthly_paid[index][2] = "Amount: #{decimal_amount(total)}"
      @monthly_paid[index][3] = p.count
    end

    render json: {
        properties_count: @properties.count,
        contracts_count: @contracts.count,
        monthly_paid: @monthly_paid[@current_month - 1][3] || 0,
        outstanding_count: @outstanding_payments.count
    }
  end

end
