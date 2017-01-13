class ChangePaymentAmount < ActiveRecord::Migration
  def change
    change_column :payments, :amount, :decimal, precision: 5, scale: 2
    change_column :private_payments, :amount, :decimal, precision: 5, scale: 2
  end
end
