class CreateProperties < ActiveRecord::Migration
  def change
    create_table :properties do |t|
      t.references :user

      t.string  :name
      t.string  :property_type
      t.integer :room_count
      t.decimal :rental
      t.text    :notes
      t.string  :address1
      t.string  :address2
      t.string  :address3
      t.string  :city
      t.string  :state
      t.string  :country
      t.string  :postcode
      t.string  :phone

      t.timestamps
    end
  end
end
