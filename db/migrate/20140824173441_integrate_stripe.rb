class IntegrateStripe < ActiveRecord::Migration
  def change
    add_column :users, :customer_id, :string, default: nil
    add_column :users, :subscription_id, :string, default: nil
    add_column :users, :contract_max_count, :integer, default: 0
    add_column :users, :is_active, :boolean, default: false
    add_column :users, :subscription_type, :string, default: "Trial"
    add_column :users, :subscribed_date, :date
    add_column :users, :contract_count, :integer, default: 0

    add_column :contracts, :paused, :boolean, default: false
    add_column :payments, :paused, :boolean, default: false
  end
end
