class ChargesController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def create
    landlord = current_user

    if landlord.customer_id.blank?
      customer = Stripe::Customer.create(
          :email => landlord.email,
          :card => params[:stripeToken],
          :plan => params[:plan_type]
      )
      landlord.customer_id = customer.id
      landlord.subscription_id = customer.subscriptions.data[0][:id]
      landlord.subscription_type = customer.subscriptions.data[0][:plan].id
      
      landlord.save
    else
      customer = Stripe::Customer.retrieve(landlord.customer_id)
      subscription = customer.subscriptions.retrieve(landlord.subscription_id)
      subscription.plan = params[:plan_type]
      subscription.save

      landlord.subscription_type = subscription[:plan].id
      landlord.save
    end

    redirect_to account_summary_path, :notice => "Subscription is in processing... "
  rescue Stripe::CardError => e
    flash[:error] = e.message
    redirect_to account_summary_path
  end

  def succeed
    event = JSON.parse(request.body.read)
    landlord = User.find_by_email(event['data']['object']['email'])
    render json: { error: 'Cannot find customer.' } and return if landlord.nil?
    if event['type'] == 'customer.created'
      landlord.customer_id = event['data']['object']['id']
      landlord.save
    elsif event['type'] == 'customer.subscription.created'
      landlord = User.find_by_customer_id(event['data']['object']['customer'])
      landlord.subscription_id = event['data']['object']['id']
      landlord.save
    elsif event['type'] == 'invoice.payment_succeeded'
      landlord = User.find_by_customer_id(event['data']['object']['customer'])
      info = Hash.new
      invoice_data = event['data']['object']['lines']['data'][0]
      info[:id] = SecureRandom.random_number(10**10)
      info[:plan] = invoice_data['plan']['name']
      info[:amount] = invoice_data['plan']['amount'].to_i / 100.0
      info[:currency] = invoice_data['plan']['currency']
      info[:interval] = invoice_data['plan']['interval']
      info[:description] = invoice_data['description']

      landlord.subscription_id = invoice_data['id']
      landlord.subscription_type = info[:plan]
      landlord.subscribed_date = Date.today
      landlord.is_active = true
      if landlord.subscription_type == "Standard"
        landlord.contract_max_count = 5
      elsif landlord.subscription_type == "Pro"
        landlord.contract_max_count = 10
      elsif landlord.subscription_type == "Enterprise"
        landlord.contract_max_count = -1
      else
        landlord.contract_max_count = 0
      end

      if landlord.contract_max_count != -1 && landlord.contract_count > landlord.contract_max_count
        contracts = landlord.contracts
        payments = landlord.payments
        contracts.update_all(paused: true)
        payments.update_all(paused: true)
        flash[:alert] = "All contracts are paused, please upgrade plan to resume contracts."
      elsif landlord.contract_max_count == -1 or landlord.contract_count <= landlord.contract_max_count
        contracts = landlord.contracts
        payments = landlord.payments

        contracts.update_all(paused: false)
        payments.update_all(paused: false)
      end
      landlord.save

      UserMailer.subscription_succeed_email(landlord.email, info, landlord).deliver unless landlord.nil?
      UserMailer.subscription_succeed_email("accounts@genielets.com", info, landlord).deliver unless landlord.nil?
    elsif event['type'] == 'invoice.payment_failed'
      landlord = User.find_by_customer_id(event['data']['object']['customer'])
      info = Hash.new
      invoice_data = event['data']['object']['lines']['data'][0]
      info[:id] = SecureRandom.random_number(10**10)
      info[:plan] = invoice_data['plan']['name']
      info[:amount] = invoice_data['plan']['amount'].to_i / 100.0
      info[:currency] = invoice_data['plan']['currency']
      info[:interval] = invoice_data['plan']['interval']
      info[:description] = invoice_data['description']

      landlord.subscription_id = ''
      landlord.subscription_type = 'Trial'
      landlord.is_active = false
      landlord.subscribed_date = nil
      landlord.contract_max_count = 0
      landlord.save

      contracts = landlord.contracts
      payments = landlord.payments

      contracts.update_all(paused: true)
      payments.update_all(paused: true)

      flash[:alert] = "All contracts and payments are paused. To resume subscribe the plan."

      UserMailer.subscription_failed_email(landlord.email, info, landlord).deliver unless landlord.nil?
      UserMailer.subscription_failed_email("accounts@genielets.com", info, landlord).deliver unless landlord.nil?
    elsif event['type'] == 'customer.subscription.updated'
      landlord = User.find_by_customer_id(event['data']['object']['customer'])

      landlord.subscription_id = event['data']['object']['id']
      landlord.subscription_type = event['data']['object']['plan']['name']
      if landlord.subscription_type == "Standard"
        landlord.contract_max_count = 5
      elsif landlord.subscription_type == "Pro"
        landlord.contract_max_count = 10
      elsif landlord.subscription_type == "Enterprise"
        landlord.contract_max_count = -1
      else
        landlord.contract_max_count = 0
      end
      landlord.save

      info = Hash.new
      invoice_data = event['data']['object']
      info[:old_plan] = event['data']['previous_attributes']['plan']['name']
      info[:plan] = invoice_data['plan']['name']
      info[:amount] = invoice_data['plan']['amount'].to_i / 100.0
      info[:currency] = invoice_data['plan']['currency']
      info[:interval] = invoice_data['plan']['interval']
      info[:description] = invoice_data['description']

      if landlord.contract_max_count != -1 && landlord.contract_count > landlord.contract_max_count
        contracts = landlord.contracts
        payments = landlord.payments
        contracts.update_all(paused: true)
        payments.update_all(paused: true)
      elsif landlord.contract_max_count == -1 or landlord.contract_count <= landlord.contract_max_count
        contracts = landlord.contracts
        payments = landlord.payments

        contracts.update_all(paused: false)
        payments.update_all(paused: false)
      end

      UserMailer.subscription_updated_email(landlord.email, info, landlord).deliver unless landlord.nil?
    else
    end
    render json: {status: 'OK'}
  end


end
