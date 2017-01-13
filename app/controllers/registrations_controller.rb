class RegistrationsController < Devise::RegistrationsController
  
  before_filter :configure_permitted_parameters

  def new
    @type = params[:type] || User::LANDLORD
    super
  end


  protected

  def after_inactive_sign_up_path_for(resource)
    if resource.user_type == User::TENANT
      connections = Connection.where(tenant_email: resource.email, user_id: nil)
      if connections.present?
        connections.update_all(user_id: resource.id)
        connections.each do |con|
          contract = Contract.unscoped.where(connection_id: con.id)

          if contract.present?
            contract.update_all(tenant_id: resource.id)
          end
        end
        #connection_ids = connections.pluck(:id)
        #Contract.unscoped.where(connection_id: connection_ids).update_all(tenant_id: resource.id)
      end
    elsif resource.user_type == User::LANDLORD
      connection = Connection.where(landlord_email: resource.email, connection_id: nil)
      if connection != nil
        connection.update_all(connection_id: resource.id)

        connection.each do |con|
          contract = Contract.unscoped.where(connection_id: con.id)

          if contract.present?
            contract.update_all(landlord_id: resource.id)
          end
        end
      end
    end

    '/users/sign_in'
  end
 
  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) do |u|
      u.permit(:user_type, :email, :password, :password_confirmation)
    end
    devise_parameter_sanitizer.for(:account_update) do |u|
      u.permit(:user_type, :email, :password, :password_confirmation, :current_password)
    end
  end

end