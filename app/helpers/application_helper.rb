module ApplicationHelper
  def landlord?
    current_user.user_type == User::LANDLORD if user_signed_in?
  end

  def tenant?
    current_user.user_type == User::TENANT if user_signed_in?
  end

  def current_user_type
    current_user.user_type.humanize
  end

  def inverse_user_type
    if landlord?
      User::TENANT.humanize
    elsif tenant?
      User::LANDLORD.humanize
    end
  end

  def selected_menu controller, action
    if params[:controller] == controller && (action == '' || params[:action] == action)
      'active open'
    else
      ''
    end
  end

  def decimal_amount value
    '%.2f' % value
  end
end