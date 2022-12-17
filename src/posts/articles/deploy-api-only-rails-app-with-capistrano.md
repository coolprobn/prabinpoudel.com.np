---
title: 'Deploy API only Rails App with Capistrano'
date: 2022-12-04
path: /articles/deploy-api-only-rails-app-with-capistrano/
excerpt: "Capistrano provides a one line command deployment to remote servers. In this tutorial, we will be looking at how we can setup capistrano with our Rails application and deploy the app to remote server."
image: ../../images/articles/deploy-api-only-rails-app-with-capistrano.webp
categories: [articles]
tags: [ruby on rails]
toc: true
featured: false
comments: true
---

Capistrano is a deployment automation tool built on Ruby, Rake, and SSH. It allows you to deploy your app to a remote server in a single command after initial configurations are done.

Deployment with capistrano is as easy as `cap production deploy`. But to be able to hit this command, a lot of configurations need to be added first.

Today we will be looking into setting up capistrano in our API only Rails application for making it easier to deploy to any remote server.

## Skills required to follow the tutorial

Intermediate:

- Rails
- Linux skills to work with commands in server where your app has been deployed

## You should have

- Existing Rails app
- Linux server already setup to run Rails app

_NOTE_:

I am using rbenv for ruby so all configurations will be based on that, you can replace it as required for your version manager as required e.g. for rvm.

## Step 1: Install Capistrano Gems

Add the following to your Gemfile under development group

```ruby
group :development do
  gem "capistrano"
  gem "capistrano-rails"
  gem 'capistrano-rbenv'
end
```

Run the following from command line:

```shell
$ bundle install
```

That should install the latest version of capistrano gems, now let's lock those versions by looking at Gemfile.lock, these versions were what I had in my lock file, yours could be different.

```ruby
group :development do
  gem "capistrano", "~> 3.17", require: false
  gem "capistrano-rails", "~> 1.6", require: false
  gem 'capistrano-rbenv', '~> 2.2', require: false
end
```

## Step 2: Generate default configuration files

Run the generator to create a basic set of configuration files:

```shell
$ bundle exec cap install
```

## Step 3: Require correct plugins in Capfile

Uncomment the following plugins in Capfile located at the root of the project

```ruby
  # require "capistrano/rvm"
  require 'capistrano/rbenv'
  # require "capistrano/chruby"
  require 'capistrano/bundler'
  require "capistrano/rails/assets"
  require 'capistrano/rails/migrations'
  # require 'capistrano/passenger'
```

## Step 4: Update Deploy file

Update the deploy file at `config/deploy.rb` with values as required:

1. application: Set to the application name or project name
2. repo_url: Set to the URL where your code is being stored, you can normally get this with `git remote -v` and copy the URL of origin 
3. linked_files: Set to a list of files that should be shared and persisted over all releases, for e.g. config/database.yml, config/master.key, config/application.yml, etc. These files will not be deleted/reset in every release (other files will!!)
4. linked_dirs: Set to a list of folders that should be shared and persisted over all releases, for e.g. log, tmp/pids, node_modules, etc. These folders will not be deleted/reset in every release (other folders will!!)
5. keep_releases: Set to a number of previous releases you want to keep in the server after each release, I normally keep this to 3.
6. conditionally_migrate: Skip migration if files in "db/migrate" were not modified. I normally set this to "true" but default is "false"

Your deploy file could look something like below:

```ruby
# frozen_string_literal: true

# config valid for current version and patch releases of Capistrano
lock '~> 3.17.0'

set :application, 'contract-template-editor-api'
set :repo_url, 'git@github.com:truemark/contract-template-editor/api.git'

# Default value for :linked_files is []
set :linked_files, %w[config/application.yml config/database.yml config/master.key]

# Default value for linked_dirs is []
set :linked_dirs, %w[log tmp/pids tmp/cache tmp/sockets vendor/bundle .bundle public/system public/uploads node_modules]

# Default value for keep_releases is 5
set :keep_releases, 3

# Skip migration if files in db/migrate were not modified
# Defaults to false
set :conditionally_migrate, true
```

## Step 5: Update environment specific deploy files

I have normally worked on projects that has staging and production environment and configuration files for these two environment is provided default by Capistrano; each environment specific file is located under `config/deploy/{environment}.rb`.

In these files, there should be configurations that can change based on the environment of the Rails application.

Configurations for each environment will be the same with different value based on the environment e.g. server ip address will be different in production and staging. 

We will only be looking at `config/deploy/production.rb` in this tutorial.

Update the deploy file at `config/deploy/production.rb` with values as required:

1. server: IP address of the server where you will deploy the app. It is a good idea to sore this value inside env file or rails credentials and take it from there.
2. user: name of the user in the server, normally it will be "deploy" but could be username e.g. prabin
3. roles: list of accessible roles for this user
4. deploy_to: path of the folder to deploy your app to, you can get the path by logging in to the server, going to the folder you want your app to be deployed to and enter the command `pwd`. If you haven't created the folder yet, you can create one e.g. contract-template-api and set the path of that folder.
5. branch: git branch that will be used to deploy the app, normally "main" or "master"
6. stage: environment of the app, should be "production"
7. rails_env: same as stage, should be "production"

Your file could look something like below:

```ruby
server ENV['deploy_server_ip'], user: 'deploy', roles: %w[app db web], primary: 'true'
set :deploy_to, 'path to the folder where app should be deployed e.g. /home/deploy/contract-template-editor/api'
set :branch, 'main'
set :stage, :production
set :rails_env, :production
```

## Step 6: Upload secret keys and files

Secret keys and files should never be committed to git. These files are required for app to function properly. Normally these files are always configured in the developer's machine so they can be uploaded directly from the project to the server using ssh.

Create a new rake task at `lib/capistrano/tasks/config_files.rake` and add the following content:

```ruby
namespace :config_files do
  desc 'Upload yml files inside config folder'
  task :upload do
    on roles(:app) do
      execute "mkdir -p #{shared_path}/config"

      upload! StringIO.new(File.read('config/database.yml')), "#{shared_path}/config/database.yml"
      upload! StringIO.new(File.read('config/application.yml')), "#{shared_path}/config/application.yml"
      upload! StringIO.new(File.read('config/master.key')), "#{shared_path}/config/master.key"
    end
  end
end
```

We now need to tell capistrano to run this code during deployment, add the following to the end of `config/deploy.rb`

```ruby
# ================================================
# ============ From Custom Rake Tasks ============
# ================================================
# ===== See Inside: lib/capistrano/tasks =========
# ================================================

# upload configuration files
before 'deploy:starting', 'config_files:upload'
```

## Step 7: Create a database if deploying for the first time

Create a new rake task at `lib/capistrano/tasks/database.rake` and add the following content:

```ruby
namespace :database do
  desc 'Create the database'
  task :create do
    on roles(:app) do
      within release_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'db:create'
        end
      end
    end
  end
end
```

We now need to tell capistrano to run this code during deployment, add the following to the end of the deploy file.

```ruby
# set this to false after deploying for the first time 
set :initial, true

# run only if app is being deployed for the very first time, should update "set :initial, true" above to run this
before 'deploy:migrate', 'database:create' if fetch(:initial)
```

## Step 8: Reload the Rails application after successful deploy

Create a new rake task at `lib/capistrano/tasks/application.rake` and add the following content:

```ruby
namespace :application do
  desc 'Reload application'
  task :reload do
    desc 'Reload app after deployment'
    on roles(:app), in: :sequence, wait: 5 do
      execute :touch, release_path.join('tmp/restart.txt')
    end
  end
end
```

We now need to tell capistrano to run this code during deployment, add the following to the end of the deploy file.

```ruby
# reload application after successful deploy
after 'deploy:publishing', 'application:reload'
```

## Final file

Your final "config/deploy.rb" file should look similar to this:

```ruby
# frozen_string_literal: true

# config valid for current version and patch releases of Capistrano
lock '~> 3.17.0'

set :application, '{project name}'
set :repo_url, '{remote git repository where project for the code is stored}'

# Default value for :linked_files is []
append :linked_files, %w[config/application.yml config/database.yml config/master.key]

# Default value for linked_dirs is []
append :linked_dirs, %w[log tmp/pids tmp/cache tmp/sockets vendor/bundle .bundle public/system public/uploads node_modules]

# Default value for keep_releases is 5
set :keep_releases, 3

# Skip migration if files in db/migrate were not modified
# Defaults to false
set :conditionally_migrate, true

# ================================================
# ============ From Custom Rake Tasks ============
# ================================================
# ===== See Inside: lib/capistrano/tasks =========
# ================================================

# upload configuration files
before 'deploy:starting', 'config_files:upload'

set :initial, true

# run only if app is being deployed for the very first time, should update "set :initial, true" above to run this
before 'deploy:migrate', 'database:create' if fetch(:initial)

# reload application after successful deploy
after 'deploy:publishing', 'application:reload'
```

## Deploy the app

From the command line you can now deploy the app to production using the following command:

```shell
cap production deploy
```

The app should be deployed in around 5-10 minutes, if you encounter any error while deploying and need any help, please post a comment below and I will do my best to help you resolve it.

## Bonus 1: Whenever for cron jobs

<a href="https://github.com/javan/whenever" target="_blank" rel="noopener">whenever gem</a> is used in Rails applications to schedule cron jobs e.g. send email notification about monthly expenditure on the 1st of each month.

Add the following to the deploy file just below "set :conditionally_migrate, true":

```ruby
# Skip migration if files in db/migrate were not modified
# Defaults to false
set :conditionally_migrate, true

# Set unique identifier for background jobs
set :whenever_identifier, -> { "#{fetch(:application)}_#{fetch(:stage)}" }
```

whenever_identifier should be set to unique identifier for cron jobs, this is required if you have deployed multiple applications to same server (normally for staging servers) that require whenever gem so that those applications don't clash with one another for cron jobs. This is optional if you only have one application in the  server.

Create a new rake task at `lib/capistrano/tasks/whenever.rake` and add the following content which will be responsible for updating cron tasks configured inside the "config/schedule.rb":

```ruby
namespace :whenever do
  desc 'Update cron job'
  task :update_crontab do
    on roles(:app) do
      within current_path do
        execute :bundle, :exec, "whenever --update-crontab #{fetch :whenever_identifier} --set 'environment=#{fetch(:stage)}'"
      end
    end
  end
end
```

We now need to tell capistrano to run this code during deployment, add the following to the deploy file just below "before 'deploy:migrate', 'database:create' if fetch(:initial)":

```ruby
# run only if app is being deployed for the very first time, should update "set :initial, true" above to run this
before 'deploy:migrate', 'database:create' if fetch(:initial)

# update cron job from whenever schedule file at "config/schedule.rb"
after 'deploy:finishing', 'whenever:update_crontab'
```

## Bonus 2: Sidekiq for background jobs

<a href="https://github.com/mperham/sidekiq" target="_blank" rel="noopener">Sidekiq gem</a> is used in Rails applications to schedule background jobs so as to perform them at a later point without having to stop the execution of other codes.

### Capistrano Configurations

Create a new rake task at `lib/capistrano/tasks/sidekiq.rake` and add the following content which will be responsible for updating cron tasks configured inside the "config/schedule.rb":

```ruby
namespace :sidekiq do
  desc 'Quieten sidekiq'
  task :quiet do
    on roles(:app) do
      puts capture("pgrep -f 'sidekiq' | xargs kill -TSTP")
    end
  end

  desc 'Restart Sidekiq'
  task :restart do
    on roles(:app) do
      execute :sudo, :systemctl, :restart, :sidekiq
      execute :sudo, :systemctl, 'daemon-reload'
    end
  end
end
```

We now need to tell capistrano to run this code during deployment, add the following to the deploy file just below "after 'deploy:publishing', 'application:reload'":

```ruby
# reload application after successful deploy
after 'deploy:publishing', 'application:reload'

# sidekiq related commands
after 'deploy:starting', 'sidekiq:quiet'
after 'deploy:reverted', 'sidekiq:restart'
after 'deploy:published', 'sidekiq:restart'
```

Now try to deploy the app to production and server will ask for password when running sidekiq commands. To fix that we need to add some more configurations in the remote server.

### Server Configurations

We are assuming that sidekiq is already configured in your remote server. If you have not configured it yet, you can refer to the section "Bonus: Setup Sidekiq in Ubuntu Server" at <a href="/articles/setup-active-job-with-sidekiq-in-rails/#bonus-setup-sidekiq-in-ubuntu-server" target="_blank">Setup Active Job with Sidekiq in Rails</a>

For capistrano to perform sudo actions without asking for the password, the user used by capistrano, normally "deploy" user should be in the sudo group and you should add commands that need to be executed in the server with sudo access but without using password to "/etc/sudoers" file.

1. Add deploy user to the sudo group
    
    You can add your deploy user to the sudo group with the following command

    ```shell
    # add "deploy" user to sudo group
    $ sudo usermod -aG sudo deploy

    # verify if the user has been added to the sudo group
    # result should include "sudo" for the deploy user
    $ groups deploy
    deploy : deploy sudo
    ```

2. Add commands required for the sidekiq restart and daemon-reload to be performed without password

    - Open the sudoers file for the edit with `sudo EDITOR=nano vimsudo`, this will ensure that the content inside the file is validated before saving so you don't end up with invalid file. If you do `sudo nano /etc/sudoers` then it doesn't validate the content so you should never do that.
    - Add the following below the line `root    ALL=(ALL:ALL) ALL` under "# User privilege specification"
    
    ```text
      deploy ALL=NOPASSWD: /bin/systemctl restart sidekiq
      deploy ALL=NOPASSWD: /bin/systemctl daemon-reload
    ```

3. You can try running above two commands now in the command line of the server and it should run normally without asking for password:

    ```shell
    $ sudo systemctl restart sidekiq
    # doesn't ask for the password and executes the command
    ``` 

Now if you try to deploy again, capistrano won't stop to ask password when running sidekiq commands.

## Conclusion

We have come to the finish line, now you should be able to deploy your API only Rails application to the server with one command.

Thanks for reading. Happy tinkering and happy coding!

## Image Credits

- Cover Image by <a href="https://unsplash.com/@nasa?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">NASA</a> on <a href="https://unsplash.com/s/photos/rocket?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
