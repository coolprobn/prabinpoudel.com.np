---
title: 'Devise raise validations error when new and old passwords are same'
date: 2024-01-08
path: /articles/devise-raise-error-when-old-password-is-used/
excerpt: "Letting user to change their password is a very common feature. In this post we will be exploring the solution for raising validations error when they try to change their password but add the same old password again."
image: ../../images/articles/devise-raise-error-when-old-password-is-used.webp
categories: [articles]
tags: [ruby on rails]
toc: true
featured: false
comments: true
---

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

## Conclusion

Factory Bot helps in reusing the same code in multiple test examples, this way you will have to write less code and as they say "Less code is always better".

Thank you for reading. Happy coding!

## References

- <a href="https://stackoverflow.com/questions/67110367/rails-devise-how-do-i-get-an-error-message-if-password-is-not-changed" target="_blank" rel="noopener">[Stack Overflow] Rails + Devise: How do I get an error message if password is not changed?</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@alexeh99?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">alexander ehrenhöfer</a> on <a href="https://unsplash.com/photos/assorted-color-padlocks-in-rope-yI4pFmN9ges?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Unsplash</a>
  