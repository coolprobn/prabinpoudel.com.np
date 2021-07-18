---
title: 'Update Multiple Records at Once in Rails'
date: 2021-07-18
path: /notes/update-multiple-records-at-once-in-rails/
excerpt: "We can update static values of existing records with the method update_all. But what if we want to update records with different value for different attributes? In this blog, we will be looking at the solution on updating multiple records at once in Rails when each record can have different attribute and value."
image: ../../images/notes/update-multiple-records-at-once-in-rails.webp
categories: [notes]
tags: [ruby on rails]
toc: true
featured: true
comments: true
---

Rails provides a built-in **create** method for adding multiple records in single line of code or in more technical term "batch create". For update, if we want to update attributes with same value for all available records then we can do so with the method `update_all`. 

But what if we want to update multiple attributes at once and for multiple records? How do we "batch update" in Rails?

We will be looking at the answer to that question today in this blog.

For updating multiple records at once, there may be two cases; when we want to update

- Same attribute/s in all rows
- Different attributes in each row

## Update same attribute/s in all rows

To update same attributes with same values in all rows of the table, we can use the Rails method **update_all**

For e.g. If we want to update all users with `first_name` "John" to "Jessica", we can do so with following code:

```cmd
User.where(first_name: 'John').update_all(first_name: 'Jessica')
```

## Update different attributes in each row

Let's suppose we have a model User and we want to update existing records inside with different **name**.

For e.g. we want to update records with the following JSON:

```ruby
formatted_users = [
  {
    id: 1,
    name: 'John Doe'
  },
  {
    id: 2,
    name: 'Jessica Jones'
  },
  {
    id: 3,
    name: 'Robert Junior'
  }
]
```

Did you notice? Each user has different name that needs to be updated.

Let's see how we can update multiple records like these at once in Rails.

1. Index records by their id

    First of all, we should index all records by their id, for that we will be using **index_by** which  returns records grouped by the id and all records will be inside the hash.

    ```ruby
      grouped_users = formatted_users.index_by( {|user| user[:id]})

      # index_by will return the following hash
      # => {1=>{:id=>1, :name=>"John Doe"}, 2=>{:id=>2, :name=>"Jessica Jones"}, 3=>{:id=>3, :name=>"Robert Junior"}}
    ```

2. Update grouped records

    After grouping all records by their id, we will pass all ids as a first argument and their attributes as the second attribute to the method **update**. This way all our records will be updated at once without us having to loop through each record and calling `update` each time.

    ```ruby
      User.update(grouped_users.keys, grouped_users.values)
    ```

## Conclusion

This way we can update multiple records with different attributes from a hash or JSON.

One thing to note is, this solution is not optimized or efficient for large set of records because for each record, we will be hitting database with the update query. That can take significant memory and also more time to execute large set of records.

Do you have more optimized solutions? Let us know in the comment.

Thank you for reading. Happy Coding!

## References

- <a href="https://stackoverflow.com/questions/28694498/is-there-anything-like-batch-update-in-rails/28695476#28695476" target="_blank" rel="noopener">Is there anything like batch update in rails? [Stack Overflow]</a>
- <a href="https://cbabhusal.wordpress.com/2015/01/03/updating-multiple-records-at-the-same-time-rails-activerecord/" target="_blank" rel="noopener">Updating multiple records at the same time rails active record [Cba Bhusal Blog]</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@salvoventura?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">salvatore ventura</a> on <a href="https://unsplash.com/s/photos/pencils?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
  