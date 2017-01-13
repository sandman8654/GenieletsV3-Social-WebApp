class PrivatePayment < ActiveRecord::Base

  belongs_to :user
  belongs_to :property

  validates_presence_of :user_id, :property_id

  def precise_amount
    '%.2f' % amount
  end

end
