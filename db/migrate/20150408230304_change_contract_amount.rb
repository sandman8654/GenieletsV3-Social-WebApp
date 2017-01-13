class ChangeContractAmount < ActiveRecord::Migration
  def change
    change_column :contracts, :rental, :decimal, precision: 5, scale: 2
  end
end
