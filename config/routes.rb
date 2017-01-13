Rails.application.routes.draw do
  
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)

  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  get 'payments/outstanding'

  get 'payments/paid'

  root to: 'visitors#home'

  devise_for :users, controllers: { registrations: 'registrations'}

  # landing pages
  get '/about', to: 'visitors#about', as: 'about'
  get '/features', to: 'visitors#features', as: 'features'
  get '/rightmove', to: 'visitors#rightmove', as: 'rightmove'
  get '/vacancies', to: 'visitors#vacancies', as: 'vacancies'
  get '/policy', to: 'visitors#policy', as: 'policy'
  get '/videos', to: 'visitors#videos', as: 'videos'
  get '/pricing', to: 'visitors#pricing', as: 'pricing'
  get '/testimonials', to: 'visitors#testimonials', as: 'testimonials'
  get '/contactus', to: 'visitors#contactus', as: 'contactus'
  post '/contactus', to: 'visitors#send_contactus', as: 'send_contactus'
  get '/instruction', to: 'visitors#instruction', as: 'instruction'

  # dashboard page
  get '/dashboard', to: 'dashboard#show', as: 'dashboard'

  # user account pages
  get '/profile', to: 'users#edit', as: 'profile'
  get '/account_summary', to: 'users#show', as: 'account_summary'
  post '/profile', to: 'users#update', as: 'update_profile'

  # properties
  resources :properties

  # connections
  get '/connections/new', to: 'connections#new', as: 'add_connection'
  post '/connections', to: 'connections#create', as: 'create_connection'
  get '/connections', to: 'connections#index', as: 'connections'
  get '/connections/approve/:id', to: 'connections#approve', as: 'approve_connection'
  delete '/connections/:id', to: 'connections#decline', as: 'decline_connection'

  # contracts
  resources :contracts
  get '/active_contracts', to: 'contracts#active_contracts', as: 'active_contracts'
  get '/finished_contracts', to: 'contracts#finished_contracts', as: 'finished_contracts'

  # payments
  get '/payments/outstanding', to: 'payments#outstanding', as: 'outstanding_payments'
  get '/payments/paid', to: 'payments#paid', as: 'paid_payments'
  delete '/payments/:id', to: 'payments#destroy', as: 'payment'
  get '/payments/:return_token/confirm', to: 'payments#confirm', as: 'payment_confirm'
  get '/payments/:id/accept', to: 'payments#accept', as: 'payment_accept'
  get '/payments/:id/refund', to: 'payments#refund', as: 'payment_refund'

  # private payments
  resources :private_payments

  # charges
  resources :charges
  post '/charge_succeed' => 'charges#succeed'

  namespace :api, defaults: {format: :json} do
    resource :auth, controller: :auth, only: [] do
      get :login, on: :collection
    end
    resource :dashboard, controller: :dashboard, only: [] do
      get :counts, on: :collection
    end
    resources :properties, only: [:index]
  end

end
