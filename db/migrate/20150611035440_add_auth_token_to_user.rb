class AddAuthTokenToUser < ActiveRecord::Migration
  def up
    add_column :users, :authentication_token, :string

    User.pluck(:id).each do |user_id|
      # user.reset_authentication_token!
      User.update(user_id, authentication_token: Devise.friendly_token)
    end

    add_index :users, [:authentication_token]
  end

  def down
    remove_column :users, :authentication_token
  end
end
