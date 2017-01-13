class Contract < ActiveRecord::Base

  belongs_to :landlord, class_name: 'User', foreign_key: :landlord_id
  belongs_to :tenant, class_name: 'User', foreign_key: :tenant_id
  belongs_to :property
  belongs_to :connection
  has_many :payments, dependent: :destroy

  validates_presence_of :property_id, :start_date, :end_date, :room_number, :rental, :pay_date
  validates_presence_of :connection, :property

  default_scope -> { where('finished_at is null') }

  scope :finished, -> { unscoped.where('finished_at is not null') }
  scope :started_this_month, -> { unscoped.where('created_at >= ? && created_at < ?', Date.today.beginning_of_month, Date.today.beginning_of_month + 1.month) }
  scope :finished_this_month, -> { finished.where('finished_at >= ? && finished_at < ?', Date.today.beginning_of_month, Date.today.beginning_of_month + 1.month) }

  def period
    "#{self.start_date.strftime("%Y-%m-%d")} ~ #{self.end_date.strftime("%Y-%m-%d")}"
  end

  def tenant_info current_user
    connection.nil? ? {} : self.connection.connected_user_info(current_user)
  end

  def rental_amount
    '%.2f' % rental
  end

end
