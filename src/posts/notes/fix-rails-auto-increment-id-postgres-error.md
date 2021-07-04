---
title: '[Fix] Rails Auto Increment ID Postgres Error'
date: 2021-07-04
path: /notes/fix-rails-auto-increment-id-postgres-error/
excerpt: "Fix for the error: PG::UniqueViolation: ERROR: duplicate key value violates unique constraint 'users_pkey' DETAIL: Key (id)=(43957) already exists"
image: ../../images/notes/fix-rails-auto-increment-id-postgres-error.webp
categories: [notes]
tags: [ruby on rails, postgresql]
toc: true
featured: true
comments: true
---

## Error

ActiveRecord::RecordNotUnique Exception: PG::UniqueViolation: ERROR:  duplicate key value violates unique constraint "users_pkey"
DETAIL:  Key (id)=(43957) already exists.

## Detail

You normally run into this error when you restore database from another source, for e.g. production or staging server.

This happens because of database sequence for Postgres that is stored in local machine is not the same as what comes from restored database and same id can be assigned twice when auto incrementing by Rails application.

## Solution

We can reset the sequence of the table that is stored in the local machine by Postgres to fix this issue.

1. Go to rails console
   
   `rails c`

2. Reset the Postgres sequence for the table

    You can reset the Postgres sequence with the following command:

    `ActiveRecord::Base.connection.reset_pk_sequence!('table_name')`

    E.g. Assuming the table name is **users**, you can do the following:
    
    `ActiveRecord::Base.connection.reset_pk_sequence!('users')` 

## Conclusion

After resetting the sequence of table stored by Postgres, new records will be created without any issues.

Thanks for reading. Happy Coding!

## References

- <a href="https://stackoverflow.com/a/56863898/9359123" target="_blank" rel="noopener">Rails auto-assigning id that already exists [Stack Overflow]</a> 

## Image Credits

- Cover Image by <a href="https://unsplash.com/@brett_jordan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Brett Jordan</a> on <a href="https://unsplash.com/s/photos/identity?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
  