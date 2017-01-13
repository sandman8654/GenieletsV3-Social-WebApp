module SessionsHelper
  def signup_type_class checkbox, type
    if checkbox == type
      "checked"
    else
      ""
    end
  end
end