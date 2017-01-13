module VisitorsHelper
  def visitor_status_class action
    if params[:action] == action
      "active"
    else
      ""
    end
  end
end