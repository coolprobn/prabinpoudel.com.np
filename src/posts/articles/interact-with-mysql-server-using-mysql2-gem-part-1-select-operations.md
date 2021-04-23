---
title: 'Interact with MySQL Server using mysql2 gem [Part 1] - Performing select operations'
date: 2021-01-03
path: /articles/interact-with-mysql-server-using-mysql2-gem-part-1-select-operations/
excerpt: "Database interaction is very simple in rails with Active Record but what if you have to communicate with external mysql server? Gotcha! Let's create a service to perform queries we want without using Active Record."
image: ../../images/articles/interact-with-mysql-server-using-mysql2-gem-part-1-select-operations.webp
categories: [articles]
tags: [ruby on rails, mysql, tutorial]
toc: true
featured: false
comments: true
canonical: true
canonical_url: 'https://thedevpost.com/blog/mysql-server-mysql2-gem-select-operations/'
last_modified_at: 2021-02-21
---

Rails has made our lives easier. If we are talking in terms of querying database, active record has got us covered. But what if we had to communicate with external database?

Recently in one of the project that I worked on, I had to perform insert, update, select, and other different queries to external MariaDB server. I figured out that it would be very easier in long term if I created a service which can work like ORM to perform the query I wanted.

Service takes `params` as input which is passed from controller to model and then finally to our service. If you are not familiar with `param`, it is a hash of attributes used to create or update in rails.

## Others in series

- <a href="/articles/interact-with-mysql-server-using-mysql2-gem-part-2-insert-and-update-operations/">Interact with MySQL Server using mysql2 gem [Part 2] - Insert and Update Operations</a>
- <a href="/articles/interact-with-mysql-server-using-mysql2-gem-part-3-prepared-statements/">Interact with MySQL Server using mysql2 gem [Part 3] - Prepared Statements</a>
- <a href="/articles/interact-with-mysql-server-using-mysql2-gem-part-4-perform-transactions">Interact with MySQL Server using mysql2 gem [Part 4] - Perform Transactions</a>

## Skills required to follow the tutorial

Intermediate in:

- Rails
- Sql

## Requirements

- Service to connect with external mysql server
- Perform basic query: select, insert and update
- Prepared statement
- Perform transactions
- Perform join query

## In this blog

Our requirement list is very long, so we will split this blog into various parts. We will be looking at the following requirements in this one:

- Service to connect with external mysql server
- Perform basic query: select

## Service to connect with external mysql server

We will be using <a href="https://github.com/brianmario/mysql2" target="_blank">mysql2</a> gem for our purpose. Let's first create a service to connect with external mysql server.

Create a file **connect.rb** inside `lib/my_sql_server/database` and add the following to it.

### Code

```ruby
require 'mysql2'

module MySqlServer
  module Database
    class Connect
      attr_reader :mysql_client

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
          @mysql_client = connect_to_db

          yield
        rescue StandardError => e
          raise e
        ensure
          mysql_client&.close
        end
      end
    end
  end
end
```

### Explanation

Here, we are creating a service with private method `connect_to_db` that connects to our external mysql database. We are using following from <a href="https://github.com/laserlemon/figaro" target="_blank">application.yml</a>:

- host: IP address of external mysql server
- username: User of the database
- password: Database password
- database: Database name

In `perform_mysql_operation`, for security reasons; we are making sure that connection to external database is closed once all the query operation is completed.

## Perform basic query: select

### Select query

Select query lets us fetch row/s from our database.

#### Select all

##### Code

```ruby
class Connect
  attr_reader :mysql_client, :table

  def initialize(table)
    @table = table
  end

  def fetch_all
    perform_mysql_operation do
      result = mysql_client.query("SELECT * from #{table}")

      result.entries
    end
  end
end
```

##### Explanation

We are initializing `table` variable, this is the name of table that we want to perform queries on. We are adding it to initializer so we can use the service with any table we want, it let's our code to be dynamic and flexible.

`fetch_all` method will execute query to fetch all records from the external mysql server. Inside the method, we are using `perform_mysql_operation` which accepts block of our code, catch errors and ensure connection is closed after query is completed.

We are saving the result to `result` which will return an instance of mysql2 class. And to get actual rows, we are using `entries` method.

#### Select one

##### Code

```ruby
class Connect
  attr_reader :mysql_client, :table, :primary_column

  def initialize(table, primary_column)
    @table = table
    @primary_column = primary_column
  end

  def fetch_one(id)
    perform_mysql_operation do
      result = mysql_client.query("SELECT * from #{table} WHERE #{primary_column}=#{id}")

      result.entries
    end
  end
end
```

##### Explanation

We have added `primary_column` to our initializer; this is the column name of the primary key in the table. Although, normally we use `id` as the primary key, that won't always be the case. Primary key can be of any name when working on real project, so we are handling that with `primary_column`.

`fetch_one` is fetching single record from the table. We are passing `id` as the param, which should be the id of a record we want to fetch. We are using `WHERE` condition so as to only fetch a record with that particular id.

## Final Code

```ruby
require 'mysql2'

module MySqlServer
  module Database
    class Connect
      attr_reader :mysql_client, :table, :primary_column

      def initialize(table, primary_column)
        @table = table
        @primary_column = primary_column
      end

      def fetch_all
        perform_mysql_operation do
          result = mysql_client.query("SELECT * from #{table}")

          result.entries
        end
      end

      def fetch_one(id)
        perform_mysql_operation do
          result = mysql_client.query("SELECT * from #{table} WHERE #{primary_column}=#{id}")

          result.entries
        end
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
          @mysql_client = connect_to_db

          yield
        rescue StandardError => e
          raise e
        ensure
          mysql_client&.close
        end
      end
    end
  end
end
```

We created a service that connects to external mysql server and perform basic select operations in this part. We will learn how to perform basic insert and update operation in the <a href="/articles/creating-service-to-interact-with-external-mysql-server-in-rails-part-2/"> next part</a>.

**Image Credits:** Cover Image by <a href="https://unsplash.com/@fabioha?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">fabio</a> on <a href="https://unsplash.com/s/photos/database?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Unsplash</a>
