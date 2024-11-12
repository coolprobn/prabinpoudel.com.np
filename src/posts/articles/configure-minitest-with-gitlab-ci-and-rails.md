---
title: 'Configure Minitest with Gitlab CI and Rails'
date: 2024-09-26
path: /articles/configure-minitest-with-gitlab-ci-and-rails/
excerpt: "Running tests in CI is a very important step to make sure there are no breaking changes in the new code. Today we will look at configuring Gitlab CI to run tests for Ruby on Rails applications written with Minitest."
image: ../../images/articles/configure-minitest-with-gitlab-ci-and-rails.jpeg
categories: [articles]
tags: [ruby on rails, minitest, gitlab ci]
toc: true
featured: false
comments: true
canonical: true
canonical_url: 'https://blog.zeroconfigrails.com/configure-minitest-with-gitlab-ci-and-rails'
last_modified_at: 2024-11-12
---

At <a href="https://zeroconfigrails.com" target="_blank" rel="noopener">Zero Config Rails</a>, I am constantly working on automating configurations and boring setups like “Configure Minitest with Gitlab CI”.

If you don't want to read the whole blog and just want the whole configuration automatically, you can do so using Zero Config Rails. Just hit the following command and you will be good to go:

```bash
$ gem install zcr-zen && zen add ci:gitlab_ci --app_test_framework=minitest
```

For the detailed list of configurations, you can visit <a href="https://generators.zeroconfigrails.com/install/gitlab_ci" target="_blank" rel="noopener">Gitlab CI Generator</a>.

Now without further ado, let’s jump right into setting up Gitlab CI for Minitest and run those tests in CI.

## Assumptions

* You have basic Gitlab CI configurations ready i.e. `.gitlab-ci.yml` exists in your project.
    
    If it doesn’t, you can refer to my other article <a href="/articles/integrate-pronto-with-gitlab-ci-for-rails-app/">Integrate Pronto with Gitlab for Rails App</a>
    
* You are using PostgreSQL in your app, though with minimal changes it should work for any other databases.
    
* You are using import-maps, though I have added configurations for projects with esbuild as well, you can just uncomment them.

## Tested and working in

* Ruby 3.3.0
    
* Rails 7.2.1
    
* Minitest 5.25.1
    
* selenium-webdriver 4.24.0

## Configure Gitlab CI Variables

Firs of all, we need to add some configurations required by the CI to run tests. This should be done over at <a href="https://gitlab.com" target="_blank" rel="noopener">Gitlab</a>.

### Add variable for storing environment variables

I normally use Figjam which is a maintained version of the popular Figaro gem for storing environment variables which uses `config/application.yml` but just the plain `.env` file using dotenv gem is also very popular. Anyway, just copy the content from whatever you are using and paste it inside the Value for this new variable.

You can visit the <a href="https://docs.gitlab.com/ee/ci/variables/#project-cicd-variables" target="_blank" rel="noopener">official documentation</a> to learn about setting up variables for Gitlab CI. You have to go to your project's setting in Gitlab and configure these in CI/CD variables.

Create a new variable for storing content in your `config/application.yml`:

1. Type: File
    
2. Flags
    
    Uncheck all checklists here i.e. Protect variable, Mask variable and Expand variable reference
    
3. Description
    
    You can add “Environment Variables“ but it's optional and you can skip this as "Key" (just below this) is already clear enough on what this variable is storing.
    
4. Key: `env`
    
    In "Value", add the copied content from your env file.

    *NOTE*: Make sure to only copy what is under "test" block or ".env.test", you don’t want to add production variables here!

### Add variable for `MASTER_KEY`

Rails comes with `config/credentials.yml.enc` for storing secrets, we generally also use ENV variables for this but since Rails credentials is the default, we will also look at how to configure those.

To decrypt credentials file, you need MASTER\_KEY. If you have generated multiple credentials file per environment then you might have multiple keys like master.key, staging.key, production.key, etc..

Create a new variable for storing content in the “.key” file that can decrypt secrets configured for the test environment; normally this will be inside the `config/master.key`:

1. Type: Variable (Default)
    
2. Flags
    
    Uncheck all checklists here i.e. Protect variable, Mask variable and Expand variable reference
    
3. Description
    
    Optional. You can leave it blank.
    
4. Key: MASTER\_KEY
    
    And in Value, add the content copied from the `master.key`

## Add `database.yml.ci` file

It's not considered a good practice to use `config/database.yml` file for the CI so we will instead create a new file `config/database.yml.ci` and add configurations required to run tests inside.

You can visit the <a href="https://docs.gitlab.com/ee/ci/variables/#project-cicd-variables" target="_blank" rel="noopener">official documentation</a> to learn about setting up variables. You have to go to your project's setting in Gitlab and configure these in CI/CD variables.

After creating the file, add the following:

```yml
test:
  adapter: postgresql
  encoding: unicode
  host: postgres
  database: ci_db
  username: postgres
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
```

For username it should be “postgres” which is the default user that gets created when postgres service/docker is created hence it doesn’t ask password or tries to authenticate user. You might get an error otherwise because no other users will have been created in postgres at this point: \`Please check your database configuration to ensure the username/password are valid\`.

For host make sure to use "postgres" instead of “localhost”. For MySQL, you will have to use "mysql" as said in the <a href="https://docs.gitlab.com/ee/ci/services/index.html#how-services-are-linked-to-the-job" target="_blank" rel="noopener">official documentation</a>:

> The service container for MySQL is accessible under the hostname mysql. To access your database service, connect to the host named mysql instead of a socket or localhost.

SQLite doesn’t need any host configurations but other configurations will most probably vary.

## Configure Capybara with Selenium

We will configure Selenium with Chrome to be used both in CI and Local with Headless mode (by default) while also allowing to run in the browser if needed for debugging.

Create a new file "test/helpers/capybara.rb" and add the following code:

```ruby
require "selenium-webdriver"

Capybara.register_driver :selenium_chrome_custom do |app|
  options = Selenium::WebDriver::Chrome::Options.new

  options.add_argument("--headless=new") unless ENV["SELENIUM_HEADFUL"]

  options.add_argument("--window-size=1400,1400")
  options.add_argument("--no-sandbox")
  options.add_argument("--disable-dev-shm-usage")

  remote_url = ENV["SELENIUM_REMOTE_URL"]

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
```

### Explanation

Let's look at what each of the code block above is doing.

#### Custom Selenium Chrome driver

`Capybara.register_driver :selenium_chrome_custom`

Since existing Selenium Drivers don't provide the custom options we want, we are creating a new driver `selenium_chrome_custom` which will handle Remote/Local connection as well as Headless/Headful mode.

#### Options

* `--window-size=1400,1400`
    
    Set the window size to 1400x1400 pixels. This is a reasonable size without being too large, but you can set it to whatever you like. This mostly impacts the size of debugging screenshots, but some tests may fail if you ask Capybara to click on an element which is not currently visible on the page.
    
* `--no-sandbox`
    
    Disables Chrome’s sandbox functionality because it has an issue with Docker version 1.10.0 and later.
    
* `--disable-dev-shm-usage`
    
    The "/dev/shm" shared memory partition is too small on many VM environments which will cause Chrome to fail or crash so we are disabling it.
    
* `--headless=new`
    
    Enable Chrome’s headless mode which will run Chrome without a UI.
    
    `SELENIUM_HEADFUL` will control this option. In development, you may want to run Chrome and see what's happening in the browser for debugging; you can do so by running tests with `SELENIUM_HEADFUL=true bundle exec rails test:system`.
    
    We will see list of other commands to run system tests at the end of this explanation section in a bit.

Some guides may suggest using the --disable-gpu flag, but <a href="https://issues.chromium.org/issues/40527919" target="_blank" rel="noopener">this is no longer necessary on any operating system</a>.

This explanation was shamelessly copied from <a href="https://thurlow.io/ruby/2020/11/06/remote-selenium-webdriver-servers-with-rails-capybara-and-rspec.html" target="_blank" rel="noopener">Remote Selenium WebDriver servers with Rails, Capybara, RSpec, and Chrome</a>🙈.

#### Selenium remote URL

`remote_url = ENV[“SELENIUM_REMOTE_URL"]`

Remote option is required mostly for CI but you can also test it out in local by running the Selenium Docker image e.g. with `SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub bundle exec rails test:system`

Remote option is controlled by `SELENIUM_REMOTE_URL` which needs to be passed when running tests as seen above.

Another configuration related to the remote is the use of `browser: :remote` inside `Capybara::Selenium::Driver.new` which tells Capybara to run tests in remote Chrome browser instead of local one.

### Add host configurations

Update the `test/application_system_test_case.rb` file to include the following content so Gitlab CI can run tests in the remote browser.

```ruby
# other require declarations ...
require "helpers/capybara"

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  # other codes ....
  driven_by :selenium_chrome_custom

  def setup
    Capybara.server_host = "0.0.0.0" # bind to all interfaces
    Capybara.server_port = 3000

    if ENV["SELENIUM_REMOTE_URL"].present?
      ip = Socket.ip_address_list.detect(&:ipv4_private?).ip_address
      Capybara.app_host = "http://#{ip}:#{Capybara.server_port}"
    end

    super
  end
end
```

Do note, you should replace the line `driven_by …` with `driven_by :selenium_chrome_custom` as shown above.

`server_host` and `app_host` are required for Capybara to know how it can call driver in the Remote Server.

This piece of code was extracted from the <a href="https://guides.rubyonrails.org/testing.html#changing-the-default-settings" target="_blank" rel="noopener">official Rails Documentation</a>.

### Commands to run tests

Lastly, let's see various commands we can use to run system tests.

* Run in headless mode (default): `bundle exec rails test:system`
    
* Run in headful mode: `SELENIUM_HEADFUL=true bundle exec rails test:system`
    
* Run in headless mode inside external docker image in local: `SELENIUM_REMOTE_URL=http://localhost:4444/wd/hub bundle exec rails test:system`
    

For CI, default command `bundle exec rails test:system` will work. But `SELENIUM_REMOTE_URL` will be `http://selenium:4444/wd/hub` and it will be passed as an Environment Variable instead. We will look at how to do that next.

## Update `.gitlab-ci.yml` to run all tests

We will be adding code to enable all the following tests and you can choose to pickup or ignore as per your requirement:

* Unit and Integration tests (Model, Requests, Authorization, Services etc.) which don't require us to start browser
    
* System Tests where we will start the Chrome browser and run tests inside it
    

Update your `.gitlab-ci.yml` with the configurations given below. Most of the configurations are accompanied by explanation, you can find clean configuration without comment at the end of the blog in the section "**Final** `.gitlab-ci.yml`"

```yml
# change to the ruby version your application uses
image: ruby:3.3.0

variables:
  MASTER_KEY: $MASTER_KEY

# explanation in next section
cache:
  paths:
    - vendor/
    # uncomment till yarn.lock if you are using esbuild i.e. you have package.json in your project
    # - node_modules/
    # - yarn.lock # or package-lock.json

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
    - bundle config set --local path "vendor"
    # you can uncomment lines till `yarn install` if you are using esbuild
    # - apt-get update -qq
    # install "nodejs" required for yarn
    # - apt-get install -y -qq nodejs
    # - curl -o- -L https://yarnpkg.com/install.sh | bash
    # Make yarn available in the current terminal
    # - export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
    # - yarn install --pure-lockfile
    - bundle install --jobs $(nproc)
    - cp config/database.yml.ci config/database.yml
    # config/application.yml can be different for you. If you are using dotenv gem then this content will be `cat $env > .env`
    - cat $env > config/application.yml
    - bundle exec rails db:test:prepare

unit_and_integration_tests:
  # reuse all configurations defined in .base_db above
  extends: .base_db
  stage: test
  # run this job only when merge requests are created, updated or merged
  only:
    - merge_requests
  script:
    - bundle exec rails test

system_tests:
  extends: .base_db
  stage: test
  services:
    - name: selenium/standalone-chrome:latest
      alias: selenium
    # need to declare postgres again because "services" key will override the one defined in .base_db
    - postgres:latest
  variables:
    RAILS_ENV: test
    # Location of the selenium docker image. "selenium" is an alias, you can also use http://selenium-standalone-chrome:4444/wd/hub or selenium__standalone-chrome (commonly seen in other guides)
    SELENIUM_REMOTE_URL: http://selenium:4444/wd/hub
  only:
    - merge_requests
  script:
    - bundle exec rails test:system
  # store necessary files and folders in case of test failure for debugging the error
  artifacts:
    when: on_failure
    paths:
      - log/test.log
      - tmp/screenshots/
    expire_in: 1 week
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

This tells Gitlab CI to cache vendor folder where we are storing all our gems, **node\_modules** where all JS packages are stored and **yarn.lock** which stores the information about installed packages with their versions.

Storing all these folders and files speed up the CI in subsequent runs. `bundle install` and `yarn install` will only install new packages that are not already inside the cache.

#### stages

```yml
stages:
  - test
```

Stages define when to run the jobs.

If you also have linting and continuous deployment configured then stages could look like this:

```yml
stages:
  - lint
	- test
	- staging_deploy
	- production_deploy
```

Jobs are run in the same order as configured here i.e. linting will run first then test and lastly deployments.

#### .base\_db

All common configurations used by jobs that require database access are extracted here.

`services` are add-on docker images and provide capabilities like database, redis, selenium drivers, etc.

`variables` are environment variables used by Rails.

`before_script` runs before the `script` so anything that needs to be pre-configured can be added here.

#### unit\_and\_integration\_tests

`extends` will extend the configurations defined in the `.base_db` and use those configurations for this job.

`stage` tells this job at what stage to run. Depending on `stages` defined just above this job configuration.

`script` are the series of command to execute for running this job.

#### system\_tests

`selenium/standalone-chrome:latest` configures the docker image for Selenium with Chrome with the latest version.

`artifacts` is used to store necessary files and folders in case of test failure. This helps us in debugging failing tests when needed. We are storing test log files for this purpose.

## Final `.gitlab-ci.yml`

This is how your `gitlab-ci.yml` should look like if you have followed everything in this blog:

```yml
image: ruby:3.3.0

variables:
  MASTER_KEY: $MASTER_KEY

cache:
  paths:
    - vendor/

stages:
  - test

.base_db:
  services:
    - postgres:latest
  variables:
    RAILS_ENV: test
    POSTGRES_HOST_AUTH_METHOD: trust
  before_script:
    - gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1)" --no-document
    - bundle config set --local path 'vendor'
    - bundle install --jobs $(nproc)
    - cp config/database.yml.ci config/database.yml
    - cat $env > config/application.yml
    - bundle exec rails db:test:prepare

unit_and_integration_tests:
  extends: .base_db
  stage: test
  only:
    - merge_requests
  script:
    - bundle exec rails test

system_tests:
  extends: .base_db
  stage: test
  services:
    - postgres:latest
    - name: selenium/standalone-chrome:latest
      alias: selenium
  variables:
    RAILS_ENV: test
    POSTGRES_HOST_AUTH_METHOD: trust
    SELENIUM_REMOTE_URL: http://selenium:4444/wd/hub
  only:
    - merge_requests
  script:
    - bundle exec rails test:system
  artifacts:
    when: on_failure
    paths:
      - log/test.log
      - tmp/screenshots/
    expire_in: 1 week
```

## Conclusion

Phew, that was a lot of configurations and explanation. And you can automate all of this with just a single command from Zero Config Rails in near future, stay tuned!

With this, your Rails app now has all type of tests running in the Gitlab CI so you can now merge changes without any worry for them breaking the production application.

Thank you for reading. Happy coding!

## References

* <a href="https://prabinpoudel.com.np/articles/setup-and-run-rspec-tests-with-gitlab-ci" target="_blank">Setup RSpec Tests in Rails with Gitlab CI</a>

## Image Credits

* Cover Image by <a href="https://unsplash.com/@ledafenix00?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Tania C</a> on <a href="https://unsplash.com/photos/a-red-heart-shaped-pendant-sitting-on-top-of-a-table-OIohXAQ_lRw?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Unsplash</a>
