class CreateAdminService
  def call
    user = User.find_or_create_by!(email: Rails.application.secrets.landlord_email, user_type: User::LANDLORD) do |user|
      user.password = Rails.application.secrets.landlord_password
      user.password_confirmation = Rails.application.secrets.landlord_password
      user.confirm!
    end
    user = User.find_or_create_by!(email: Rails.application.secrets.tenant_email, user_type: User::TENANT) do |user|
      user.password = Rails.application.secrets.tenant_password
      user.password_confirmation = Rails.application.secrets.tenant_password
      user.confirm!
    end
    AdminUser.find_or_create_by(email: Rails.application.secrets.admin_email) do |admin|
      admin.password = Rails.application.secrets.admin_password
      admin.password_confirmation = Rails.application.secrets.admin_password
    end
  end
end
