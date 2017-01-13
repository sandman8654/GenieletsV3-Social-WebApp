module UsersHelper

  def subscription_class subscription
    return '' if current_user.nil? || tenant?
    "pricing-table col-sm-4 col-xs-12 #{subscription == current_user.subscription_type ? 'featured' : ''}"
  end

end