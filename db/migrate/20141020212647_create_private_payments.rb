class CreatePrivatePayments < ActiveRecord::Migration
  def change
    create_table :private_payments do |t|

      t.references :user
      t.references :property

      t.decimal :amount
      t.date :date_paid

      t.timestamps
    end
  end
end
