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
    run "mkdir -p #{shared_path}/config" 
    run "cp #{current_path}/config/admin_login.example.yml #{shared_path}/config/admin_login.yml" 
    run "cp #{current_path}/config/nginx.example.yml #{shared_path}/config/nginx.yml" 
    run "cp #{current_path}/config/unicorn_init.example.yml #{shared_path}/config/unicorn_init.yml" 
  end
  after "deploy:setup", "deploy:create_config_files"

  task :symlink_config_files do
    run "ln -nfs #{shared_path}/config/admin_login.yml #{release_path}/config/admin_login.yml" 
  end
  after "deploy:update_code", "deploy:symlink_config_files" 

  task :setup_config, roles: :app do
    sudo "ln -nfs #{shared_path}/config/nginx.conf /etc/nginx/sites-enabled/#{application}"
    sudo "ln -nfs #{shared_path}/config/unicorn_init.sh /etc/init.d/unicorn_#{application}"
  end
  after "deploy:create_config_files", "deploy:setup_config"
  
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


namespace :db do
  desc "Create mongoid yaml in shared path" 
  task :default do
    run "mkdir -p #{shared_path}/config" 
    run "cp #{current_path}/config/mongoid.example.yml #{shared_path}/config/mongoid.yml" 
  end
  after "deploy:setup", :db

  desc "Make symlink for mongoid yaml" 
  task :symlink do
    run "ln -nfs #{shared_path}/config/mongoid.yml #{release_path}/config/mongoid.yml" 
  end
  after "deploy:update_code", "db:symlink" 
end

