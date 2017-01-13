class Api::AuthController < Api::ApiController
  # see: http://jessewolgamott.com/blog/2012/01/19/the-one-with-a-json-api-login-using-devise/

  def login
    if params[:email].blank? || params[:pass].blank?
      render json: {error: 'missing login or pass'}
      return
    end

    resource = User.find_for_database_authentication(email: params[:email])
    if !resource || !resource.valid_password?(params[:pass])
      warden.custom_failure!
      render json: {error: 'bad email or password'}
      return
    end

    render json: {auth_token: resource.authentication_token, user_type: resource.user_type}
  end

end
