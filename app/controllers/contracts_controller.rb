class ContractsController < ApplicationController

  before_filter :authenticate_user!

  def index
    @active_contracts = current_user.active_contracts
    @finished_contracts = current_user.all_contracts.finished
  end

  def active_contracts
    @active_contracts = current_user.active_contracts
  end

  def finished_contracts
    @finished_contracts = current_user.finished_contracts
    # @finished_contracts = Contract.where('tenant_id = ? OR landlord_id = ?', current_user.id, current_user.id)
  end

  def new
    if current_user.properties.blank?
      redirect_to new_property_path, notice: 'You have to create more than 1 property to start a contract.' and return
    end
    @contract = Contract.new
  end

  def create
    if !current_user.is_active
      redirect_to contracts_path, :alert => "You have to subscribe to manage the contracts." and return
    elsif current_user.contract_max_count != -1 && current_user.contract_count >= current_user.contract_max_count
      redirect_to contracts_path, :alert => "You could have #{current_user.contract_max_count} contracts with your plan, if you want to add more contracts, please upgrade plan." and return
    end

    @contract = Contract.new permit_contract_params
    @contract.landlord_id = current_user.id

    if @contract.save
      generate_payments @contract
      current_user.contract_count = current_user.contract_count + 1
      current_user.save

      redirect_to contracts_path, notice: 'Contract is successfully created.'
    else
      render :new
    end
  end

  def edit
    @contract = Contract.find params[:id]
  end

  def show
    @contract = Contract.includes(:payments).includes(:property)
                        .includes(:landlord).includes(:tenant)
                        .find(params[:id])
    @paid_payments = @contract.payments.paid
    @outstanding_payments = @contract.payments.outstanding
    @tenant_info = @contract.tenant_info current_user
  end

  def update
    @contract = Contract.find params[:id]

    if @contract.update_attributes permit_contract_params
      update_payments @contract

      redirect_to contracts_path, notice: 'Contract is successfully started.'
    else
      render :edit
    end
  end

  def destroy
    @contract = Contract.find params[:id]
    @contract.finished_at = Time.now

    if @contract.save
      redirect_to new_contract_path, notice: 'Contract is successfully finished.'
    else
      redirect_to contracts_path, alert: 'Failed to finish contract.'
    end
  end

  private

  def generate_payments contract
    num_of_months = (contract.end_date.year * 12 + contract.end_date.month) - (contract.start_date.year * 12 + contract.start_date.month)

    num_of_months.times do |n|
      calc_date = contract.start_date + (n + 1).months
      days = Time.days_in_month(calc_date.month, calc_date.year)
      if contract.pay_date > days
        calc_date = calc_date.change(day: days)
      else
        calc_date = calc_date.change(day: contract.pay_date)
      end

      payment = Payment.new
      payment.landlord = contract.landlord
      payment.amount = contract.rental
      payment.property = contract.property
      payment.contract = contract
      payment.status = Payment::STATUS_UNPAID
      payment.paid_type = nil
      payment.due_date = calc_date
      payment.date_paid = nil
      payment.return_token = SecureRandom.urlsafe_base64(16)

      payment.save
    end
  end

  def update_payments contract
    updated_ids = []

    current_payments = Payment.where(contract_id: contract.id)
    current_ids = current_payments.map(&:id)

    num_of_months = (contract.end_date.year * 12 + contract.end_date.month) - (contract.start_date.year * 12 + contract.start_date.month)

    num_of_months.times do |n|

      calc_date = contract.start_date + (n + 1).months

      days = Time.days_in_month(calc_date.month, calc_date.year)
      if contract.pay_date > days
        calc_date = calc_date.change(day: days)
      else
        calc_date = calc_date.change(day: contract.pay_date)
      end

      exist_payment = false
      current_payments.each do |cp|
        if cp.due_date.strftime("%Y%m") == calc_date.strftime("%Y%m")
          if cp.status == Payment::STATUS_UNPAID
            cp.due_date = calc_date
            cp.save
          end
          updated_ids.push cp.id
          exist_payment = true
        end
      end

      unless exist_payment
        payment = Payment.new
        payment.landlord = contract.landlord
        payment.amount = contract.rental
        payment.property = contract.property
        payment.contract = contract
        payment.status = Payment::STATUS_UNPAID
        payment.paid_type = nil
        payment.due_date = calc_date
        payment.date_paid = nil
        payment.return_token = SecureRandom.urlsafe_base64(16)

        payment.save
      end
    end

    Payment.destroy(current_ids - updated_ids)
  end

  def permit_contract_params
    params.require(:contract).permit(:tenant_id, :property_id, :room_number, :start_date, :end_date,
                                     :rental, :pay_date, :notes, :connection_id)
  end

end