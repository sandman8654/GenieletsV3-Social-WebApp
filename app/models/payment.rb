class Payment < ActiveRecord::Base

  belongs_to :landlord, class_name: 'User', foreign_key: :user_id
  belongs_to :contract
  belongs_to :property

  STATUS_UNPAID = 'Unpaid'
  STATUS_PAID = 'Paid'
  STATUS_PENDING = 'Pending'
  STATUS_REFUNDED = 'Refunded'

  PAID_PAYPAL = 'Paypal'
  PAID_CASH = 'Cash'
  PAID_CHEQUE = 'Cheque'

  validates :status, :inclusion => {:in => [STATUS_PAID, STATUS_UNPAID, STATUS_PENDING, STATUS_REFUNDED]}
  validates :paid_type, :inclusion => {:in => [nil, PAID_PAYPAL, PAID_CASH, PAID_CHEQUE]}

  scope :paid, -> { where(status: STATUS_PAID) }
  scope :pending, -> { where(status: STATUS_PENDING) }
  scope :refunded, -> { where(status: STATUS_REFUNDED) }
  scope :outstanding, -> { where(status: STATUS_UNPAID) }
  scope :year, lambda { |year| where('extract(year from due_date) = ?', year) }
  scope :overdue, -> { where('due_date < ?', Date.today) }
  scope :due_soon, -> { where('DATEDIFF(payments.due_date, NOW()) < 4') }

  def paid?
    self.status == STATUS_PAID
  end

  def pending?
    self.status == STATUS_PENDING
  end

  def outstanding?
    self.status == STATUS_UNPAID
  end

  def precise_amount
    '%.2f' % amount
  end

end
