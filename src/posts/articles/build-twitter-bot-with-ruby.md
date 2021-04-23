---
title: 'Build Twitter Bot with Ruby'
date: 2021-04-23
path: /articles/build-twitter-bot-with-ruby/
excerpt: "Did you know? We can also build bot with Ruby. Today we will be building twitter bot that retweets set of hashtags. We will be using twitter gem which uses Twitter API under the hood."
image: ../../images/articles/build-twitter-bot-with-ruby.webp
categories: [articles]
tags: [bot, tutorial, ruby]
toc: true
featured: true
comments: true
---

Today, we will be building a bot for Twitter that will retweet all hashtags related to #ruby or #rails. We can also configure it to retweet any hashtags so you can use this tutorial to create bot that can retweet whatever hashtag you want. Yes, and we will be building this Twitter bot with Ruby. 

We will be using <a href="https://github.com/sferik/twitter" target="_blank">Twitter gem (Github)</a> to help us in getting up and running quickly with Twitter APIs.

## Background

I am quite active in Twitter nowadays, and I have seen a lot of bots that retweet #100DaysOfCode. There were a lot of newbies trying out Javascript and getting help from the JS community. Dang, no one is using Ruby nowadays, I thought then. But it wasn't the case, yes less people are using it, but it's still popular. So I made plans to create a bot that will retweet all tweets with hashtag #ruby or #rails. The purpose of this bot is to bring Ruby and Rails community together, motivate newbies to use Ruby and for us to help each other.

## Skills required to follow the tutorial

Intermediate:

- Ruby
- Deployment skills if you are trying to deploy the bot to remote server

## You should have

- Configured twitter app and have four keys and secrets from from Twitter. If you haven't done so, you can follow this <a href="https://iag.me/socialmedia/how-to-create-a-twitter-app-in-8-easy-steps/" target="_blank">tutorial</a> to set it up and come back here after you have the keys and secret. 

## Steps

### Step 1: Create a ruby file

Let's first create a ruby file with name **re_tweet_service.rb** where we will write code/script to instruct Twitter to retweet the hashtags we want.

```cmd
# create a folder to save the bot service
$ mkdir ruby-twitter-bot

# create ruby file
$ cd ruby-twitter-bot
$ mkdir app/services/twitter
$ cd app/services/twitter
$ touch re_tweet_service.rb
```

What is happening?

- We are following the folder structure of Rails framework and saving our service inside the folder `app/services/twitter`
- After that inside the twitter folder we created the file `re_tweet_service.rb` where we will be adding the code next.

### Step 2: Require Twitter Gem in Ruby file

Inside the `re_tweet_service.rb`, add the following code at the top:

```ruby
require 'rubygems'
require 'bundler/setup'

require 'twitter'
```

What is happening?

- First two lines will let us use gem in our pure Ruby app, if you have used Rails before then it is automatically done by the framework and you may not have come across this.
- With `require 'twitter'`, we are instructing our Ruby app to use twitter gem.

### Step 3: Create application.yml to store twitter secrets and keys

Since secrets and keys should not be added to git repositories, let's create a folder `config` in the project root and add `application.yml` file to store secrets and keys which you get when configuring your twitter app.

```cmd
# create config folder
$ mkdir config

# create application.yml
$ cd config
$ touch application.yml
```

Let's add the following to the file:

```ruby
defaults: &defaults
  CONSUMER_KEY: '' # API KEY
  CONSUMER_SECRET: '' # API KEY SECRET
  ACCESS_TOKEN: ''
  ACCESS_TOKEN_SECRET: ''

production:
  <<: *defaults
```

Add the keys and secret you get after configuring Twitter app in the file which currently has no values configured.

### Step 4: Use figaro gem to load application.yml

If you have worked with Rails then you must be familiar with Figaro gem, if you haven't yet then here is what it does: it helps us in storing all our secret keys inside `application.yml` and lets us use these keys in our app accessible with `ENV`

Let's add the following code to the `re_tweet_service.rb`

```ruby
require 'figaro'

Figaro.application = Figaro::Application.new(
  environment: 'production',
  path: File.expand_path('config/application.yml')
)

Figaro.load
```

What is happening?

- We are requiring the figaro gem so we can use it in our app
- With `Figaro.application` code, we are telling our app to load the `application.yml` located inside `config` folder so that we can use the keys we configured in previous step.

### Step 5: Add twitter api configuration to the service

Add the following to the `re_tweet_service.rb`

```ruby
module Twitter
  class ReTweetService
    attr_reader :config

    def initialize
      @config = twitter_api_config
    end

    def perform
      rest_client = configure_rest_client
      stream_client = configure_stream_client
    end

    private

    def twitter_api_config
      {
        consumer_key: ENV['CONSUMER_KEY'],
        consumer_secret: ENV['CONSUMER_SECRET'],
        access_token: ENV['ACCESS_TOKEN'],
        access_token_secret: ENV['ACCESS_TOKEN_SECRET']
      }
    end

    def configure_rest_client
      puts 'Configuring Rest Client'

      Twitter::REST::Client.new(config)
    end

    def configure_stream_client
      puts 'Configuring Stream Client'

      Twitter::Streaming::Client.new(config)
    end
  end
end
```

You may be wondering what happened here all of a sudden. There are two ways to use Twitter API, first one is Rest Client, rest client provides endpoints to perform one time operations like tweet, retweet, like, etc. Second one is Stream Client, stream client streams all tweets in real time and watches the hashtags that we will configure later, i.e. stream client will give us the tweets with #ruby and #rails hashtags

What's happening in the code?

- We are initializing our service and together with it initializing the api configuration required for twitter
- `perform` is the only public method that we will expose in our service and make all other methods private
- We then configured both rest and stream client which we will use in upcoming steps.

### Step 6: Configure hashtags to watch

We will be watching out for three hashtags related to ruby and rails, let's add the following to service

```ruby
private

HASHTAGS_TO_WATCH = %w[#rails #ruby #RubyOnRails]
```

We are using constant here since hashtags don't have to be changed once the bot starts retweeting.

### Step 7: Retweet tweets with configured hashtags

Let's add the following code to the service, we will go through each block one by one to see what each code block is doing.

```ruby
def perform
  rest_client = configure_rest_client
  stream_client = configure_stream_client

  while true
    puts 'Starting to Retweet 3, 2, 1 ... NOW!'

    re_tweet(rest_client, stream_client)
  end
end

private

MAXIMUM_HASHTAG_COUNT = 10

def hashtags(tweet)
  tweet_hash = tweet.to_h
  extended_tweet = tweet_hash[:extended_tweet]

  (extended_tweet && extended_tweet[:entities][:hashtags]) || tweet_hash[:entities][:hashtags]
end

def tweet?(tweet)
  tweet.is_a?(Twitter::Tweet)
end

def retweet?(tweet)
  tweet.retweet?
end

def allowed_hashtags?(tweet)
  includes_allowed_hashtags = false

  hashtags(tweet).each do |hashtag|
    if HASHTAGS_TO_WATCH.map(&:upcase).include?("##{hashtag[:text]&.upcase}")
      includes_allowed_hashtags = true

      break
    end
  end

  includes_allowed_hashtags
end

def allowed_hashtag_count?(tweet)
  hashtags(tweet)&.count <= MAXIMUM_HASHTAG_COUNT
end

def sensitive_tweet?(tweet)
  tweet.possibly_sensitive?
end

def should_re_tweet?(tweet)
  tweet?(tweet) && !retweet?(tweet) && allowed_hashtag_count?(tweet) && !sensitive_tweet?(tweet) && allowed_hashtags?(tweet)
end

def re_tweet(rest_client, stream_client)
  stream_client.filter(:track => HASHTAGS_TO_WATCH.join(',')) do |tweet|
    puts "\nCaught the tweet -> #{tweet.text}"

    if should_re_tweet?(tweet)
      rest_client.retweet tweet

      puts "[#{Time.now}] Retweeted successfully!\n"
    end
  end
rescue StandardError => e
  puts "=========Error========\n#{e.message}"

  puts "[#{Time.now}] Waiting for 60 seconds ....\n"

  sleep 60
end

```

What's happening?

```ruby
def perform
  rest_client = configure_rest_client
  stream_client = configure_stream_client

  while true
    puts 'Starting to Retweet 3, 2, 1 ... NOW!'

    re_tweet(rest_client, stream_client)
  end
end
```

- We are using `while true` so that our service runs forever, once we start.

```ruby
def should_re_tweet?(tweet)
  tweet?(tweet) && !retweet?(tweet) && allowed_hashtag_count?(tweet) && !sensitive_tweet?(tweet) && allowed_hashtags?(tweet)
end

def re_tweet(rest_client, stream_client)
  stream_client.filter(:track => HASHTAGS_TO_WATCH.join(',')) do |tweet|
    puts "\nCaught the tweet -> #{tweet.text}"

    if should_re_tweet?(tweet)
      rest_client.retweet tweet

      puts "[#{Time.now}] Retweeted successfully!\n"
    end
  end
rescue StandardError => e
  puts "=========Error========\n#{e.message}"

  puts "[#{Time.now}] Waiting for 60 seconds ....\n"

  sleep 60
end
```

- Stream client live streams the tweets that match configured hashtags, hence we are looping through each tweet with `stream_client.filter(:track => HASHTAGS_TO_WATCH.join(','))`
- If there is any error, we are rescuing it so that Twitter Bot doesn't stop due to the error. We are then making the bot sleep for 60 seconds, it's just a cooldown period and you are right, it's absolutely not necessary and can remove it if you want.
- `should_re_tweet?` method is calling bunch of other methods that is checking various conditions so that the bot knows if it should retweet the given tweet received from twitter stream client.

```ruby
def tweet?(tweet)
  tweet.is_a?(Twitter::Tweet)
end
```

- Check if received tweet is an original tweet or retweeted one, if it was retweeted then this method returns false and bot doesn't retweet.

```ruby
def retweet?(tweet)
  tweet.retweet?
end
```

- Check if received tweet is not original and just retweeted, bot will skip this tweet if this method return true

```ruby
def sensitive_tweet?(tweet)
  tweet.possibly_sensitive?
end
```

- Check if tweet is sensitive and has content that is not suitable for the bot to retweet

### Step 8: Execute 'perform' method to run the service

Let's add the following code at the absolute end of the service:

```ruby
Twitter::ReTweetService.new.perform
```

### Step 9: Run the bot

From the command line in project root, execute the ruby file and your bot should start retweeting:

```cmd
$ ruby app/services/twitter/re_tweet_service.rb
```

Yayy! Now you can just sit back and watch you bot wreck havoc the twitter with retweets.

## Final code

```ruby
require 'rubygems'
require 'bundler/setup'

require 'twitter'
require 'figaro'
require 'pry-byebug'

Figaro.application = Figaro::Application.new(
  environment: 'production',
  path: File.expand_path('config/application.yml')
)

Figaro.load

module Twitter
  class ReTweetService
    attr_reader :config

    def initialize
      @config = twitter_api_config
    end

    def perform
      rest_client = configure_rest_client
      stream_client = configure_stream_client

      while true
        puts 'Starting to Retweet 3, 2, 1 ... NOW!'

        re_tweet(rest_client, stream_client)
      end
    end

    private

    MAXIMUM_HASHTAG_COUNT = 10
    HASHTAGS_TO_WATCH = %w[#rails #ruby #RubyOnRails]

    def twitter_api_config
      {
        consumer_key: ENV['CONSUMER_KEY'],
        consumer_secret: ENV['CONSUMER_SECRET'],
        access_token: ENV['ACCESS_TOKEN'],
        access_token_secret: ENV['ACCESS_TOKEN_SECRET']
      }
    end

    def configure_rest_client
      puts 'Configuring Rest Client'

      Twitter::REST::Client.new(config)
    end

    def configure_stream_client
      puts 'Configuring Stream Client'

      Twitter::Streaming::Client.new(config)
    end

    def hashtags(tweet)
      tweet_hash = tweet.to_h
      extended_tweet = tweet_hash[:extended_tweet]

      (extended_tweet && extended_tweet[:entities][:hashtags]) || tweet_hash[:entities][:hashtags]
    end

    def tweet?(tweet)
      tweet.is_a?(Twitter::Tweet)
    end

    def retweet?(tweet)
      tweet.retweet?
    end

    def allowed_hashtags?(tweet)
      includes_allowed_hashtags = false

      hashtags(tweet).each do |hashtag|
        if HASHTAGS_TO_WATCH.map(&:upcase).include?("##{hashtag[:text]&.upcase}")
          includes_allowed_hashtags = true

          break
        end
      end

      includes_allowed_hashtags
    end

    def allowed_hashtag_count?(tweet)
      hashtags(tweet)&.count <= MAXIMUM_HASHTAG_COUNT
    end

    def sensitive_tweet?(tweet)
      tweet.possibly_sensitive?
    end

    def should_re_tweet?(tweet)
      tweet?(tweet) && !retweet?(tweet) && allowed_hashtag_count?(tweet) && !sensitive_tweet?(tweet) && allowed_hashtags?(tweet)
    end

    def re_tweet(rest_client, stream_client)
      stream_client.filter(:track => HASHTAGS_TO_WATCH.join(',')) do |tweet|
        puts "\nCaught the tweet -> #{tweet.text}"

        if should_re_tweet?(tweet)
          rest_client.retweet tweet

          puts "[#{Time.now}] Retweeted successfully!\n"
        end
      end
    rescue StandardError => e
      puts "=========Error========\n#{e.message}"

      puts "[#{Time.now}] Waiting for 60 seconds ....\n"

      sleep 60
    end
  end
end

Twitter::ReTweetService.new.perform
```

## Bonus: Running the bot in remote server

With this, you should be able to run the bot in your local machine. If you want to keep it running even when your maching is powered off, then you will have to deploy the code to remote server.

I am assuming that you have a good knowledge of working with remote server and have already configured the server.

If you have already configured the server then you can run the bot in the server with following steps:

### Step 1: Push code to git

Push the current folder to git repo so that we can download it to the server and use it to run the bot.

### Step 2: Clone the project

Inside the server, `git clone` the project

### Step 3: Move inside the project folder

```cmd
$ cd ruby-twitter-bot # assuming your project is named ruby-twitter-bot
```

### Step 4: Create a new shell

```cmd
$ screen -S twitter-bot
```

### Step 5: Run the ruby twitter bot

```cmd
$ ruby app/services/twitter/re_tweet_service.rb 
```

### Step 6: Detach shell and move to original shell

```cmd
$ CTRL + a + d
```

With that, you should now have a bot that will run forever unless your server is down or your twitter app has reached the tweet limit.

## Conclusion

Now you have learned how to create Twitter bot with Ruby, go and show your power on Twitter. Hope you use the bot for the better of the community.

You can view the full code and folder structure at <a href="https://github.com/coolprobn/ruby-twitter-bot" target="_blank">Ruby Twitter Bot (Github)</a>

Thanks for reading, see you in the next blog.

**References:** <a href="https://stackoverflow.com/questions/6391187/run-ruby-script-in-the-background/6391255#6391255" target="_blank">Run ruby script in the background (Stack Overflow)</a>

**Image Credits:** Cover Image by <a href="https://unsplash.com/@rocknrollmonkey?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Rock'n Roll Monkey</a> on <a href="https://unsplash.com/s/photos/robot?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
