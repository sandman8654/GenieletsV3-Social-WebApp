class ChangeDefaultUserOptions < ActiveRecord::Migration
  def change
    change_column :users, :is_active, :boolean, :default => true
    change_column :users, :contract_max_count, :integer, default: 5
    change_column :users, :subscribed_date, :date, default: Date.today

    User.where(subscription_type: "Trial").update_all(is_active: true, contract_max_count: 5, subscribed_date: Date.today)
  end
end
