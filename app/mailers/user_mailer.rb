class UserMailer < ActionMailer::Base
  default from: 'noreply@genielets.com'
  layout 'mailer'

  def welcome_email(user)
    @user = user
    mail(to: @user.email, subject: 'Welcome To Genielets')
  end

  def close_email(user)
    @user = user
    mail(to: @user.email, subject: 'Hope to see you again!')
  end

  def add_tenant_email(conn, landlord)
    @conn = conn
    @landlord = landlord
    mail(to: @conn.connected_user_info(landlord)[:email], subject: 'Hey! Landlord wants you on Genielets.')
  end

  def tenant_connection_approve_email(conn, landlord)
    @conn = conn
    @landlord = landlord
    mail(to: @conn.connected_user_info(landlord)[:email], subject: 'Hey! Landlord wants you on Genielets.')
  end

  def add_landlord_email(conn, tenant)
    @conn = conn
    @tenant = tenant
    mail(to: @conn.connected_user_info(tenant)[:email], subject: 'Hey! Tenant wants you on Genielets.')
  end

  def landlord_connection_approve_email(conn, tenant)
    @conn = conn
    @tenant = tenant
    mail(to: @conn.connected_user_info(tenant)[:email], subject: 'Hey! Tenant wants you on Genielets.')
  end

  def subscription_failed_email(addr, invoice)
    @invoice = invoice
    mail(to: addr, subject: 'Genielets Subscription failed invoice.')
  end

  def subscription_succeed_email(addr, invoice, landlord)
    @invoice = invoice
    @landlord = landlord
    mail(to: addr, subject: 'Genielets Subscription succeed invoice.')
  end

  def subscription_updated_email(addr, invoice, landlord)
    @invoice = invoice
    @landlord = landlord
    mail(to: addr, subject: 'You upgraded subscription plan.')
  end

  def contact_us_email(visitor_info)
    @visitor_info = visitor_info
    mail(to: 'support@genielets.com', subject: 'Need support for Genielets')
  end

  def subscription_expired_email(landlord)
    @landlord = landlord
    mail(to: landlord.email, subject: 'Subscription has been expired!')
  end

  def overdue_payments_email(tenant, payment_ids)
    @tenant = tenant
    @payments = Payment.where(id: payment_ids)
    mail(to: @tenant.email, subject: 'Overdue payments on Genielets')
  end

  def duesoon_payments_email(tenant, payment_ids)
    @tenant = tenant
    @payments = Payment.where(id: payment_ids)
    mail(to: @tenant.email, subject: 'Due soon payments on Genielets')
  end

  def tenant_paid_email(payment)
    @payment = payment
    mail(to: @payment.contract.landlord.email, subject: 'Tenant marked payment on Genielets')
  end

  def payment_success_email(payment)
    @payment = payment
    mail(to: @payment.contract.landlord.email, subject: 'Tenant Rent Payment Received - Genielets')
  end

  def landlord_accept_email(payment)
    @payment = payment
    @tenant_info = @payment.contract.tenant_info(User.find(@payment.contract.landlord.id))
    mail(to: @tenant_info[:email], subject: 'Marked Payments - Genielets')
  end

  def auto_advertise_tenant(email, name, landlord)
    @landlord = landlord
    @name = name
    mail(to: email, subject: 'Reminder for signup - Genielets')
  end

  def auto_advertise_landlord(email, name, tenant)
    @tenant = tenant
    @name = name
    mail(to: email, subject: 'Reminder for signup - Genielets')
  end
end
