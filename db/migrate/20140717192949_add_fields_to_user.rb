class AddFieldsToUser < ActiveRecord::Migration
  def change
    add_column :users, :first_name,       :string
    add_column :users, :middle_name,      :string
    add_column :users, :last_name,        :string
    add_column :users, :company_name,     :string
    add_column :users, :company_desc,     :string
    add_column :users, :vat_number,       :string
    add_column :users, :address1,         :string
    add_column :users, :address2,         :string
    add_column :users, :city,             :string
    add_column :users, :state,            :string
    add_column :users, :country,          :string
    add_column :users, :primary_phone,    :string
    add_column :users, :secondary_phone,  :string
    add_column :users, :gender,           :boolean
    add_column :users, :birthday,         :date
    add_column :users, :notes,            :text
    add_column :users, :secondary_email,  :string
    add_column :users, :user_type,        :string
    add_column :users, :paypal_email,     :string
    add_column :users, :bank_account_no,  :string
    add_column :users, :bank_name,        :string
    add_column :users, :bank_branch,      :string
    add_column :users, :currency,         :string
  end
end
