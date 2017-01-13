class CreatePayments < ActiveRecord::Migration
  def change
    create_table :payments do |t|

      t.references :user
      t.references :contract
      t.references :property

      t.string :paid_type
      t.string :status
      t.string :return_token
      t.string :paypal_token
      t.decimal :amount
      t.date :due_date
      t.date :date_paid
      t.date :date_accepted
      t.date :date_refunded

      t.timestamps
    end
  end
end
