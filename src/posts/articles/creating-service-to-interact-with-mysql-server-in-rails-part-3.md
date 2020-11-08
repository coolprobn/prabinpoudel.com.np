---
uid: 'PB-A-7'
title: 'Creating Service to Interact with Mysql Server in Rails [Part 3]'
date: 2020-10-11
path: /articles/creating-service-to-interact-with-external-mysql-server-in-rails-part-3/
excerpt: 'In this part, we will learn about how we can perform prepared statements to the external mysql database. Prepared statements are very useful against SQL injections.'
image: ../../images/articles/creating-service-to-interact-with-external-mysql-server-in-rails-part-1.webp
categories: [articles]
tags: [ruby on rails, mysql, tutorial]
toc: true
featured: false
comments: true
canonical: true
canonical_url: 'https://truemark.com.np/blog/reset-password-in-react-and-rails/'
---

# TODO: Format code properly before merging

This is the third part of the series where we create service to interact with mysql server in rails. You can read the second part <a href="/articles/creating-service-to-interact-with-external-mysql-server-in-rails-part-2/">here</a>, if you haven't already.

## Prepared Statement

From <a href="https://en.wikipedia.org/wiki/Prepared_statement" target="_blank">wikipedia</a>:

> In database management systems (DBMS), a prepared statement or parameterized statement is a feature used to execute the same or similar database statements repeatedly with high efficiency. Typically used with SQL statements such as queries or updates, the prepared statement takes the form of a template into which certain constant values are substituted during each execution.

What it means for our service is we will replace the actual value in insert and update query with question mark(?). Let's refactor the code.

Example query

### Insert Query

```ruby

def insert(attributes)
        query = format_insert_query(attributes)

        perform_mysql_operation do
          mysql_connect.query(query)

          puts 'Record inserted!'
        end
      end

private

def format_insert_query(attributes)
        raise 'Attributes cannot be empty' if attributes.empty?

        columns = attributes.keys.join(',')

        values = attributes.values.collect! {|value| "'#{value}'"}.join(',')

        "INSERT INTO #{table} (#{columns}) VALUES (#{values})"
      end
```

### Explanation

`format_insert_query` is taking `attributes` hash parameter from `insert` method. Following is happening inside the method:

- Get column names by formatting key part of attributes param
- Get values to insert by formatting value part of attributes param
- Construct and return an insert query

Following is happening inside `insert` method:

- Call `format_insert_query` to get a query that can directly be used for insert operation
- Insert to database

Practically:

- `{first_name: 'John', last_name: 'Doe'}` will be received as `attributes` parameter, which will be sent to `format_insert_query` to get formatted query
- Inside `format_insert_query`, `columns` will have value `"first_name,last_name"`; key part of the `attributes` hash, `values` will have `"'John','Doe'"`; value part of the `attributes` hash. Lastly, if `table` was `users` it will return `"INSERT INTO users (first_name,last_name) VALUES ('John','Doe')"`
- Now the `insert` method will send the query to server and new record will be inserted to the database.

## Perform Update Query

Update query is used to update existing record in the database.

### Code

```ruby
def update(id, attributes)
        query = format_update_query(id, attributes)

        perform_mysql_operation do
          mysql_connect.query(query)

          puts 'Record Updated!'
        end
      end

private

def format_update_query(id, attributes)
        raise 'Attributes cannot be empty' if attributes.empty?

        formatted_attributes = attributes.map { |key, value| "#{key}='#{value}'" }.join(',')

        "UPDATE #{table} SET #{formatted_attributes} WHERE #{primary_column}=#{id}"
      end
```

### Explanation

Only change in `update` to `insert` is; it's also taking `id` as parameters. `id` let's us know which existing record we want to update in database. It is getting formatted query and updating in database, concept is same as `insert` with only change in query.

`format_update_query` has slight difference to that of `format_insert_query`; it is converting `attributes` differently, let's see that with practical example below.

- If we are providing `id=1` and `attributes` same as insert query, `format_update_query` will return `"UPDATE user SET first_name='John',last_name='Doe' WHERE id=1"`
- Now the `update` method will send the query to server and update the record with `id=1` in the database.

## Final Code

If you have been following the tutorial from part 1, you will have following in your service file:

```ruby
require 'mysql2'

module MySqlServer
  module Database
    class Connect
      attr_reader :mysql_connect, :table, :primary_column

      def initialize(table, primary_column)
        @table = table
        @primary_column = primary_column
      end

      def fetch_all
        perform_mysql_operation do
          result = mysql_connect.query("SELECT * from #{table}")

          puts result.entries
        end
      end

      def fetch_one(id)
        perform_mysql_operation do
          result = mysql_connect.query("SELECT * from #{table} WHERE #{primary_column}=#{id}")

          puts result.entries
        end
      end

      def insert(attributes)
        query = format_insert_query(attributes)

        perform_mysql_operation do
          mysql_connect.query(query)

          puts 'Record inserted!'
        end
      end

      def update(id, attributes)
        query = format_update_query(id, attributes)

        perform_mysql_operation do
          mysql_connect.query(query)

          puts 'Record Updated!'
        end
      end

      private

      def connect_to_db
        host = ENV['MYSQL_SERVER_IP']
        database = ENV['MYSQL_DB_NAME']
        username = ENV['MYSQL_USERNAME']
        password = ENV['MYSQL_PASSWORD']

        Mysql2::Client.new(username: username, password: password, database: database, host: host)
      end

      def perform_mysql_operation
        raise ArgumentError, 'No block was given' unless block_given?

        begin
          @mysql_connect = connect_to_db

          yield
        rescue StandardError => e
          raise e
        ensure
          mysql_connect&.close
        end
      end

      def format_insert_query(attributes)
        raise 'Attributes cannot be empty' if attributes.empty?

        columns = attributes.keys.join(',')

        values = attributes.values.collect! { |value| "'#{value}'" }.join(',')

        "INSERT INTO #{table} (#{columns}) VALUES (#{values})"
      end

      def format_update_query(id, attributes)
        raise 'Attributes cannot be empty' if attributes.empty?

        formatted_attributes = attributes.map { |key, value| "#{key}='#{value}'" }.join(',')

        "UPDATE #{table} SET #{formatted_attributes} WHERE #{primary_column}=#{id}"
      end
    end
  end
end
```

After this our service should be able to perform basic query in the external mysql server. Next week we will be learning how we can perform query with prepared statement so as to avoid sql injection problem.

**Image Credits:** Cover Image by <a href="https://unsplash.com/@fabioha?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">fabio</a> on <a href="https://unsplash.com/s/photos/database?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Unsplash</a>
