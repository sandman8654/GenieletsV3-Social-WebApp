class ChangeDefaultSubscribedDateValue < ActiveRecord::Migration
  def change
    change_column :users, :subscribed_date, :date, :default => nil
  end
end
