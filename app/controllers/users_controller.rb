class UsersController < ApplicationController
  before_filter :authenticate_user!

  def edit
    @user = current_user
  end

  def show
    redirect_to profile_path if tenant?
    @user = current_user
  end

  def update
    @user = current_user
    if @user.update_attributes permit_params
      redirect_to profile_path, :notice => "Profile is successfully updated."
    else
      redirect_to profile_path, :alert => @user.errors.full_messages.to_sentence
    end
  end

  private

  def permit_params
    if params[:user][:password].blank?
      params[:user].delete :password
      params[:user].delete :password_confirmation
    end

    params.require(:user)
      .permit(
          :first_name, :middle_name, :last_name, :email, :secondary_email, :gender,
          :primary_phone, :secondary_phone, :avatar, :password, :password_confirmation, :notes,
          :address1, :address2, :city, :state, :country, :birthday,
          :company_name, :company_desc, :vat_number,
          :bank_account_no, :bank_name, :bank_branch, :paypal_email, :currency
      )
  end

end
