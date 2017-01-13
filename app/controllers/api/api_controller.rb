module Api
  class ApiController < ApplicationController
    before_action :set_default_response_format
    after_action :api_fixes


    private

    def set_default_response_format
      request.format = :json
    end

    def api_fixes
      response.headers.except!('X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection')
      response.headers['Cache-Control'] = 'no-cache, no-store, max-age=0, must-revalidate'
      response.headers['Pragma'] = 'no-cache'
      response.headers['Expires'] = 'Fri, 01 Jan 1990 00:00:00 GMT'
    end

    protected

    def require_user
      if !current_user
        render json: {error: 'User Auth Token required'}
      end
    end

  end
end
