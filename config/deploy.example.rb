require "bundler/capistrano"

set :application, "checkin"

set :scm, :git
set :repository,  "git@github.com:molawson/checkin.git"
set :deploy_via, :remote_cache

set :user, "deploy"
set :use_sudo, false
set :deploy_to, "/var/apps/#{application}/"

default_run_options[:pty] = true
ssh_options[:forward_agent] = true

role :web, "your web-server here"                          # Your HTTP server, Apache/etc
role :app, "your app-server here"                          # This may be the same as your `Web` server
role :db,  "your primary db-server here", :primary => true 


after "deploy", "deploy:cleanup" # keep only the last 5 releases

namespace :deploy do
  %w[start stop restart].each do |command|
    desc "#{command} unicorn server"
    task command, roles: :app, except: {no_release: true} do
      run "/etc/init.d/unicorn_#{application} #{command}"
    end
  end
  
  task :create_config_files do
    default_admin_login = <<-EOF
    USERNAME: #{user}
    PASSWORD: #{password}
    EOF
    
    admin_login = ERB.new(default_admin_login)

    run "mkdir -p #{shared_path}/config" 
    put admin_login.result, "#{shared_path}/config/admin_login.yml"
  end

  task :symlink_config_files do
    run "ln -nfs #{shared_path}/config/admin_login.yml #{release_path}/config/admin_login.yml" 
  end

  task :setup_config, roles: :app do
    sudo "ln -nfs #{current_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}"
    sudo "ln -nfs #{current_path}/config/unicorn_init.sh /etc/init.d/unicorn_#{application}"
  end
  after "deploy:setup", "deploy:setup_config"
  
  desc "Make sure local git is in sync with remote."
  task :check_revision, roles: :web do
    unless `git rev-parse HEAD` == `git rev-parse origin/master`
      puts "WARNING: HEAD is not the same as origin/master"
      puts "Run `git push` to sync changes."
      exit
    end
  end
  before "deploy", "deploy:check_revision"
end

before "deploy:setup", "deploy:create_config_files"
after "deploy:update_code", "deploy:symlink_config_files" 

namespace :db do
  desc "Create mongoid yaml in shared path" 
  task :default do
    default_template = <<-EOF
    development:
      sessions:
        default:
          database: checkin_development
          hosts:
            - localhost:27017
    production:
      sessions:
        default:
          database: checkin_production
          hosts:
            - localhost:27017
    test:
      sessions:
        default:
          database: checkin_test
          hosts:
            - localhost:27017
    EOF
    
    db_config = ERB.new(default_template)

    run "mkdir -p #{shared_path}/config" 
    put db_config.result, "#{shared_path}/config/mongoid.yml" 
  end

  desc "Make symlink for mongoid yaml" 
  task :symlink do
    run "ln -nfs #{shared_path}/config/mongoid.yml #{release_path}/config/mongoid.yml" 
  end
end

before "deploy:setup", :db
after "deploy:update_code", "db:symlink" 
