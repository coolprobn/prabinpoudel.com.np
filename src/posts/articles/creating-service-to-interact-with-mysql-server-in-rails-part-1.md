---
uid: 'PB-A-5'
title: 'Creating Service to Interact with Mysql Server in Rails [Part 1]'
date: 2020-09-13
path: /articles/creating-service-to-interact-with-external-mysql-server-in-rails-part-1/
excerpt: "Everything is easy in rails with Active Record but what if you have to communicate with external mysql server? Gotcha! Let's create a service to perform queries we want."
image: ../../images/articles/creating-service-to-interact-with-external-mysql-server-in-rails-part-1.webp
categories: [articles]
tags: [ruby on rails, mysql]
toc: true
featured: false
comments: true
canonical: true
canonical_url: 'https://truemark.com.np/blog/reset-password-in-react-and-rails/'
---

Rails has made our lives easier. If we are talking in terms of querying database, active record has got us covered. But what if we had to communicate with external database?

Recently in one of the project that I worked on, I had to perform insert, update, select, and other different queries to external MariaDB server and I didn't know what to do. I figured out that it would be easy if I created a service which can work like ORM to perform the query I wanted.

In this part, we will work on creating service to connect with external mysql server and perform basic insert query.

## Skills required to follow the tutorial

Intermediate in:

- Rails
- Sql

## Requirements

- Service to connect with external mysql server
- Perform basic query: select, insert and update
- Perform prepended query
- Perform transaction
- Perform join query

## Service to connect with external mysql server

We will be using <a href="https://github.com/brianmario/mysql2" target="_blank">mysql2</a> gem for our purpose. Let's first create a service to connect with external mysql server.

Create a file **connect.rb** inside `lib/mysql_server/database` and add the following to it.

```ruby
require 'mysql2'

module MysqlServer
    module Database
      class Connect
        attr_reader :mysql_connect

        def initialize
          @mysql_connect = connect_to_db
        end

        private

        def connect_to_db
          host = ENV['MYSQL_SERVER_IP']
          username = ENV['MYSQL_USERNAME']
          password = ENV['MYSQL_PASSWORD']
          database = ENV['MYSQL_DB_NAME']

          Mysql2::Client.new(username: username, password: password, database: database, host: host)
        end

        def perform_mysql_operation
        raise ArgumentError, 'No block was given' unless block_given?

        begin
          yield
        rescue StandardError => e
          raise e
        ensure
          pg_connect&.close
        end
      end
      end
    end
end
```

Here, we are creating a service with private method that connects to our external mysql database. We are using host, username, password and database name from `application.yml`.

In `perform_mysql_operation`, for security reasons, we are making sure that connection to external database is closed once all the querying operation is done. We will use this method next while performing insert operation.

## Perform basic query: select, insert and update

### Perform select query

Select query lets us fetch row/s from our db.

#### Select all records

```ruby
class Connect
        attr_reader :mysql_connect, :table_name

        def initialize(table_name,)
          @mysql_connect = connect_to_db
          @table_name = table_name
        end

        def fetch_all
          perform_mysql_operation do
            mysql_connect.query()

          end
        end
end

```

#### Select one record

```ruby



```

**Image Credits:** Cover Image by <a href="https://unsplash.com/@fabioha?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">fabio</a> on <a href="https://unsplash.com/s/photos/database?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Unsplash</a>
