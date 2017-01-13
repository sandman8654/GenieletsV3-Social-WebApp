class CreateConnections < ActiveRecord::Migration
  def change
    create_table :connections do |t|
      t.integer :user_id
      t.integer :connection_id

      t.string :tenant_email
      t.string :landlord_email
      t.string :tenant_first_name
      t.string :tenant_middle_name
      t.string :tenant_last_name
      t.string :tenant_phone
      t.string :tenant_address

      t.boolean :approved
      t.text :notes

      t.timestamps
    end
  end
end
