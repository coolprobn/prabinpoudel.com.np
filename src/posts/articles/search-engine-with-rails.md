---
title: 'Search Engine with Rails'
date: 2021-07-11
path: /articles/search-engine-with-rails/
excerpt: "...."
image: ../../images/articles/search-engine-with-rails.webp
categories: [articles]
tags: [ruby on rails]
toc: true
featured: true
comments: true
---

## Dependencies

Update these as required when writing article. Should go inside app setup section.

Docker
Redis

Run redis:

once: /opt/homebrew/opt/redis/bin/redis-server /opt/homebrew/etc/redis.conf
always in background: brew services start redis

__DISCLAIMER__

We will not actually be building another search engine for the web like Google. What we will be building is a search engine for our Rails App so that we can search for any string inside any table in our app. This will help us in adding app wide search.

## Configuring Elastic search

TODO: this is only for Mac, need link to the installation path for all other platforms

### Install Elastic search in Mac with Homebrew

https://www.elastic.co/guide/en/elasticsearch/reference/current/brew.html 

1. Update home-brew

	`brew tap elastic/tap`

2. Install elastic search

	`brew install elastic/tap/elasticsearch-full`

### Run Elastic Search Server

1. Run only once

	`elasticsearch`

2. Automatically run on background and on machine restart

	`brew services start elastic/tap/elasticsearch-full`

### Check if Elastic Search is working

You can check if Elastic Search is working by opening localhost in port 9200 in the browser:

`http://localhost:9200/`

You should see similar content like below:

```
{
  "name" : "Prabins-MacBook-Pro.local",
  "cluster_name" : "elasticsearch_cool",
  "cluster_uuid" : "J2CAnnSoRI6p2zZGV3K8eg",
  "version" : {
    "number" : "7.13.3",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "5d21bea28db1e89ecc1f66311ebdec9dc3aa7d64",
    "build_date" : "2021-07-02T12:06:10.804015202Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.2",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

## Install Kibana to visualize documents

Mac with home-brew: https://www.elastic.co/guide/en/kibana/7.13/brew.html 
Download for any device: https://www.elastic.co/downloads/kibana 

### Run once or in background

To have launchd start elastic/tap/kibana-full now and restart at login:
  brew services start elastic/tap/kibana-full
Or, if you don't want/need a background service you can just run:
  kibana

## Creating a Rails App

- Create an app
- Create models for it (Maybe blog app will be a good one with models: User (Author and normal users), Article, Comment, Tag/Category) -> In blog say I have this model and don't show the process of creating all these, you can provide link for the download if users are interested (Setup the project in Github after configuring, maybe a branch since master will have full search capability once the blog is completed)

## Installing elastic search gems

In Gemfile, add:

```rb
	# Elastic search for powerful searching
	gem 'elasticsearch-model'
	gem 'elasticsearch-rails'
```

## Adding Elastic Search to Models

Add following to all the models you require elastic search capability in:

```rb
	include Elasticsearch::Model
   	include Elasticsearch::Model::Callbacks
```

Cumbersome, right? We can refactor this by creating a concern called Searchable, which will extend the capability of models to be searched. By configure everything related to Elastic Search in this module, it lets us write DRY (Don't Repeat Yourself) code

## Creating Searchable module

	```rb
		# app/models/concerns/searchable.rb

		module Searchable
  			extend ActiveSupport::Concern

  			included do
   				include Elasticsearch::Model
   				include Elasticsearch::Model::Callbacks
  			end
		end
	```

### Including Searchable module in required models

E.g.

```User
	include Searchable
```

Now all the codes inside Searchable module will be accessible to our models where we have included the module.

## Indexing database records of required models/tables

### Create a rake task that can automate the indexing process for us:

```rb
	#  lib/tasks/elastic_search.rb

	namespace :elastic_search do
 		desc 'Index models to elastic search'
  		task :index_models, [:models] => :environment do |_, args|
    			default_models = %w[Agreement CellPhone DidNumber Pbx Subscription SubscriptionLine SubscriptionLineProperty User UserLicense]
			argument_models = args[:models]&.split(',')&.map(&:strip)
    			models = argument_models || default_models
    
    			model_classes = models.map { |model| model.underscore.camelize.constantize }

    			model_classes.each do |model|
      				model.import force: true
    			end
  		end
	end
```

We are converting all model names to camel case for consistency so even if user provides model name in different case in argument when running rake task, it will always convert to class name. constantize converts string to class so that we can use class methods to index the model for elastic search.

Array of model names is not supported by rake task as an argument directly so we will be using ',' to split the models. Strip will take care off removing white spaces from the model names.

You can add/remove your default_models as required

### Run the rake task

When running for the first time don't pass any argument:

`rails elastic_search:index_models`

When you run for the second time after adding new models, pass those models when executing the rake task

	`rails "elastic_search:index_models[Setting\, UserSetting\, Role]"`

	We need to escape ',' with '\' otherwise it will be treated as second argument to rake task and only Setting will be passed to model_names argument 

## Search with Elastic Search

### Search only one model

You can search only one model with `ModelName.search 'query'` e.g. `User.search 'Prabin'`

```cmd
	$ response = User.search('Prabin').results
	$ response.first.as_json
	 
	# result
	{"_index"=>"users", "_type"=>"_doc", "_id"=>"80", "_score"=>3.5528386, "_source"=>{"id"=>80, "first_name"=>"Prabin", "middle_name"=>nil, "last_name"=>"Test User", "phone"=>nil, "note"=>nil, "odoo_contact_id"=>nil, "created_at"=>"2020-11-23T06:58:48.541Z", "updated_at"=>"2020-11-23T06:58:48.541Z", "email"=>"prabin@truemark.com", "user_license_id"=>59, "is_active"=>true}}
```

You can also achieve similar result by using records instead of results. Difference between them is results always return Elastic Search result while records convert Elastic Search results to active record query which can take some time to execute for production environment.

You can read more about **records** here: https://github.com/elastic/elasticsearch-rails/tree/master/elasticsearch-model#search-results-as-database-records 

### Search in multiple models

You can search in multiple models with Elasticsearch::Model.search('query', [ModelName1, ModelName2]) e.g. Elasticsearch::Model.search('Ronni', [User, SubscriptionLineProperty])

```cmd
	$ Elasticsearch::Model.search('Ronni', [User, SubscriptionLineProperty]).results.as_json
	
	# result
	[{"_index"=>"subscription_line_properties", "_type"=>"_doc", "_id"=>"602", "_score"=>3.695231, "_source"=>{"id"=>602, "subscription_line_id"=>389, "property"=>"Name", "value"=>"Ronni Poulsen", "created_at"=>"2020-11-20T14:14:46.784Z", "updated_at"=>"2020-11-20T14:14:46.784Z"}},  {"_index"=>"users", "_type"=>"_doc", "_id"=>"77", "_score"=>3.5256014, "_source"=>{"id"=>77, "first_name"=>"Ronni", "middle_name"=>nil, "last_name"=>"Poulsen", "phone"=>nil, "note"=>nil, "odoo_contact_id"=>nil, "created_at"=>"2020-11-20T14:14:46.792Z", "updated_at"=>"2021-07-05T15:22:49.732Z", "email"=>"ronni-test@flexonet.dk", "user_license_id"=>56, "is_active"=>true}}]
```

## Converting Search Results to Active Record

You can convert search result to active record with `to_a` For e.g. `User.search('prabin').records.to_a` will return 👇 

```cmd
  User Load (9.2ms)  SELECT "users".* FROM "users" WHERE "users"."id" IN ($1, $2, $3)  [["id", 80], ["id", 130], ["id", 93]]
=> [#<User id: 80, first_name: "Prabin", middle_name: nil, last_name: "Test User", phone: nil, note: nil, odoo_contact_id: nil, created_at: "2020-11-23 06:58:48", updated_at: "2020-11-23 06:58:48", email: "prabin@truemark.com", user_license_id: 59, is_active: true>, #<User id: 130, first_name: "Prabin", middle_name: nil, last_name: "Test", phone: "123412121", note: nil, odoo_contact_id: 2261, created_at: "2021-07-07 11:49:28", updated_at: "2021-07-07 11:54:46", email: "prabin@test.com", user_license_id: nil, is_active: true>, #<User id: 93, first_name: "Prabin", middle_name: nil, last_name: "Poudel", phone: nil, note: nil, odoo_contact_id: nil, created_at: "2021-01-08 08:17:55", updated_at: "2021-01-08 08:17:55", email: "hey@test.com", user_license_id: 64, is_active: true>]
```

We won't be using this in our tutorial nor will I use this in actual implementation because it executes an extra query and adds more time to the request.

In this tutorial, we will instead be converting search results to JSON and render records in our view.

## API for search engine

API should accept query and model_names to search in (model names not required right now, can be taken later for optimizing when database is very big and also make the search more narrow)

1. Create a controller

     `touch app/controllers/search_controller.rb`

     Add the following inside it:

     ```
       class SearchController < ApplicationController

  def search
    if params[:q].blank?
      @results = []
    else
      @results = Elasticsearch::Model
                   .search(params[:q])
                   .results.as_json
                   .group_by { |result| result['_index'] }
    end
  end
end

     ```
2. Add route for search

     Inside `config/routes.rb`, add the following line:

     `get :search, to: 'search#search'`

## View to search and show results
   
     We will need view with search box and model multi select option (model option not required right now)

     Create a view with `touch app/views/search/search.html.erb`

     Add following inside it:

     ```
       <h1>App Search</h1>

<%= form_for search_path, method: :get do |f| %>
  <p>
    <%= f.label "Search for" %>
    <%= text_field_tag :q, params[:q] %>
    <%= submit_tag "Search", name: nil %>
  </p>
<% end %>

<% if params[:q] && @results.blank? %>
  <p>No results found for <%= params[:q] %></p>
<% end %>

<% @results.each do |group, records| %>
  <h3><%= group.titleize %></h3>

  <ul>
    <% records.each do |record| %>
      <% record_link = "api/v1/#{group}/#{record['_id']}" %>

      <li>
        <%= link_to record_link, record_link %>
      </li>
    <% end %>
  </ul>
<% end %>
     ```

## Test the implementation

Now if you fire up the rails server `rails s` and go to `localhost:3000/search`, you should see a view with search box in it.

Type relevant text and hit search.

Tada 🎉 

You will see search results with link to its detail page. If there are no results you will see "No search results found for [query]"

## Highlight matched text

Let's take it one step further and add a functionality to highlight matching text.

1. Update the search query in controller to include `{ body: highlight_fields }`:

     ```rb
       @results = Elasticsearch::Model
                   .search(params[:q], [], { body: highlight_fields })
                   .results.as_json
                   .group_by { |result| result['_index'] }
     ```

2. Add private method for highlight fields

     ```rb
       private

  def highlight_fields
    {
      highlight: {
        fields: {
          first_name: {},
          last_name: {},
          email: {},
          value: {},
          ref_number: {}
        }
      }
    }
  end
     ```

Your final controller should look like this:

```rb
  class SearchController < ApplicationController
  def search
    if params[:q].blank?
      @results = []
    else
      @results = Elasticsearch::Model
                   .search(params[:q], [], { body: highlight_fields })
                   .results.as_json
                   .group_by { |result| result['_index'] }
    end
  end

  private

  def highlight_fields
    {
      highlight: {
        fields: {
          first_name: {},
          last_name: {},
          email: {},
          value: {},
          ref_number: {}
        }
      }
    }
  end
end
```

3. Update view to show highlighted text

   Add following code just below the link

   ```erb
     <% record['highlight']&.each do |key, snippet| %>
          <p><%= "#{key} - #{sanitize(snippet[0])}" %></p>
        <% end %>
   ```

   Your final view should look like this:

```
  <h1>App Search</h1>

<%= form_for search_path, method: :get do |f| %>
  <p>
    <%= f.label "Search for" %>
    <%= text_field_tag :q, params[:q] %>
    <%= submit_tag "Search", name: nil %>
  </p>
<% end %>

<% if params[:q] && @results.blank? %>
  <p>No results found for <%= params[:q] %></p>
<% end %>

<% @results.each do |group, records| %>
  <h3><%= group.titleize %></h3>

  <ul>
    <% records.each do |record| %>
      <% record_link = "api/v1/#{group}/#{record['_id']}" %>

      <li>
        <%= link_to record_link, record_link %>

        <% record['highlight']&.each do |key, snippet| %>
          <p><%= "#{key} - #{sanitize(snippet[0])}" %></p>
        <% end %>
      </li>
    <% end %>
  </ul>
<% end %>
```

Now if you search again, you should also see the highlighted text with em tag.

## Concern: what if record link should actually be for associated data? For e.g. when searching subscription line property it should actually go to agreement
	
## Deploying the app to server (Don't cover in this tutorial)
	- Configuring elastic search in database.yml so that one elastic search server runs for only one application

## Image Credits

- Photo by <a href="https://unsplash.com/@jontyson?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Jon Tyson</a> on <a href="https://unsplash.com/s/photos/search-engine?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>