---
uid: 'PB-N-1'
title: 'Generate unique random numbers or tokens in ruby on rails'
date: 2020-04-18T00:02:40.097Z
path: /notes/generate-unique-random-number-token-ruby-rails/
excerpt: 'Learn how you can generate random and unique number or token from given range of number in Ruby on Rails.'
image: ../../images/notes/generate-unique-random-number-token-ruby-rails.webp
categories: [notes]
tags: [ruby, ruby on rails]
comments: true
featured: true
toc: true
---

Sometimes we need random or unique numbers and tokens in our web apps. Here is a quick solution on how you can generate random unique numbers or token using Ruby on Rails.

## Generate Random Number or Token

For generating secured random numbers and tokens we use `Secure Random`, suitable for generating session keys in HTTP cookies, etc. If you are only looking for generating random numbers, then you can use [rand(Random)](https://apidock.com/ruby/Random/rand). Here, we are using [random_number(SecureRandom)](https://apidock.com/ruby/SecureRandom/random_number/class) for numbers and [hex(SecureRandom)](https://apidock.com/ruby/SecureRandom/hex/class) for tokens. There are varieties of other methods provided by Secure Random like alphanumeric, base64, urlsafe_base64, uuid, etc. which you can read further about here: [Secure Random](https://ruby-doc.org/stdlib-2.5.1/libdoc/securerandom/rdoc/SecureRandom.html).

```ruby
def generate_random_number
   SecureRandom.random_number(10000000)

  # OR Using rand method
  #  rand(10000000)
end

def generate_token
  SecureRandom.hex(10)
end
```

## Generate Random Token or Number with Prefix

Add prefix to token with any string you would like to by returning prefixed value instead of only token like: `"AC#{token}"`.

```ruby
def generate_token_with_prefix
  loop do
    token = SecureRandom.hex(10)

    # Assuming AC is the string you would like to prefix
    break "AC#{token}"
  end
end
```

## Generate Unique Random Token

For generating random tokens that are unique, we make the use of `loop` provide by Ruby. Here, we are generating tokens indefinitely until it meets our requirement that is; we are breaking out of the loop and returning token only if the generated token doesn't already exist in our database for user table.

```ruby
class User < ActiveRecord::Base
  # =========== Hook =============
  before_create :set_access_token

  # ======== Private Method =======
  private

  def set_access_token
    self.access_token = generate_token
  end

  def generate_token
    loop do
      token = SecureRandom.hex(10)

      break token unless User.where(access_token: token).exists?
    end
  end
end
```

## Generate Unique Random Number

```ruby
class Invoice < ApplicationRecord
 # =============== Hook ======================
 before_create :set_invoice_number

 # ============= Private Method =============
 private

  def set_invoice_number
    self.invoice_number = generate_invoice_number
  end

 def generate_invoice_number
   loop do
     number = SecureRandom.random_number(10000000)
     invoice_number = "IN#{number}"

     break invoice_number unless Invoice.where(invoice_number: invoice_number).exists?
   end
 end
end
```

Do you know more elegant way to generate unique random numbers or tokens? Enlighten and guide us with your precious comment below if you do.

**References:** [Makandra Cards](https://makandracards.com/alexander-m/39365-generate-unique-random-token)

**Image Credits:** Cover Image by [955169](https://pixabay.com/users/955169-955169/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1502706) from [Pixabay](https://pixabay.com/)
