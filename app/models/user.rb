class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :trackable, :validatable, :token_authenticatable

  has_attached_file :avatar,
                    :styles => {
                        :medium => "150x150>",
                        :thumb => "30x30>"
                    },
                    :default_url => "avatar_:style.jpg"
  validates_attachment_content_type :avatar, :content_type => /\Aimage\/.*\Z/
  validates_attachment_size :avatar, less_than: 2.megabytes

  has_many :properties
  has_many :payments

  has_many :connections
  has_many :contracts, class_name: 'Contract', foreign_key: :landlord_id
  has_many :connected_users, through: :connections, source: :connected_user
  has_many :inverse_connections, class_name: 'Connection', foreign_key: :connection_id
  has_many :inverse_connection_users, class_name: 'User', through: :inverse_connections, source: :user
  has_many :private_payments

  scope :landlords, -> { where(user_type: LANDLORD) }
  scope :tenants, -> { where(user_type: TENANT) }

  LANDLORD  = 'landlord'
  TENANT    = 'tenant'

  def landlord?; user_type == LANDLORD end
  def tenant?; user_type == TENANT end

  def name
    name = "#{self.first_name} #{self.middle_name} #{self.last_name}"
    name.presence || "#{self.email}"
  end

  def phone
    self.primary_phone.presence || self.secondary_phone.presence || 'N/A'
  end

  def address
    [self.address1, self.address2, self.city, self.state, self.country].reject(&:blank?).join('<br/>').html_safe.presence || 'N/A'
  end

  def all_contracts
    Contract.where('landlord_id = ? OR tenant_id = ?', self.id, self.id)
  end

  def active_contracts
    contracts = Contract.joins(:connection)
                        .where('landlord_id = ? OR tenant_id = ?', self.id, self.id).where('connections.approved = true')
  end

  def finished_contracts
    Contract.finished.where('landlord_id = ? OR tenant_id = ?', self.id, self.id)
  end

  def all_connections
    Connection.where('user_id = ? OR connection_id = ?', self.id, self.id)
  end

  def approved_connections
    Connection.where('user_id = ? OR connection_id = ?', self.id, self.id).approved
  end

  def pending_connections
    Connection.where('user_id = ? OR connection_id = ?', self.id, self.id).pending
  end

  def plan_start_date
    subscription_type != 'Trial' ? subscribed_date || created_at : created_at
  end

  def plan_end_date
    if subscription_type == 'Trial'
      plan_start_date + 3.months
    else
      plan_start_date + 1.months
    end
  end

  def subscription_expired?
    days = Date.today.mjd - plan_end_date.to_date.mjd
    if days == 0
      self.subscription_type = 'Trial'
      self.contract_max_count = 0
      self.is_active = false
      self.subscribed_date = nil
      self.save
      return true
    end
    false
  end

  def self.check_subscription_expired
    User.landlords.each do |landlord|
      UserMailer.subscription_expired_email(landlord).deliver if landlord.subscription_expired?
    end
  end

  def self.check_overdue_payments
    User.tenants.each do |tenant|
      payments = Payment.where('contracts.tenant_id = ?', tenant.id).overdue.joins(:contract).order(:contract_id, :due_date)
      all_payments = payments.outstanding + payments.refunded
      UserMailer.overdue_payments_email(tenant, all_payments.map(&:id)).deliver if all_payments.count > 0
    end
  end

  def self.check_due_soon_payments
    User.tenants.each do |tenant|
      all_payments = Payment.where('contracts.tenant_id = ?', tenant.id).due_soon.joins(:contract).order(:contract_id, :due_date)
      UserMailer.duesoon_payments_email(tenant, payments.map(&:id)).deliver if all_payments.count > 0
    end
  end

  def self.check_landlord_signed_up
    User.tenants.each do |tenant|
      tenant.pending_connections.each do |connection|
        email = connection.connected_user_info(tenant)[:email]
        name = connection.connected_user_info(tenant)[:name]
        landlord = User.find_by_email(email)
        if landlord.nil?
          UserMailer.auto_advertise_tenant(email, name, tenant).deliver
        end
      end
    end
  end

  def self.check_tenant_signed_up
    User.landlords.each do |landlord|
      landlord.pending_connections.each do |connection|
        email = connection.connected_user_info(landlord)[:email]
        name = connection.connected_user_info(landlord)[:name]
        tenant = User.find_by_email(email)
        if tenant.nil?
          UserMailer.auto_advertise_landlord(email, name, landlord).deliver
        end
      end
    end
  end
end
