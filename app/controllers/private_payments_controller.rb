class PrivatePaymentsController < ApplicationController

	before_filter :authenticate_user!

	def index
		@private_payments = current_user.private_payments
	end

	def new
		@private_payment = current_user.private_payments.build
	end

	def create
		@private_payment = current_user.private_payments.build permitted_private_params

		if @private_payment.save
      redirect_to private_payments_path, notice: 'Private Payment was successfully created.'
    else
      render :new
      # redirect_to new_property_path, alert: 'Failed to create property.'
    end
	end

	def edit
		@private_payment = current_user.private_payments.find params[:id]
	end

	def update
		@private_payment = current_user.private_payments.find params[:id]

    if @private_payment.update_attributes permitted_private_params
      redirect_to private_payments_path, notice: 'Property was successfully updated.'
    else
      render :edit
    end
	end

	def destroy
		@private_payment = current_user.private_payments.find params[:id]

    if @private_payment.destroy
      redirect_to private_payments_path, notice: 'Private Payment was successfully deleted.'
    else
      redirect_to private_payments_path, notice: 'Failed to delete property.'
    end
	end

	def permitted_private_params
    params.require(:private_payment).permit(:property_id, :amount, :date_paid)
  end
end