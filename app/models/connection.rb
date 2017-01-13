class Connection < ActiveRecord::Base

  belongs_to :user
  belongs_to :connected_user, class_name: 'User', foreign_key: :connection_id

  has_many :contracts, dependent: :destroy

  scope :pending, -> { where(approved: false) }
  scope :approved, -> { where(approved: true) }

  def valid_tenant?
    self.valid?
    if self.tenant_email.blank?
      errors.add :email, 'Missing Tenant Email address.'
    end

    !self.errors.any?
  end

  def valid_landlord?
    self.valid?
    if self.landlord_email.blank?
      errors.add :email, 'Missing Landloard Email address.'
    end

    !self.errors.any?
  end

  def connected_user_info current_user
    if current_user.id == user.try(:id)
      {id: id, name: connected_user.try(:name), email: connected_user.try(:email) || landlord_email, address: connected_user.try(:address), phone: connected_user.try(:phone) }
    elsif current_user.id == connected_user.try(:id)
      {id: user.try(:id), name: user.try(:name) || tenant_name, email: user.try(:email) || tenant_email, address: user.try(:address) || tenant_address, phone: user.try(:phone) || tenant_phone}
    else
      {}
    end
  end

  def tenant_name
    "#{self.tenant_first_name} #{self.tenant_middle_name} #{self.tenant_last_name}"
  end

  def update_user_id

  end

  def connected_contract
  end

end
