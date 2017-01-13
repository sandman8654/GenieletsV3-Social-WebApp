class Property < ActiveRecord::Base

  PROPERTY_TYPES = ['Residential', 'Commercial']

  belongs_to :user
  belongs_to :contract

  has_many :private_payment

  validates :property_type, inclusion: {in: PROPERTY_TYPES}
  validates_presence_of :room_count, :rental, :address1, :name

  def address
    [self.address1, self.address2, self.city, self.state, self.country].reject(&:blank?).join('<br/>').html_safe.presence || 'N/A'
  end

end
