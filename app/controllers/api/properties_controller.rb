class Api::PropertiesController < Api::ApiController
  before_action :require_user

  def index
    @user = current_user
    @properties = if @user.landlord?
                    @user.properties
                  else
                    @user.active_contracts.map(&:property)
                  end
    render json: @properties.map { |prop| {
        name: prop.name,
        property_type: prop.property_type,
        room_count: prop.room_count,
        rental: (prop.rental if @user.landlord?),
    }.compact }
  end

end
