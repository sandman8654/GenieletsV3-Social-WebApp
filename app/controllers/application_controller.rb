class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  include ApplicationHelper

  protected

  def after_sign_in_path_for(resource)

    if resource.is_a?(AdminUser)
      admin_dashboard_path    
    else
      if resource.first_name.blank?
        profile_path
      else
        dashboard_path
      end
    end
  end

end
