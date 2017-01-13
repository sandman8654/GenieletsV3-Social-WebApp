require 'test_helper'

class PaymentsControllerTest < ActionController::TestCase
  test "should get outstanding" do
    get :outstanding
    assert_response :success
  end

  test "should get paid" do
    get :paid
    assert_response :success
  end

end
