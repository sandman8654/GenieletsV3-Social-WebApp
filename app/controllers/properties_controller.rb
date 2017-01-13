class PropertiesController < ApplicationController

  before_filter :authenticate_user!

  def index
    if landlord?
      @properties = current_user.properties
    else
      @properties = current_user.active_contracts.map(&:property)
    end
  end

  def new
    @property = current_user.properties.build
  end

  def create
    @property = current_user.properties.build permitted_property_params

    if @property.save
      redirect_to properties_path, notice: 'Property is successfully created.'
    else
      render :new
      # redirect_to new_property_path, alert: 'Failed to create property.'
    end
  end

  def edit
    @property = current_user.properties.find params[:id]
  end

  def show
    @property = current_user.properties.find params[:id]
  end

  def update
    @property = current_user.properties.find params[:id]

    if @property.update_attributes permitted_property_params
      redirect_to properties_path, notice: 'Property is successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @property = current_user.properties.find params[:id]

    if @property.destroy
      redirect_to properties_path, notice: 'Property was successfully deleted.'
    else
      redirect_to properties_path, notice: 'Failed to delete property.'
    end
  end

  private

  def permitted_property_params
    params.require(:property)
          .permit(
              :property_type, :room_count, :rental, :notes, :address1, :address2, :address3,
              :city, :state, :country, :postcode, :phone, :name
          )
  end

end