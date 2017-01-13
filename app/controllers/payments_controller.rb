class PaymentsController < ApplicationController

  before_filter :authenticate_user!

  def outstanding
    if landlord?
      @all_payments = Payment.joins(:contract)
                             .where('contracts.landlord_id = ?', current_user.id)
                             .order(:contract_id, :due_date)
    else
      @all_payments = Payment.joins(:contract)
                             .where('contracts.tenant_id = ?', current_user.id)
                             .order(:contract_id, :due_date)
    end
    @outstanding_payments = @all_payments.outstanding.all + @all_payments.refunded.all
  end

  def paid
    if landlord?
      @all_payments = Payment.joins(:contract)
                             .where('contracts.landlord_id = ?', current_user.id)
                             .order(:contract_id, :due_date)
    else
      @all_payments = Payment.joins(:contract)
                             .where('contracts.tenant_id = ?', current_user.id)
                             .order(:contract_id, :due_date)
    end
    @paid_payments = @all_payments.paid.all + @all_payments.pending.all
  end

  def confirm
    @payment = Payment.find_by_return_token params[:return_token]
    payment_method = params[:payment_method] || @payment.paid_type || Payment::PAID_CASH

    @payment.paid_type = payment_method
    @payment.date_refunded = nil
    if landlord?
      @payment.status = Payment::STATUS_PAID
      @payment.date_accepted = Time.now
    elsif tenant?
      @payment.status = Payment::STATUS_PENDING
    end
    @payment.date_paid = Time.now

    if @payment.save
      UserMailer.tenant_paid_email(@payment).deliver
      redirect_to paid_payments_path, notice: 'Payment is successfully paid.'
    else
      redirect_to outstanding_payments_path, alert: 'Failed to pay.'
    end
  end

  def accept
    @payment = Payment.find params[:id]

    @payment.status = Payment::STATUS_PAID
    @payment.date_accepted = Time.now
    @payment.date_paid ||= Time.now
    @payment.paid_type ||= Payment::PAID_CASH

    if @payment.save
      UserMailer.payment_success_email(@payment).deliver
      UserMailer.landlord_accept_email(@payment).deliver
      redirect_to paid_payments_path, notice: 'Payment is successfully accepted.'
    else
      redirect_to paid_payments_path, alert: 'Failed to accept payment.'
    end
  end

  def refund
    @payment = Payment.find params[:id]

    @payment.status = Payment::STATUS_REFUNDED
    @payment.date_refunded = Time.now

    if @payment.save
      redirect_to paid_payments_path, notice: 'Payment is successfully refunded.'
    else
      redirect_to paid_payments_path, alert: 'Failed to refund payment.'
    end
  end

  def destroy
    @payment = Payment.find params[:id]
    @payment.destroy

    redirect_to outstanding_payments_path, notice: 'Payment is successfully deleted.'
  end
end
