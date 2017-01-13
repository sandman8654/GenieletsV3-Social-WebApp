class VisitorsController < ApplicationController

  layout 'landing'

  def home
  end

  def about
  end

  def features
  end

  def rightmove
  end

  def vacancies
  end

  def policy
  end

  def videos
  end

  def pricing
  end

  def testimonials
  end

  def contactus
  end

  def send_contactus
    UserMailer.contact_us_email(params["visitor_info"]).deliver
    redirect_to contactus_path
  end

  def instruction
    send_file 'app/assets/data/GenieLets-Manual-V1.0-Rightmove-Zoopla - Copy.pdf', :type=>"application/pdf", :x_sendfile=>true
  end
end