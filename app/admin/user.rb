ActiveAdmin.register User do


  # See permitted parameters documentation:
  # https://github.com/activeadmin/activeadmin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  # permit_params :list, :of, :attributes, :on, :model
  #
  # or
  #
  # permit_params do
  #   permitted = [:permitted, :attributes]
  #   permitted << :other if resource.something?
  #   permitted
  # end

  scope :all, :default => true
  scope "Landlord" do |users|
    users.where("user_type = ?", User::TENANT)
  end
  scope "Tenant" do |users|
    users.where("user_type = ?", User::LANDLORD)
  end

  filter :email

  config.sort_order = "id_asc"

  csv do
    column :id
    column :email
    column :user_type
    column "Name" do |user|
      user.first_name.to_s + " " + user.middle_name.to_s + " " + user.last_name.to_s
    end
    column :user_type
  end

  index do
    selectable_column
    column :id
    column :email
    column :user_type
    column "Name" do |user|
      user.first_name.to_s + " " + user.middle_name.to_s + " " + user.last_name.to_s
    end
    column "Properties" do |user|
      user.properties.count
    end
    column "Contracts" do |user|
      if user.user_type == User::LANDLORD
        Contract.where('landlord_id = ?', user.id).count
      elsif user.user_type == User::TENANT
        Contract.where('tenant_id = ? ', user.id).count
      end
    end
    column :subscription_type
    column :subscribed_date
  end

  controller do
    def scoped_collection
      resource_class.where("user_type != 'Admin'")
    end
  end

end
