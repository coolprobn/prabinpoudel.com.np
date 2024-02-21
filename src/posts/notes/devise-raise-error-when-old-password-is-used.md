---
title: 'Devise raise validations error when new and old passwords are same'
date: 2024-02-20
path: /notes/devise-raise-error-when-old-password-is-used/
excerpt: "Letting users to change their password is a very common feature. In this post we will be exploring the solution for raising validations error when they try to change their password but add the same old password again."
image: ../../images/notes/devise-raise-error-when-old-password-is-used.webp
categories: [notes]
tags:
  - ruby on rails
  - devise
toc: true
featured: false
comments: true
---

Authentication is a deal breaking feature in any applications nowadays. In Rails, Devise makes authentication a breeze; install a gem, run few commands and you have authentication working in your app.

Today, with the help of Devise we will look into a solution for a very common feature request in the app; throw validation error if user tries to change their password but add the same old password.

## Skills required to follow the tutorial

Intermediate:

- Rails

## You should have

- Existing Rails app with authentication already handled using Devise

## Validation Implementation

Let's dive into the code now.

Add the following validation error to the model that is used for authentication:

```ruby
class User < ApplicationRecord
  # ============ Custom Validation ============
  validate :new_and_old_password_must_be_different

  private
  
  def new_and_old_password_must_be_different
    return if changed.exclude?('encrypted_password')

    password_is_same = Devise::Encryptor.compare(User, encrypted_password_was, password)

    errors.add(:password, I18n.t('validations.not_allowed.old_password')) if password_is_same
  end
end
```

Please note that I am using "User" model for storing all users and authenticate them but table could be anything else like "Admin" as well.

We will understand what each line of code means in next section.

## Code Explanation

1. `changed.exclude?('encrypted_password')`
  
    ActiveModel stores changes that were made in the current transaction inside the variable "changed" and with this line of code we are returning early from the validation if user was updated but password wasn't updated.
2. `Devise::Encryptor.compare(User, encrypted_password_was, password)`
  
    We are already using Devise for authentication so we are reaching out to the helper module "Encryptor" from Devise to compare new password with the old one. Here, current password will be in plain format and "Encryptor" will hash the password with relevant algorithm before comparing so we know if the password is same or different.
    
    This line will return true if previous password is same as the new password or false if they are different.
3. `errors.add(:password, I18n.t('validations.not_allowed.old_password'))`
  
    Lastly, we are adding validation errors to the User model if the password is same. And controller action will return the validation error to show it in frontend.

## Conclusion

And with that we have successfully added a way for our app to throw validation errors when old password is used with the help of Devise. I hope you got to learn something new today.

Thank you for reading. Happy coding!

## References

- <a href="https://stackoverflow.com/questions/67110367/rails-devise-how-do-i-get-an-error-message-if-password-is-not-changed" target="_blank" rel="noopener">[Stack Overflow] Rails + Devise: How do I get an error message if password is not changed?</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@alexeh99?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">alexander ehrenhöfer</a> on <a href="https://unsplash.com/photos/assorted-color-padlocks-in-rope-yI4pFmN9ges?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Unsplash</a>
  