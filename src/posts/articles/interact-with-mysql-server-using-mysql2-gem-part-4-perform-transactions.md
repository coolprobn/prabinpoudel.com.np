---
uid: 'PB-A-8'
title: 'Interact with Mysql Server using mysql2 gem [Part 4] - Perform Transactions'
date: 2021-02-21
path: /articles/interact-with-mysql-server-using-mysql2-gem-part-4-perform-transactions/
excerpt: 'In this part, we will learn about how we can perform transactions in the external mysql database using mysql2 gem. Transactions helps us in making multiple queries to database ensuring all queries are performed or none at all.'
image: ../../images/articles/interact-with-mysql-server-using-mysql2-gem-part-4-perform-transactions.webp
categories: [articles]
tags: [ruby on rails, mysql, tutorial]
toc: true
featured: false
comments: true
canonical: true
canonical_url: ''
---

This is the fourth part of the series where we create service to interact with mysql server in rails using mysql2 gem.

## Others in series

- <a href="/articles/interact-with-mysql-server-using-mysql2-gem-part-1-select-operations/">Interact with MySQL Server using mysql2 gem [Part 1] - Select Operations</a>
- <a href="/articles/interact-with-mysql-server-using-mysql2-gem-part-2-insert-and-update-operations/">Interact with MySQL Server using mysql2 gem [Part 2] - Insert and Update Operations</a>
- <a href="/articles/interact-with-mysql-server-using-mysql2-gem-part-3-prepared-statements/">Interact with MySQL Server using mysql2 gem [Part 3] - Prepared Statements</a>

## Requirements

- [x] Service to connect with external mysql server
- [x] Perform basic query: select, insert and update
- [x] Prepared statement
- [ ] Perform transactions
- [ ] Perform join query

In previous three articles, we created a service, added methods to help us perform select, insert and update operations and also added method to help us in performing prepared statements. Today we will be looking at performing transactions in mysql server using mysql2 gem.

## In this blog

We will be learning the following in this blog:

- Perform transactions

## Transaction

A transaction helps us in performing multiple queries to database. Though each query is performed one by one, the concept of transaction is either perform all queries or none at all which means even if one query fails, changes made by all other queries will be undone from the database.

Transaction is very helpful when we have to make sure that all queries are performed successfully. The most famous example for this is money transfer via bank, i.e. when one person transfers amount to another persons' account, amount from first account should be decreased and amount from second account should be increased. This can't be failed as this affects one/both person severely. In this case transaction is used to ensure that decrease and increase of amount is made on both side or transfer is failed as a whole.

### Performing Transaction

Here is what we will do for supporting transactions in our service:

1. Accept `transaction_attributes_array` parameter in both `insert` and `update` method. `transaction_attributes` is an array of hashes which includes name of a table for the query, it's primary column and finally attribute hash needed to perform the operation.
2. Create new method `prepare_transaction_queries` which will take `transaction_attributes_array` as params and return array of prepared queries.
3. In `insert` and `update`, we will push existing/main query to transaction queries array for performing transactions.
4. For performing transactions we will add a method `perform_transaction` which will accept a block i.e. queries here.
5. `perform_transaction` method will then call another method called `transaction` which will wrap all queries inside **BEGIN** and **COMMIT** and execute them one by one. This is a standard way of performing transactions in MySQL. Also we will rescue and execute **ROLLBACK** in case any of the query in the array fails to execute.

#### Code

```ruby
INSERT_QUERY_TYPE = 'insert'.freeze
UPDATE_QUERY_TYPE = 'update'.freeze

def insert(attributes, transaction_attributes_array = [])
  query = prepare_query(attributes, INSERT_QUERY_TYPE)

  transaction_queries = prepare_transaction_queries(transaction_attributes_array, INSERT_QUERY_TYPE)

  transaction_queries.push(query)

  perform_mysql_operation do
    perform_transaction(INSERT_QUERY_TYPE, transaction_queries)

    puts 'Record inserted!'
  end
end

def update(id, attributes, transaction_attributes_array = [])
  query = prepare_query(attributes, UPDATE_QUERY_TYPE)

  transaction_queries = prepare_transaction_queries(transaction_attributes_array, UPDATE_QUERY_TYPE)

  transaction_queries.push(query)

  perform_mysql_operation do
    perform_transaction(UPDATE_QUERY_TYPE, transaction_queries, id)

    puts 'Record Updated!'
  end
end

private

def prepare_insert_query(keys, transaction_table = nil)
  columns = keys.join(', ')
  substituted_columns = keys.map { '?' }.join(', ')
  table_name = transaction_table || table

  "INSERT INTO #{table_name} (#{columns}) VALUES (#{substituted_columns})"
end

def prepare_update_query(keys, transaction_table = nil, transaction_primary_column = nil)
  columns = keys.map { |key| "#{key} = ?" }.join(', ')
  table_name = transaction_table || table
  primary_column_name = transaction_primary_column || primary_column

  "UPDATE #{table_name} SET #{columns} WHERE #{primary_column_name} = ?"
end

def primary_column_hash(query_type, primary_column, attributes)
  return {} if primary_column.nil? || query_type == INSERT_QUERY_TYPE

  column_hash = {}
  primary_column_symbol = primary_column.to_sym

  column_hash[primary_column_symbol] = attributes[primary_column_symbol]

  {
    **column_hash,
    primary_column_name: primary_column
  }
end

def prepared_query_by_type(query_type, keys, transaction_table = nil, transaction_primary_column = nil)
  if query_type == INSERT_QUERY_TYPE
    prepare_insert_query(keys, transaction_table)
  else
    prepare_update_query(keys, transaction_table, transaction_primary_column)
  end
end

def prepare_query(attributes, type, transaction_table = nil, transaction_primary_column = nil)
  raise 'Attributes cannot be empty' if attributes.empty?

  keys = attributes.keys
  values = attributes.values

  {
    prepared_query: prepared_query_by_type(type, keys, transaction_table, transaction_primary_column),
    values: values
  }
end

def params_for_prepare_query(query_type, transaction_attribute)
  attributes = transaction_attribute[:attributes]
  transaction_table = transaction_attribute[:table]
  default_params = [attributes, query_type, transaction_table]

  return default_params if query_type == INSERT_QUERY_TYPE

  transaction_primary_column = transaction_attribute[:primary_column]

  default_params.push(transaction_primary_column)
end

def prepare_transaction_queries(attributes_array, type)
  attributes_array.map do |transaction_attribute|
    params = params_for_prepare_query(type, transaction_attribute)

    {
      **primary_column_hash(type, transaction_attribute[:primary_column], transaction_attribute[:attributes]),
      **prepare_query(*params)
    }
  end
end

def transaction
  raise ArgumentError, 'No block was given' unless block_given?

  begin
    mysql_client.query('BEGIN')
    yield
    mysql_client.query('COMMIT')
  rescue StandardError => e
    mysql_client.query('ROLLBACK')

    raise e
  end
end

def perform_insert_transaction(transaction_queries)
  transaction_queries.each do |transaction_query|
    statement = mysql_client.prepare(transaction_query[:prepared_query])
    statement.execute(*transaction_query[:values])
  end
end

def perform_update_transaction(transaction_queries, main_table_id)
  transaction_queries.each do |transaction_query|
    values = transaction_query[:values]
    primary_column_name = transaction_query[:primary_column_name]
    record_id = primary_column_name && transaction_query[primary_column_name.to_sym] || main_table_id
    values.push(record_id)

    statement = mysql_client.prepare(transaction_query[:prepared_query])
    statement.execute(*values)
  end
end

def perform_transaction(query_type, transaction_queries, main_table_id = nil)
  transaction do
    if query_type == INSERT_QUERY_TYPE
      perform_insert_transaction(transaction_queries)
    else
      perform_update_transaction(transaction_queries, main_table_id)
    end
  end
end
```

#### Explanation

There's a lot of refactoring going on here. Don't get overwhelmed just yet, we will go through each one of them. We had to refactor existing methods to support transactions. Let's now go through each methods and understand the refactor as well as transactions process.

1. `insert`, `update`

   - `insert` and `update` is taking additional param `transaction_attributes_array` which is an array of hashes with required information for each query needed to perform transactions. Following is happening inside these methods:
   - `transaction_attributes_array` is sent to `prepare_transaction_queries` which converts each transaction query to prepared query and returns array of prepared transaction queries.
   - We are pushing main query to the array since all queries have to be performed in same transaction.
   - Finally we are performing transactions by calling `perform_transaction` method and sending all transaction queries.

2. `prepare_transaction_queries`

   - `prepare_transaction_queries` is taking params `attributes_array` and `type`. `transaction_attributes_array` is sent to `attributes_array` while nature of query i.e. insert or update is sent to `type`.
   - Each transaction attribute is iterated one by one to get required query for transaction.

3. `params_for_prepare_query`

   - `params_for_prepare_query` is taking params `query_type` and `transaction_attributes`. `transaction_attributes` is a hash with `attributes`, `table_name` and `primary_column` required for preparing single query.
   - If `query_type` is **insert** then params returned are `[attributes, query_type, transaction_table]` where `attributes` is a hash of attributes of the transaction query. `transaction_table` is the name of the table to perform query on.
   - If `query_type` is **update**, we are pushing `primary_column` to the `default_params`. `primary_column` which helps us in specifying the record we need to update. You can view method `prepare_update_query` method to see how the `primary_column` is being used for that purpose.

4. `primary_column_hash`

   - `primary_column_hash` is receiving params `query_type`, `primary_column` and `attributes`
   - Params description is same as above method `params_for_prepare_query`
   - Empty hash is returned if query type is `insert` else primary column attribute of the transaction query is returned together with the name of primary column in `primary_column_name`
   - This is required when pushing value of primary_column to other attributes' values while updating the record. You can view method `perform_update_transaction` to see how we are using `primary_column_name` and pushing the primary column attribute value to other attribute values.

5. `prepare_query`

   - `prepare_query` is taking additional params `transaction_table` and `transaction_primary_column` required for preparing transaction queries based on the query type.

6. `prepared_query_by_type`

   - Responsibility of `prepared_query_by_type` is to call either `prepare_insert_query` or `prepare_update_query` based on params `query_type` i.e. **insert** or **update** and return prepared query for performing transactions

7. `prepare_insert_query`

   - For supporting transactions, `prepare_insert_query` is taking additional param `transaction_table`
   - `transaction_table` is the name of table where queries need to be performed on.

8. `prepare_update_query`

   - `prepare_update_query` is taking additional two params `transaction_table` and `transaction_primary_column` for supporting transactions
   - `transaction_primary_column` is the column name for the primary key of the table where transaction needs to be performed on.

9. `perform_transaction`

   - `perform_transaction` takes three params; `query_type`, `transaction_queries` and `main_table_id`
   - `transaction_queries` is an array of queries for performing transactions.
   - `main_table_id` is the id of the record for the main table. You can see `perform_update_transaction` on how it is being used.

10. `transaction`

    - `transaction` takes a block and perform **transactions**.
    - **BEGIN** tells mysql to begin the transaction for performing multiple queries to database.
    - **yield** is supporting block of code, inside the block, each query in an array is executed one by one with a loop.
    - Finally **COMMIT** tells mysql to commit all transactions to database and persist all of it.
    - We are rescuing and rolling back all the performed queries in case error occurs with **ROLLBACK** i.e. if even one query fails, all other queries count as failed and nothing is persisted to the database

11. `perform_insert_transaction`

    - `perform_insert_transaction` is taking param `transaction_queries`
    - Each query inside transaction is prepared and executed one by one in a loop

12. `perform_update_transaction`

    - `perform_update_transaction` is taking additional param `main_table_id` apart from `transaction_queries`
    - `main_table_id` is the id of a record for the main table in our service.
    - As with insert, we are processing each query in a loop.
    - We are storing all values of the operation inside `values`
    - If query is not the main one, i.e. is related transaction query, we are extracting name of its primary column stored inside key **`primary_column_name`** to variable `primary_column_name`
    - If the query is not the main, we are storing `main_table_id` else we are extracting value of the key **`primary_column_name`** and storing it to variable `record_id`
    - We are then pushing the id of the record to the existing values
    - Finally, we are preparing and executing the query in and to the database.

Practically:

`transaction_attributes_array` contains

```ruby
# For insert transactions
[
  {
    table: 'users',
    attributes: {
      first_name: 'John',
      last_name: 'Doe'
    },
    primary_column: 'id',
  },
  {
    table: 'users',
    attributes: {
      first_name: 'Jane',
      last_name: 'Doe'
    },
    primary_column: 'id',
  }
]

# For update transactions
[
  {
    table: 'users',
    attributes: {
      id: 115,
      first_name: 'John'
    },
    primary_column: 'id',
  },
  {
    table: 'users',
    attributes: {
      id: 116,
      last_name: 'Doe'
    },
    primary_column: 'id',
  }
]
```

- As discussed previously in <a href="/articles/interact-with-mysql-server-using-mysql2-gem-part-3-prepared-statements/">last article</a>, `prepare_query` converts primary table attributes to prepared statement.
- We are sending **`transaction_attributes_array`** to `prepare_transaction_queries` for receiving array of queries.
- This is what we will receive back depending on the nature of operation we are performing i.e. insert or update

  ```ruby
    # insert
    [
      {
        :prepared_query=>"INSERT INTO users (first_name, last_name) VALUES (?, ?)",
        :values=>["John", "Doe"]
      },
      {
        :prepared_query=>"INSERT INTO users (first_name, last_name) VALUES (?, ?)", :values=>["Jane", "Doe"]
      }
    ]

    # update
    [
      {
        :id => 115,
        :primary_column_name => "id",
        :prepared_query => "UPDATE users SET id = ?, first_name = ? WHERE id = ?",
        :values => [115, "John"]
      },
      {
        :id => 116,
        :primary_column_name => "id",
        :prepared_query => "UPDATE users SET id = ?, last_name = ? WHERE id = ?",
        :values => [116, "Doe"]
      }
    ]
  ```

- Then we will push main query to the transaction queries since we will have to perform all queries in one transactions and roll all back if error occurs.
- `perform_transaction` method wraps all queries in one single transaction
- Finally all queries in the array are executed one by one and inserted or updated to and in mysql database using mysql2 gem.

## Final Code

If you have been following the tutorial from part 1, you will have following in your service file:

```ruby
require 'mysql2'

module MySqlServer
  module Database
    class Connect
      INSERT_QUERY_TYPE = 'insert'.freeze
      UPDATE_QUERY_TYPE = 'update'.freeze

      attr_reader :mysql_client, :table, :primary_column

      def initialize(table, primary_column)
        @table = table
        @primary_column = primary_column
      end

      def fetch_all
        perform_mysql_operation do
          result = mysql_client.query("SELECT ce_id, ce_peername from #{table}")

          puts result.entries
        end
      end

      def fetch_one(id)
        perform_mysql_operation do
          result = mysql_client.query("SELECT * from #{table} WHERE #{primary_column}=#{id}")

          puts result.entries
        end
      end

      def insert(attributes, transaction_attributes_array = [])
        query = prepare_query(attributes, INSERT_QUERY_TYPE)

        transaction_queries = prepare_transaction_queries(transaction_attributes_array, INSERT_QUERY_TYPE)

        transaction_queries.push(query)

        perform_mysql_operation do
          perform_transaction(INSERT_QUERY_TYPE, transaction_queries)

          puts 'Record inserted!'
        end
      end

      def update(id, attributes, transaction_attributes_array = [])
        query = prepare_query(attributes, UPDATE_QUERY_TYPE)

        transaction_queries = prepare_transaction_queries(transaction_attributes_array, UPDATE_QUERY_TYPE)

        transaction_queries.push(query)

        perform_mysql_operation do
          perform_transaction(UPDATE_QUERY_TYPE, transaction_queries, id)

          puts 'Record Updated!'
        end
      end

      private

      def connect_to_db
        host = '172.20.20.206'
        database = 'asterisk'
        username = 'asterisk-staging'
        password = 'iBBJUdPVdsSD7K5w'

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

      def prepare_insert_query(keys, transaction_table = nil)
        columns = keys.join(', ')
        substituted_columns = keys.map { '?' }.join(', ')
        table_name = transaction_table || table

        "INSERT INTO #{table_name} (#{columns}) VALUES (#{substituted_columns})"
      end

      def prepare_update_query(keys, transaction_table = nil, transaction_primary_column = nil)
        columns = keys.map { |key| "#{key} = ?" }.join(', ')
        table_name = transaction_table || table
        primary_column_name = transaction_primary_column || primary_column

        "UPDATE #{table_name} SET #{columns} WHERE #{primary_column_name} = ?"
      end

      def primary_column_hash(query_type, primary_column, attributes)
        return {} if primary_column.nil? || query_type == INSERT_QUERY_TYPE

        column_hash = {}
        primary_column_symbol = primary_column.to_sym

        column_hash[primary_column_symbol] = attributes[primary_column_symbol]

        {
          **column_hash,
          primary_column_name: primary_column
        }
      end

      def prepared_query_by_type(query_type, keys, transaction_table = nil, transaction_primary_column = nil)
        if query_type == INSERT_QUERY_TYPE
          prepare_insert_query(keys, transaction_table)
        else
          prepare_update_query(keys, transaction_table, transaction_primary_column)
        end
      end

      def prepare_query(attributes, type, transaction_table = nil, transaction_primary_column = nil)
        raise 'Attributes cannot be empty' if attributes.empty?

        keys = attributes.keys
        values = attributes.values

        {
          prepared_query: prepared_query_by_type(type, keys, transaction_table, transaction_primary_column),
          values: values
        }
      end

      def params_for_prepare_query(query_type, transaction_attribute)
        attributes = transaction_attribute[:attributes]
        transaction_table = transaction_attribute[:table]
        default_params = [attributes, query_type, transaction_table]

        return default_params if query_type == INSERT_QUERY_TYPE

        transaction_primary_column = transaction_attribute[:primary_column]

        default_params.push(transaction_primary_column)
      end

      def prepare_transaction_queries(attributes_array, type)
        attributes_array.map do |transaction_attribute|
          params = params_for_prepare_query(type, transaction_attribute)

          {
            **primary_column_hash(type, transaction_attribute[:primary_column], transaction_attribute[:attributes]),
            **prepare_query(*params)
          }
        end
      end

      def transaction
        raise ArgumentError, 'No block was given' unless block_given?

        begin
          mysql_client.query('BEGIN')
          yield
          mysql_client.query('COMMIT')
        rescue StandardError => e
          mysql_client.query('ROLLBACK')

          raise e
        end
      end

      def perform_insert_transaction(transaction_queries)
        transaction_queries.each do |transaction_query|
          statement = mysql_client.prepare(transaction_query[:prepared_query])
          statement.execute(*transaction_query[:values])
        end
      end

      def perform_update_transaction(transaction_queries, main_table_id)
        transaction_queries.each do |transaction_query|
          values = transaction_query[:values]
          primary_column_name = transaction_query[:primary_column_name]
          record_id = primary_column_name && transaction_query[primary_column_name.to_sym] || main_table_id
          values.push(record_id)

          statement = mysql_client.prepare(transaction_query[:prepared_query])
          statement.execute(*values)
        end
      end

      def perform_transaction(query_type, transaction_queries, main_table_id = nil)
        transaction do
          if query_type == INSERT_QUERY_TYPE
            perform_insert_transaction(transaction_queries)
          else
            perform_update_transaction(transaction_queries, main_table_id)
          end
        end
      end
    end
  end
end

```

After this, our service should be able to perform all basic, prepared operations and transactions in and to the external mysql server using mysql2 gem. Next week we will learn how to perform join operations using mysql2 gem. Yes we will be joining a lot of tables next week and next article will be the final one in the series. Thank you and stay tuned!

**Image Credits:** Cover Image by <a href="https://unsplash.com/@peiobty?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Pierre Borthiry</a> on <a href="https://unsplash.com/s/photos/computer-and-money?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Unsplash</a>
