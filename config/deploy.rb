set :application, 'genielets-v2'
set :repo_url, 'git@github.com:GenieHub01/GL-V2.git'

# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }

# set :deploy_to, '/var/www/my_app'
# set :scm, :git
# set :password, ask('Server password:', '')
set :ssh_options, {
   # auth_methods: %w(password),
   # user: 'deploy',
   # password: fetch(:password)
   keys: ['~/Downloads/Genielets2.pem']
}
server '52.16.8.129', user: 'deploy', roles: %w{web app db}, :primary => true
set :linked_files, %w{config/database.yml config/application.yml}
# set  :linked_dirs, %w{public/assets/clipone public/assets/clipone/css public/assets/clipone/fonts public/assets/clipone/images public/assets/clipone/js  public/assets/clipone/less public/assets/clipone/plugins}
# set :linked_dirs, %w{bin log tmp}
# set :format, :pretty
# set :log_level, :debug
set :pty, true

# set :linked_files, %w{config/database.yml}
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# set :default_env, { path: "/opt/ruby/bin:$PATH" }
set :rvm_type, :user
set :rvm_ruby_version, '2.1.2'
set :keep_releases, 1

namespace :deploy do

  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      # Your restart mechanism here, for example:
      execute :touch, release_path.join('tmp/restart.txt')
    end
  end

  # after :publishing, :restart

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # execute(:bundle, :install)
      # ex "cd #{current_path} && bundle install RAILS_ENV=production"
      # run "cd #{current_path} && bundle exec rake assets:precompile RAILS_ENV=production"
    end
  end

  desc "tail log files"
  task :tail do
    on roles(:app), in: :sequence do
      run "tail -f -n 150 #{shared_path}/log/#{rails_env}.log" do |channel, stream, data|
        puts "#{channel[:host]}: #{data}"
        break if stream == :err
      end
    end
  end

  desc "tail log files"
  task :clear_logs do
    on roles(:app), in: :sequence do
      # run "cd #{current_path} && bundle exec rake log:clear RAILS_ENV=#{rails_env}"
    end
  end

  after :finishing, 'deploy:cleanup'

end

# MANUAL DEPLOY:
# git pull origin master
# bundle install
# rake db:migrate
# rake assets:precompile
# sudo service nginx restart