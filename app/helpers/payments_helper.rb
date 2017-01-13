module PaymentsHelper

  def paypal_url(payment, return_url)
    email = payment.contract.landlord.paypal_email
    email = payment.contract.landlord.email if email.blank?
    currency = payment.contract.landlord.currency
    currency = 'gpb' if currency.blank?
    values = {
        # get it form your http://sandbox.paypal.com account
        :business => email,
        :cmd => '_cart',
        :upload => 1,
        :return => return_url,
        :invoice => payment.id,
        :amount_1 => payment.amount,
        :currency_code => currency.upcase,
        :item_name_1 => 'GenieLets Rent Invoice ID: ' + payment.id.to_s,
        :item_number_1 => 'For Due Date: ' + payment.due_date.to_s,
        :quantity_1 => 1
    }
    "https://www.paypal.com/cgi-bin/webscr?" + values.to_query
  end

end
