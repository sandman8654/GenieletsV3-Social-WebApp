class ConnectionsController < ApplicationController

  before_filter :authenticate_user!

  def index
    @connections = current_user.approved_connections
  end

  def new
    @connection = Connection.new

    if landlord?
      @pending_connections = current_user.inverse_connections.pending.where(requested_by: current_user.id)
      @request_connections = Connection.where(landlord_email: current_user.email, approved: false).where('requested_by != ?', current_user.id)
    elsif tenant?
      @request_connections = Connection.where(tenant_email: current_user.email, approved: false).where('requested_by != ?', current_user.id)
      @pending_connections = current_user.connections.pending.where(requested_by: current_user.id)
    end
  end

  def create
    if landlord?
      exist_connections = Connection.where(landlord_email: current_user.email, tenant_email: params[:connection][:tenant_email])
      if exist_connections.any?
        redirect_to add_connection_path, notice: 'You already have connections with this tenant. Please inspect list of tenants.' and return
      end
    else
      exist_connections = Connection.where(landlord_email: params[:connection][:landlord_email], tenant_email: current_user.email)
      if exist_connections.any?
        redirect_to add_connection_path, notice: 'You already have connections with this landlord. Please inspect list of landlords.' and return
      end
    end

    @connection = Connection.new permit_connection_params
    @connection.approved = false
    @connection.requested_by = current_user.id

    if landlord?
      @connection.connected_user = current_user
      @connection.landlord_email = current_user.email
      email = @connection.tenant_email
      tenant_user = User.find_by_email email
      if tenant_user.nil?
        if @connection.valid_tenant?
          @connection.approved = true
          @connection.save!

          UserMailer.add_tenant_email(@connection, current_user).deliver

          redirect_to add_connection_path, notice: 'Tenant is successfully added.' and return
        else
          redirect_to add_connection_path, :alert => 'Failed to add connection.' and return
        end
      elsif tenant_user.user_type == User::LANDLORD
        redirect_to add_connection_path, alert: "Tenant is already signed up with landlord" and return
      else
        @connection.user = tenant_user
        @connection.save

        UserMailer.tenant_connection_approve_email(@connection, current_user).deliver

        redirect_to add_connection_path, notice: 'Connection request is sent to tenant.' and return
      end
    elsif tenant?
      @connection.user = current_user
      @connection.tenant_email = current_user.email
      email = @connection.landlord_email
      landlord_user = User.find_by_email email
      if landlord_user.nil?
        if @connection.valid_landlord?
          @connection.approved = false
          @connection.save!

          # send request email
          UserMailer.add_landlord_email(@connection, current_user).deliver
          redirect_to add_connection_path, :notice => 'Connection request is sent to landlord.' and return
        else
          redirect_to add_connection_path, :alert => 'Failed to add connection.' and return
        end
      else
        UserMailer.landlord_connection_approve_email(@connection, current_user).deliver
        @connection.connected_user = landlord_user
        @connection.save

        redirect_to add_connection_path, notice: 'Landlord is successfully added.' and return
      end
    end
  end

  def approve
    @connection = Connection.find(params[:id])
    @connection.approved = true

    if landlord?
      @connection.connected_user = current_user
    elsif tenant?
      @connection.user = current_user
    end

    @connection.save

    redirect_to connections_path, notice: 'Connection is successfully approved.'
  end

  def decline
    @connection = Connection.find(params[:id])
    @connection.destroy

    #redirect_to add_connection_path, notice: 'Connection is declined.'
    redirect_to connections_path
  end

  private

  def permit_connection_params
    params.require(:connection).permit :tenant_first_name, :tenant_middle_name, :tenant_last_name,
                                        :tenant_email, :tenant_address, :tenant_phone,
                                        :landlord_email, :notes
  end

end