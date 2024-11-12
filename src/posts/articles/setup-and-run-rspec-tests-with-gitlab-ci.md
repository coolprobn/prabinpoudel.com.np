---
title: 'Setup RSpec Tests in Rails with Gitlab CI'
date: 2024-03-31
path: /articles/setup-and-run-rspec-tests-with-gitlab-ci/
excerpt: "Running tests in CI is a very important step to make sure there are no breaking changes in the new code. Today we will look at configuring Gitlab CI to run RSpec tests for Ruby on Rails applications."
image: ../../images/articles/setup-and-run-rspec-tests-with-gitlab-ci.jpeg
categories: [articles]
tags: [ruby on rails, rspec, gitlab ci]
toc: true
featured: false
comments: true
last_modified_at: 2024-11-12
---

At <a href="https://www.truemark.dev" target="_blank" rel="noopener">Truemark</a>, we are constantly looking to improve the code quality in our projects. And one way to do that is through the integration of CI into our workflow. CI can help in automating code reviews for linting and standard practices as well as for running tests to check if code change breaks any existing functionalities.

If you don't want to read the whole blog and just want the whole configuration automatically, you can do so using Zero Config Rails. Just hit the following command and you will be good to go:

```bash
$ gem install zcr-zen && zen add ci:gitlab_ci --app_test_framework=rspec
```

For the detailed list of configurations, you can visit <a href="https://generators.zeroconfigrails.com/install/gitlab_ci" target="_blank" rel="noopener">Gitlab CI Generator</a>.

Now without further ado, let's look at adding configurations to Gitlab CI for running RSpec tests in our Rails application.

## Assumption

- You have basic Gitlab CI configurations ready i.e. `.gitlab-ci.yml` exists in your project.
    If it doesn't, you can refer to my other article <a href="/articles/integrate-pronto-with-gitlab-ci-for-rails-app/">Integrate Pronto with Gitlab for Rails App</a>.
- You are using PostgreSQL in your app though with minimal changes it should also work for any other databases like MySQL and SQLite (let me know in comments if it doesn't and I will help you!)
- You are using RSpec as a test library but again with minimal changes it should work for MiniTest as well (let me know if it doesn't and I will help you!)

## Tested and working in

- Ruby 3.3.0
- Rails 7.1.3
- rspec-rails 6.1.1
- selenium-webdriver 4.18.1

## Configure Gitlab CI Variables

Firs of all, we need to add some configurations and files required by the CI to run tests. This should be done over at <a href="https://gitlab.com" target="_blank" rel="noopener">Gitlab</a>. Let's looks at them one by one.

### Add a variable for storing database.yml file content

It's not considered a good practice to use `config/database.yml` file for the CI so we will have to add a Gitlab CI variable and store the content required to setup PostgreSQL database inside it.

You can visit the <a href="https://docs.gitlab.com/ee/ci/variables/#project-cicd-variables" target="_blank" rel="noopener">official documentation</a> to know a way to setup variables. You have to go to your project's setting in Gitlab and configure these in CI/CD variables.

Create a new variable for this:

1. Type: File
2. Flags

    Uncheck all checklists here i.e. Protect variable, Mask variable and Expand variable reference
3. Description

	You can write "Database YML" but it's optional and you can skip this as "Key" (just below this) is already clear enough on what this variable is storing.
4. Key: `database_yml`

Lastly in "Value" add the following:

```yml
test:
  adapter: postgresql
  encoding: unicode
  host: postgres
  database: test_ci_db
  username: postgres
  password: postgres
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
```

For host make sure to use "postgres" instead of "localhost". For other services like MySQL and SQLite you will most probably have to use "mysql" or "sqlite" respectively as said in the <a href="https://docs.gitlab.com/ee/ci/runners/configure_runners.html#control-jobs-that-a-runner-can-run" target="_blank" rel="noopener">official documentation</a>:

> The service container for MySQL is accessible under the hostname mysql. To access your database service, connect to the host named mysql instead of a socket or localhost.

### Add a variable for storing environment variables

I normally use Figaro for storing environment variables which uses `config/application.yml` but just the plain `.env` file is also very popular. Anyway, just copy the content from whatever you are using and paste it inside the Value for this new variable.

Type, Flags and Description will be the same as described above for database.yml

You can add `env` for Key.

In "Value", add the copied content from your env file.

_NOTE_: Make sure to only copy what is under "test" block or ".env.test", you won't want to add production variables here as that will lead to security issues.

## Require selenium-webdriver

We need to enable selenium-webdriver that is required to run tests in the browser, especially system tests.

Add the following to `spec/rails_helper.rb` if it's not already there:

```
require "selenium-webdriver"
```

Note: Previously "webdrivers" gem was required to automate the installation and update browser specific drivers. But Selenium 4 ships with webdrivers now leading to the webdrivers being <a href="https://github.com/titusfortner/webdrivers" target="_blank" rel="noopener">deprecated</a>. Quoting the webdrivers Github:

> If you can update to the latest version of Selenium (4.11+), please do so and stop requiring this gem.

## Configure Capybara with Selenium

We will configure Selenium with Chrome to be used both in CI and Local with Headless mode (by default) while also allowing to run in the browser if needed for debugging.

Create a new file "spec/helpers/capybara.rb" and add the following code:

```ruby
Capybara.register_driver :selenium_chrome_custom do |app|
  options = Selenium::WebDriver::Chrome::Options.new

  options.add_argument("--headless=new") unless ENV["SELENIUM_HEADFUL"]

  options.add_argument("--window-size=1400,1400")
  options.add_argument("--no-sandbox")
  options.add_argument("--disable-dev-shm-usage")

  remote_url = ENV.fetch("SELENIUM_REMOTE_URL", nil)

  if remote_url
    Capybara::Selenium::Driver.new(
      app,
      browser: :remote,
      url: remote_url,
      options:
    )
  else
    Capybara::Selenium::Driver.new(app, browser: :chrome, options:)
  end
end

RSpec.configure do |config|
  config.before(:each, type: :system, js: true) do
    # Make the test app listen to outside requests, required for the remote Selenium instance
    Capybara.server_host = "0.0.0.0"

    if ENV.fetch("SELENIUM_REMOTE_URL", nil)
      # Use the application container's IP instead of localhost so Capybara knows where to direct Selenium
      ip = Socket.ip_address_list.detect(&:ipv4_private?).ip_address
      Capybara.app_host = "http://#{ip}:#{Capybara.server_port}"
    end

    driven_by :selenium_chrome_custom
  end
end
```

### Explanation

Let's look at what each of the code block above is doing.

#### Custom Selenium Chrome driver

`Capybara.register_driver :selenium_chrome_custom`

Since existing Selenium Drivers don't provide the custom options we want, we are creating a new driver `selenium_chrome_custom` which will handle Remote/Local connection as well as Headless/Headful mode.

#### Options

- `--window-size=1400,1400`

  Set the window size to 1400x1400 pixels. This is a reasonable size without being too large, but you can set it to whatever you like. This mostly impacts the size of debugging screenshots, but some tests may fail if you ask Capybara to click on an element which is not currently visible on the page.
- `--no-sandbox`

  Disables Chrome’s sandbox functionality because it has an issue with Docker version 1.10.0 and later.
- `--disable-dev-shm-usage`

  The "/dev/shm" shared memory partition is too small on many VM environments which will cause Chrome to fail or crash so we are disabling it.
- `--headless=new`

  Enable Chrome’s headless mode which will run Chrome without a UI.

  `SELENIUM_HEADFUL` will control this option. In development, you may want to run Chrome and see what's happening in the browser; you can do so by running tests with `SELENIUM_HEADFUL=true bundle exec rspec spec/system`.
  
  We will see list of other commands to run system tests at the end of this explanation section in a bit.

Some guides may suggest using the --disable-gpu flag, but <a href="https://issues.chromium.org/issues/40527919" target="_blank" rel="noopener">this is no longer necessary on any operating system</a>.

This explanation was shamelessly copied from <a href="https://thurlow.io/ruby/2020/11/06/remote-selenium-webdriver-servers-with-rails-capybara-and-rspec.html" target="_blank" rel="noopener">Remote Selenium WebDriver servers with Rails, Capybara, RSpec, and Chrome</a> 🙈.

#### Selenium remote URL

`remote_url = ENV.fetch("SELENIUM_REMOTE_URL", nil)`

Remote option is required mostly for CI but you can also test it out in local by running the Selenium Docker image e.g. with `SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub bundle exec rspec spec/system`

Remote option is controlled by `SELENIUM_REMOTE_URL` which needs to be passed when running tests as seen above.

Another configuration related to the remote is the use of `browser: :remote` inside `Capybara::Selenium::Driver.new` which tells Capybara to run tests in remote Chrome browser instead of local one.

#### Capybara server and app host

```ruby
Capybara.server_host = "0.0.0.0"

if ENV.fetch("SELENIUM_REMOTE_URL", nil)
  # Use the application container's IP instead of localhost so Capybara knows where to direct Selenium
  ip = Socket.ip_address_list.detect(&:ipv4_private?).ip_address
  Capybara.app_host = "http://#{ip}:#{Capybara.server_port}"
end
```

`server_host` and `app_host` are required for Capybara to know how it can call driver in the Remote Server.

This piece of code was extracted from the <a href="https://guides.rubyonrails.org/testing.html#changing-the-default-settings" target="_blank" rel="noopener">official Rails Documentation</a>.

#### Commands to run tests

Lastly, let's see various commands we can use to run system tests.

- Run in headless mode (default): `bundle exec rspec spec/system`
- Run in headful mode: `SELENIUM_HEADFUL=true bundle exec rspec spec/system`
- Run in headless mode inside external docker image in local: `SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub bundle exec rspec spec/system`

For CI, default command `bundle exec rspec spec/system` will work. But `SELENIUM_REMOTE_URL` will be `http://selenium:4444/wd/hub` and it will be passed an Environment Variable instead. We will look at how to do that next. 

## Update `.gitlab-ci.yml` to run all tests

We will be adding code to enable all the following tests and you can choose to pickup or ignore as per your requirement:

- Unit and Integration tests (Model, Requests, Authorization, Services etc.) which don't require us to start browser
- System Tests where we will start the Chrome browser and run tests inside it

Update your `.gitlab-ci.yml` with the configurations given below. Most of the configurations are accompanied by explanation, you can find clean configuration without comment at the end of the blog in the section "Final .gitlab-ci.yml" 

```yml
# change to the ruby version your application uses
image: ruby:3.3.0

# explanation in next section
cache:
  paths:
    - vendor/
    - node_modules/
    - yarn.lock

stages:
  - test

# base configuration required for running tests
.base_db:
  # add-on docker images required for running tests
  services:
    - postgres:latest
  variables:
    # set Rails environment so we don't have to prefix each command with RAILS_ENV=test
    RAILS_ENV: test
    # Postgres runs in a separate docker image and requires authentication to connect. Disabling that here by using "trust" so it doesn't ask for authentication
    POSTGRES_HOST_AUTH_METHOD: trust
  before_script:
    # use same bundler version that was used in bundling the Gemfile
    - gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1)" --no-document
    # install all gems to "vendor" folder which helps in caching of gem installation in between the execution of CI jobs
    - bundle config set --local path 'vendor'
    # install "nodejs" required for yarn and "cmake" required for pronto
    - apt-get update -qq && apt-get install -y -qq nodejs cmake
    # install gems in parallel, nproc returns the number of available processors
    - bundle install --jobs $(nproc)
    # install yarn
    - curl -o- -L https://yarnpkg.com/install.sh | bash
    # Make yarn available in the current terminal
    - export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
    - yarn install
    # copy all database configurations stored as the Gitlab CI variable to the file "config/database.yml"
    - cat $database_yml > config/database.yml
    # 👋 config/application.yml can be different for you. For e.g. if you are using ".env" then this content will be `cat $envfile > .env`
    - cat $env > config/application.yml
    - bundle exec rails db:create
    - bundle exec rails db:schema:load
    # Required for integration and system tests
    - bundle exec rails assets:precompile

unit_and_integration_tests:
  # reuse all configurations defined in .base_db above
  extends: .base_db
  stage: test
  # run this job only when merge requests are created, updated or merged
  only:
    - merge_requests
  script:
    # run all tests except system tests
    - bundle exec rspec --exclude-pattern "spec/system/**/*.rb"

system_tests:
  extends: .base_db
  stage: test
  services:
    # need to declare postgres again because "services" key will override the one defined in .base_db
    - postgres:latest
    # Docker image for Selenium with Chrome so test can run inside the browser
    - name: selenium/standalone-chrome:122.0
      alias: selenium
  variables:
    RAILS_ENV: test
    POSTGRES_HOST_AUTH_METHOD: trust
    # Location of the selenium docker image. "selenium" is an alias, you can also use http://selenium-standalone-chrome:4444/wd/hub or selenium__standalone-chrome (commonly seen in other guides)
    SELENIUM_REMOTE_URL: http://selenium:4444/wd/hub
  # store necessary files and folders in case of test failure for debugging the error
  artifacts:
    when: on_failure
    paths:
      - log/test.log
    expire_in: 1 week
  only:
    - merge_requests
  script:
    - bundle exec rspec spec/system
```

### Explanation

Let's look at some configurations where explanation was missing and would be lengthy to add there.

#### cache

```yml
cache:
  paths:
    - vendor/
    - node_modules/
    - yarn.lock
```

This tells Gitlab CI to cache vendor folder where we are storing all our gems, node_modules where all JS packages are stored, yarn.lock which stores the information about installed packages with their versions.

Storing all these folders and files speed up the CI in subsequent runs. `bundle install` and `yarn install` will only install new packages that are not already inside the cache.

#### stages

```yml
stages:
  - test
```

Stages define when to run the jobs. For example, stages that run tests after stages that runs linting on new changes.

If you also have linting and continuous deployment configured then stages could look like this:

```yml
stages:
  - lint
	- test
	- staging_deploy
	- production_deploy
```

Jobs are run in the same order as configured here i.e. linting will run first then test and lastly deployments.

#### .base_db

This configuration is used by all jobs that require database access. All common configurations for such jobs are extracted here.

`services` are add-on docker images and provide capabilities like database, redis, selenium drivers, etc.

`variables` are environment variables used by Rails.

`before_script` runs before the `script` so anything that needs to be pre-configured can be added here.

#### unit\_and\_integration_tests

`extends` will extend the configurations defined in the `.base_db` and use those configurations for this job.

`stage` tells this job at what stage to run. Depending on **`stages`** defined just above this job configuration.

`script` are the series of command to execute for this job. We are running all tests except system tests by using the rspec command helper `--exclude-pattern "spec/system/**/*.rb`

#### system_tests

`selenium/standalone-chrome:122.0` configures the docker image for Selenium with Chrome with the version 122.0, normally people use `selenium/standalone-chrome:latest` instead of this. But at the time of writing this blog, the latest version "123.0" had some issues and Chrome browser was not starting; I Had to spend 6+ hours in debugging just for finding that out 🫠

`artifacts` is used to store necessary files and folders in case of test failure. This helps us in debugging failing tests when needed. We are storing test log files for this purpose.

## Final `.gitlab-ci.yml`

If you also have Pronto or any other linter configured in CI then your final file could look like this:

```yml
image: ruby:3.3.0

cache:
  paths:
    - vendor/
    - node_modules/
    - yarn.lock

stages:
  - lint
  - test

pronto:
  before_script:
    - gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1)" --no-document
    - apt-get update -qq && apt-get install -y -qq cmake
    - bundle config set --local path 'vendor'
    - bundle install --jobs $(nproc)
  stage: lint
  only:
    - merge_requests
  variables:
    PRONTO_GITLAB_API_PRIVATE_TOKEN: $PRONTO_ACCESS_TOKEN
  script:
    - git fetch origin $CI_MERGE_REQUEST_TARGET_BRANCH_NAME
    - bundle exec pronto run -f gitlab_mr -c origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME

.base_db:
  services:
    - postgres:latest
  variables:
    RAILS_ENV: test
    POSTGRES_HOST_AUTH_METHOD: trust
  before_script:
    - gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1)" --no-document
    - bundle config set --local path 'vendor'
    - apt-get update -qq && apt-get install -y -qq nodejs cmake
    - bundle install --jobs $(nproc)
    - curl -o- -L https://yarnpkg.com/install.sh | bash
    - export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
    - yarn install
    - cat $database_yml > config/database.yml
    - cat $env > config/application.yml
    - bundle exec rails db:create
    - bundle exec rails db:schema:load
    - bundle exec rails assets:precompile

unit_and_integration_tests:
  extends: .base_db
  stage: test
  only:
    - merge_requests
  script:
    - bundle exec rspec --exclude-pattern "spec/system/**/*.rb"

system_tests:
  extends: .base_db
  stage: test
  services:
    - postgres:latest
    - name: selenium/standalone-chrome:122.0
      alias: selenium
  variables:
    RAILS_ENV: test
    POSTGRES_HOST_AUTH_METHOD: trust
    SELENIUM_REMOTE_URL: http://selenium:4444/wd/hub
  artifacts:
    when: on_failure
    paths:
      - log/test.log
    expire_in: 1 week
  only:
    - merge_requests
  script:
    - bundle exec rspec spec/system
```

## Conclusion

Phew, that was a lot of configurations and explanation.

The reason why I wrote this blog was because I faced various problems when trying out other blogs in the internet today and couldn't fully understand what was happening inside the configuration file because there were no explanations. I hope I have explained everything the code is doing and you don't have to waste time in researching about these things again.

With this, your Rails app now has all type of tests running in the Gitlab CI so you can now merge changes without any worry for them breaking the production application.

Thank you for reading. Happy coding!

**References**

- <a href="https://docs.gitlab.com/ee/ci/services/index.html#how-services-are-linked-to-the-job" target="_blank" rel="noopener">How services are linked to the Job (Gitlab)</a>
- <a href="https://gist.github.com/julianrubisch/7a96e4778302c1cb9911b6f9db2cb75f" target="_blank" rel="noopener">Gitlab CI Config for System Tests with Minitest (Github Gist)</a>
- <a href="https://thurlow.io/ruby/2020/11/06/remote-selenium-webdriver-servers-with-rails-capybara-and-rspec.html" target="_blank" rel="noopener">Remote Selenium WebDriver servers with Rails, Capybara, RSpec, and Chrome</a>
- <a href="https://guides.rubyonrails.org/testing.html#system-testing" target="_blank" rel="noopener">System Testing (Official Rails Documentation)</a>

**Image Credits:**

- Cover Image by <a href="https://unsplash.com/@jenstakesphotos?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Jens Freudenau</a> on <a href="https://unsplash.com/photos/a-group-of-pipes-that-are-connected-to-each-other-Xlg2KbYFUoM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank"  rel="noopener">Unsplash</a>
