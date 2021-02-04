---
uid: 'PB-N-2'
title: 'Extract key or value from hash in ruby on rails'
date: 2020-05-30T07:28:34.980Z
last_modified_at: 2020-06-24T01:53:41.410Z
path: /notes/extract-key-value-from-hash-ruby-on-rails/
excerpt: 'Many times when working with pure sql queries for example, we need to extract keys and values separately. Learn how you can extract key or value from hash in Ruby on Rails.'
image: ../../images/notes/extract-key-value-from-hash-ruby-on-rails.webp
categories: [notes]
tags: [ruby, ruby on rails, web development]
comments: true
toc: true
canonical: true
canonical_url: 'https://thedevpost.com/blog/extract-key-or-value-from-hash-in-ror/'
---

When I was recently working in one of the client project, I had to communicate with external mariadb server to store records from react/rails app, that means I would get activerecord hash from our app which I had to convert to pure sql query and send it to external server for storing.

If you have worked with sql queries previously then you must know that keys and values must be separated for insert operations like

```sql
INSERT INTO users (first_name, last_name, email) VALUES (John, Doe, john@email.com)
```

I could convert attributes to hash easily using `as_json` to get the format `{"first_name"=>"John", "last_name"=>"Doe", "email"=>"john@email.com"}`. But I had to extract keys and values separately so that attributes can be accurately formatted and ready for insert and update operations. Let me show you how I extracted keys and values from the hash and formatted them as required for the operations.

Let's assume we have: `user = {"first_name"=>"John", "last_name"=>"Doe", "email"=>"john@email.com"}`

## Extract single key or value

If we only want **email**

```rails-console
// For key
user.extract!("email").keys # ["email"]

// For value

# with extract
user.extract!("email").values # ["john@email.com"]

# simply
user['email'] # "john@email.com"
```

## Extract multiple keys or values

If we want **first_name** and **last_name** but not **email**

```rails-console
// For keys
user.extract!(*["first_name", "last_name"]).keys # ["first_name", "last_name"]

// For values
user.extract!(*["first_name", "last_name"]).values # ["John", "Doe"]
```

## Extract all keys or values

```rails-console
// For keys
user.keys # ["first_name", "last_name", "email"]

// For values
user.values # ["John", "Doe", "john@email.com"]

```

Do you know more elegant or alternative way to extract keys and values from hashes? Please enlighten and guide us with your precious comment below if you do.

**Image Credits:** Cover Image by <a href="https://unsplash.com/@one_more_jan?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Jan Baborák</a> from <a href="https://unsplash.com/photos/ZKOwF_J-3rw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
