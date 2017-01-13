class DashboardController < ApplicationController

  before_filter :authenticate_user!
  before_filter :check_subscription

  def show
    @user = current_user
    @properties = @user.properties
    @contracts = @user.all_contracts

    @current_year = Date.today.strftime('%Y').to_i
    @current_month = Date.today.strftime('%m').to_i

    @all_payments = if landlord?
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
    # @paid_payments = @all_payments.paid.all + @all_payments.pending.all
    # @paid_payments = @paid_payments.group_by { |p| p.date_paid.beginning_of_month }
    @paid_payments = @all_payments.paid.all
    @paid_payments = @paid_payments.group_by { |p| p.date_paid.beginning_of_month }
    @outstanding_payments = @all_payments.outstanding.all + @all_payments.refunded.all
    @outstanding_payments = @outstanding_payments.group_by { |p| p.due_date.beginning_of_month }

    @monthly_paid = Date::ABBR_MONTHNAMES[1..12].map {|m| [m, 0]}
    @monthly_outstanding = Date::ABBR_MONTHNAMES[1..12].map {|m| [m, 0, 'Amount: 0']}
    
    @year_paid_total = 0
    @paid_payments.sort.map do |month, p|
      index = @monthly_paid.index {|e| e[0] == month.strftime('%b')}
      total = p.map(&:amount).reduce(&:+).to_f
      @monthly_paid[index][1] = total
      @year_paid_total += total
      @monthly_paid[index][2] = "Amount: #{decimal_amount(total)}"
      @monthly_paid[index][3] = p.count
    end

    @year_unpaid_total = 0
    @outstanding_payments.sort.map do |month, p|
      index = @monthly_outstanding.index { |e| e[0] == month.strftime('%b') }
      total = p.map(&:amount).reduce(&:+).to_f
      @year_unpaid_total += total
      @monthly_outstanding[index][1] = total
      @monthly_outstanding[index][2] = "Amount: #{decimal_amount(total)}"
      @monthly_outstanding[index][3] = p.count
    end

    @month_paid = @paid_payments[Date.today.beginning_of_month] || []
    @month_unpaid = @outstanding_payments[Date.today.beginning_of_month] || []

    ### To retrieve Payments awaiting approval ###
    if tenant?
      # @awaiting_payments = current_user.all_contracts.payments.pending
      @awaiting_payments = Payment.pending
                                  .joins(:contract)
                                  .where('contracts.tenant_id = ?', current_user.id)
    end
  end

  private
  def check_subscription
    landlord = current_user
    if tenant?
      return
    end
    if landlord.subscription_expired?
      redirect_to account_summary_path, alert: 'Your subscription has expired today, please renew to use our app.'
    end
  end

end