class CreateContracts < ActiveRecord::Migration
  def change
    create_table :contracts do |t|

      t.integer :tenant_id
      t.integer :landlord_id
      t.integer :property_id
      t.integer :connection_id

      t.integer :room_number
      t.date :start_date
      t.date :end_date
      t.date :finished_at, default: nil
      t.decimal :rental
      t.integer :pay_date
      t.text :notes

      t.timestamps
    end
  end
end
