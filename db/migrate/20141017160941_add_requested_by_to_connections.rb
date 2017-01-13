class AddRequestedByToConnections < ActiveRecord::Migration
  def change
  	add_column :connections, :requested_by, :int
  end
end
