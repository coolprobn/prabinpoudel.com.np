---
title: 'Setup Factory Bot in Rails'
date: 2021-06-13
path: /articles/setup-factory-bot-in-rails/
excerpt: "Factory Bot is a ruby library for setting up test data objects in Ruby. Today we will be setting up Factory Bot in Rails which uses RSpec for testing. Factory Bot helps developers to write less code while testing with the factory objects that is created for each model."
image: ../../images/articles/setup-factory-bot-in-rails.webp
categories: [articles]
tags: [ruby on rails, factory bot, testing]
toc: true
featured: false
comments: true
---

Factory Bot is a library for setting up test data objects in Ruby. Today we will be setting up Factory Bot in Rails which uses RSpec for testing. If you are using different test suite, you can view all supported configurations <a href="https://github.com/thoughtbot/factory_bot/blob/master/GETTING_STARTED.md#configure-your-test-suite" target="_blank" rel="noopener">here</a>.

To setup Factory Bot in Rails, we should follow the steps given below:

1. Add **`factory_bot_rails`** to your **Gemfile** in **:development, :test** group

    ```ruby
      group :development, :test do
        gem 'factory_bot_rails'
      end
   ```

2. Install gem with `bundle install`
3. Create a file `spec/support/factory_bot.rb` and add the following configuration inside

    ```ruby
      RSpec.configure do |config|
        config.include FactoryBot::Syntax::Methods
      end
    ```

4. Uncomment following line from **rails_helper.rb** so all files inside `spec/support` are loaded automatically by rspec

    ```ruby
      # Dir[Rails.root.join('spec', 'support', '**', '*.rb')].sort.each { |f| require f }

      Dir[Rails.root.join('spec', 'support', '**', '*.rb')].sort.each { |f| require f }
    ```
5. Check factory bot rails version inside **Gemfile.lock** and update the gem with that version in `Gemfile`. It was `6.1.0` while writing this tutorial, yours may be different depending on latest gem version.
    
    ```ruby
      group :development, :test do
        gem 'factory_bot_rails', '~> 6.1.0'
      end
   ```

6. Run `bundle install` (Optional, since nothing will change inside `Gemfile.lock`)
7. Add **factories** folder inside `spec` folder if it doesn't already exist. You can then create factories inside `spec/factories` folder.
9. Assuming you have model **User**, you can create `factories/users.rb`
10. If attributes in `users` table are first_name, last_name, email, mobile_number. Your `users` factory will look something like this:

    ```ruby
      FactoryBot.define do
        factory :user do
          first_name { 'John' }
          last_name  { 'Doe' }
          email { john@email_provider.com }
          mobile_number { 7860945310 }
        end
      end 
    ```
11. You can use the `user` factory inside your `user_specs` like this
       
      ```ruby
        require 'rails_helper'

        RSpec.describe User, type: :model do
          let(:user) { build(:user) }
        end
      ```

12. You can view various use cases in <a href="https://github.com/thoughtbot/factory_bot/blob/master/GETTING_STARTED.md#using-factories" target="_blank" rel="noopener">official documentation</a> for using  factories in your tests.

## Conclusion

Factory Bot helps in reusing the same code in multiple test examples, this way you will have to write less code and as they say "Less code is always better".

Thank you for reading. Happy coding!

## References

- <a href="https://github.com/thoughtbot/factory_bot/blob/master/GETTING_STARTED.md" target="_blank" rel="noopener">Factory Bot [Github]</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@anchorlee?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Anchor Lee</a> on <a href="https://unsplash.com/s/photos/robot?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
