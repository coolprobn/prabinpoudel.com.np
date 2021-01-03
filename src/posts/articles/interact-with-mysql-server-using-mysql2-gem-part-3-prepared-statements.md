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

This is the third part of the series where we create service to interact with mysql server in rails. You can read the second part <a href="/articles/creating-service-to-interact-with-external-mysql-server-in-rails-part-2/">here</a>, if you haven't already.

## Prepared Statement

From <a href="https://en.wikipedia.org/wiki/Prepared_statement" target="_blank">wikipedia</a>:

> In database management systems (DBMS), a prepared statement or parameterized statement is a feature used to execute the same or similar database statements repeatedly with high efficiency. Typically used with SQL statements such as queries or updates, the prepared statement takes the form of a template into which certain constant values are substituted during each execution.

What it means for our service is we will replace the actual value in insert and update query with question mark(?) and send the actual values only the second time. Let's refactor the code.

### Prepared Insert Query

Here is what we will do for supporting prepared statements in our insert operation:

1. Remove the method `format_insert_query` because it is dumping all attributes and values in single query while we need to use placeholder (?) and perform operation in two phases; one, prepare the query and two, send values to create in database.
2. Create `prepare_query` method which will format the query as needed and provide us the hash with query and values.
3. Update `insert` method to perform prepared statement.

After doing all of the above, our code will look like this:

```ruby
def insert(attributes)
  query = prepare_query(attributes)

  perform_mysql_operation do
    mysql_connect.prepare(query[:prepared_query])
    mysql_connect.execute(*query[:values])

    puts 'Record inserted!'
  end
end

private

def prepare_query(attributes)
  raise 'Attributes cannot be empty' if attributes.empty?

  keys = attributes.keys
  columns = keys.join(', ')
  substituted_columns = keys.map { '?' }.join(', ')

  prepared_query = "INSERT INTO #{table} (#{columns}) VALUES (#{substituted_columns})"

  values = attributes.values

  {
    prepared_query: prepared_query,
    values: values
  }
end
```

### Explanation

`prepare_query` is taking `attributes` hash parameter from `insert` method and returning hash with prepared query and values to insert to database. Following is happening inside the method:

- Get column names by formatting key part of attributes
- Format column names and add comma (,)
- Format column names and add placeholder (?) then add comma (,)
- Prepare insert query
- Collect only values of attributes hash
- Return a new hash with prepared query and values

Following is happening inside `insert` method:

- Call `prepare_query` which returns hash with prepared query and values needed for insert operation
- Prepare query with `prepare` method provided by mysql2 gem
- Insert record to database with `execute` method

Practically:

- `{first_name: 'John', last_name: 'Doe'}` will be received as `attributes` parameter, which will be sent to `prepare_query` to get hash having formatted query and values
- Inside `prepare_query`, `columns` will have `"first_name, last_name"`, `substituted_columns` will have `"?, ?"` i.e. the number of values that will be inserted. If `table` was `users`, `prepared_query` will be `"INSERT INTO users (first_name, last_name) VALUES (?, ?)"` and `values` will have `['John', 'Doe']`
- After receiving hash from `prepare_query`, `insert` method will now prepare the query with `prepare` method and insert to database with `execute` method.

## Prepared Update Query

Insert and update query has only one difference when query is prepared so we want to use same `prepare_query` method used in insert operation/. To do that we will update the code and do the following:

1. Remove the method `format_update_query`.
2. Update `prepare_query` method to support both insert and update operation.
3. In `prepare_query`, we will add `type` params which can differentiate between insert and update operation.
4. We will extract prepared statement for insert operation to new method `prepare_insert_query` and add `prepare_update_query` for formatting update query.
5. Depending on `type` param, we will call related method that is formatting the prepared queries.
6. Update `update` method to perform prepared statement.

### Code

```ruby
def update(id, attributes)
  query = prepare_query(attributes, 'update')
  values = query[:values]
  values.push(id)

  perform_mysql_operation do
    mysql_connect.prepare(query[:prepared_query])
    mysql_connect.execute(*values)

    puts 'Record Updated!'
  end
end

private

def prepare_insert_query(keys)
  columns = keys.join(', ')
  substituted_columns = keys.map { '?' }.join(', ')

  "INSERT INTO #{table} (#{columns}) VALUES (#{substituted_columns})"
end

def prepare_update_query(keys)
  columns = keys.map { |key| "#{key} = ?" }.join(', ')

  "UPDATE #{table} SET #{columns} WHERE #{primary_column} = ?"
end

def prepare_query(attributes, type)
  raise 'Attributes cannot be empty' if attributes.empty?

  keys = attributes.keys

  prepared_query = type == 'insert' ? prepare_insert_query(keys) : prepare_update_query(keys)

  values = attributes.values

  {
    prepared_query: prepared_query,
    values: values
  }
end
```

### Explanation

Only change in `update` to `insert` is; it's also taking `id` as parameters. `id` lets us know which existing record we want to update in database. It is getting prepared query and values for updating in database, concept is same as `insert` with change in query and values where `id` value is added to the values that are returned from `prepare_query` hash.

Practically:

- If we are providing `id=1` and `attributes` same as insert query, `prepare_query` will return query `"UPDATE users SET first_name = ?,last_name = ? WHERE id = ?"` and values `['John', 'Doe']`
- Since we also have placeholder for `id`, we will need to add id to the values, so values will now contain `['John', 'Doe', 1]`
- After this, as with insert operation, first queries are prepared and then values are updated in the database.

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
        query = prepare_query(attributes, 'insert')

        perform_mysql_operation do
          mysql_connect.prepare(query[:prepared_query])
          mysql_connect.execute(*query[:values])

          puts 'Record inserted!'
        end
      end

      def update(id, attributes)
        query = prepare_query(attributes, 'update')
        values = query[:values]
        values.push(id)

        perform_mysql_operation do
          mysql_connect.prepare(query[:prepared_query])
          mysql_connect.execute(*values)

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

      def prepare_insert_query(keys)
        columns = keys.join(', ')
        substituted_columns = keys.map { '?' }.join(', ')

        "INSERT INTO #{table} (#{columns}) VALUES (#{substituted_columns})"
      end

      def prepare_update_query(keys)
        columns = keys.map { |key| "#{key} = ?" }.join(', ')

        "UPDATE #{table} SET #{columns} WHERE #{primary_column} = ?"
      end

      def prepare_query(attributes, type)
        raise 'Attributes cannot be empty' if attributes.empty?

        keys = attributes.keys

        prepared_query = type == 'insert' ? prepare_insert_query(keys) : prepare_update_query(keys)

        values = attributes.values

        {
          prepared_query: prepared_query,
          values: values
        }
      end
    end
  end
end
```

After this our service should be able to perform all basic and prepared operations in and to the external mysql server. Next week we will learn to perform transaction operations i.e. we will be performing multiple queries and rollback all operations if there is error in even one of the operation. Thank you and stay tuned!

**Image Credits:** Cover Image by <a href="https://unsplash.com/@fabioha?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">fabio</a> on <a href="https://unsplash.com/s/photos/database?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Unsplash</a>
