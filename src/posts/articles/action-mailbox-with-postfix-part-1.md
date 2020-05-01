---
uid: 'PB-A-2'
title: 'Setup Action Mailbox with Postfix - Part 1'
date: 2020-05-01
path: /articles/action-mailbox-with-postfix-part-1/
excerpt: 'This is the first part of a 2 series tutorial to setup action mailbox with postfix. In this part, we will implement action mailbox with postfix and test it in development.'
image: ../../images/articles/action-mailbox-with-postfix-part-1.webp
categories: [articles]
tags: [ruby on rails, tutorial]
toc: true
featured: true
comments: true
---

This is the first part of a 2 series tutorial to setup action mailbox with postfix. In this part, we will implement action mailbox with postfix and test in development.

If you are only looking to configure postfix in production server to pipe emails, you can read the second part <a href="/articles/action-mailbox-with-postfix-part-2/">here</a>.

Rails 6 released with many awesome features and action mailbox is one of them that has come to make the life easier. <a href="https://guides.rubyonrails.org/action_mailbox_basics.html#introduction" target="_blank">From Official Action Mailbox Guide:</a>

> Action Mailbox routes incoming emails to controller-like mailboxes for processing in Rails. It ships with ingresses for Mailgun, Mandrill, Postmark, and SendGrid. You can also handle inbound mails directly via the built-in Exim, Postfix, and Qmail ingresses.

So basically, action mailbox can be used to forward all incoming emails to your rails app and process it further as required like storing attachments, creating records from the email body in you db and many more.

## Skills required to follow the tutorial

Intermediate:

- Rails
- Linux skills to work with commands in server where your app has been deployed

## Requirements

- Setup Action Mailbox with relay option for Postfix
- Receive incoming emails through relay (Postfix)
- Pipe Postfix to forward all incoming emails to our shell script
- Process Email in the mailbox as required

## Resources Already Available

- Tutorial to implement and test action mailbox in development.
- Some questions in Stack Overflow but without required answers for our implementation! Frustrating!

## You should have

- Existing app built with rails 6

## Steps

First of all we will setup action mailbox and test in our local machine.

### Step 1: Setup action mailbox

- Install migrations needed for InboundEmail and ensure Active Storage is set up:

```shell
$ rails action_mailbox:install
$ rails db:migrate
```

### Step 2: Ingress Configuration

We will be configuring Postfix among various available options.

- Tell Action Mailbox to accept emails from an SMTP relay:

```ruby
# config/environments/production.rb
config.action_mailbox.ingress = :relay
```

### Step 3: Generate Password for authenticating requests

Generate a strong password that Action Mailbox can use to authenticate requests to the relay ingress.

Use rails credentials:edit to add the password to your application's encrypted credentials under action_mailbox.ingress_password, where Action Mailbox will automatically find it:

```ruby
action_mailbox:
  ingress_password: YOUR_STRONG_PASSWORD
```

If you are using **nano** editor you can edit credentials with following command:

```shell
  $ EDITOR="nano" rails credentials:edit
```

Alternatively, you can also provide the password in the `RAILS_INBOUND_EMAIL_PASSWORD` environment variable. If you are using `figaro` gem it is as easy as:

```yml
RAILS_INBOUND_EMAIL_PASSWORD: 'YOUR_STRONG_PASSWORD'
```

### Step 4: Setup a mailbox

Now we should setup a mailbox that will process all incoming emails as we require.

- Generate new mailbox

```shell
$ bin/rails generate mailbox forwards
```

This will create `forwards_mailbox` inside `app/mailboxes`

```ruby
# app/mailboxes/forwards_mailbox.rb
class ForwardsMailbox < ApplicationMailbox
  def process
  end
end
```

### Step 5: Whitelist email domains

We can configure our `application_mailbox` to accept all incoming emails to our rails app and forward it to our `forwards_mailbox` for further processing. But Action Mailbox also accepts regex to whitelist domains or match certain emails.

- Accept all incoming emails

```ruby
# app/mailboxes/application_mailbox.rb
class ApplicationMailbox < ActionMailbox::Base
  routing :all => :forwards
end
```

- Accept single email domain

```ruby
# app/mailboxes/application_mailbox.rb
class ApplicationMailbox < ActionMailbox::Base
  routing /.*@email-domain.com/i => :forwards
end
```

- Accept multiple email domains

```ruby
# app/mailboxes/application_mailbox.rb
class ApplicationMailbox < ActionMailbox::Base
  routing /.*@primary-email-domain.com|.*@secondary-email-domain.com/i => :forwards
end
```

This regex matching is telling application mailbox to forward or route all emails coming from `@email-domain.com` to our `forwards_mailbox`. For e.g. if we configure it to be `/.*@gmail.com/i` and our rails app receives email to `john-doe@gmail.com`, since this email matches with the pattern `@gmail.com`, it will be forwarded to our `forwards_mailbox` where we can further process it.

Note: Your mailbox name should match the name you've given it in the routing params i.e. `forwards` will route to `forwards_mailbox`.

### Step 6: Test in development

For testing in development, Action Mailbox provides UI to test inbound emails in the development environment. To access this, fire up the Rails server first

```ruby
$ rails s
```

Now go to `http://localhost:3000/rails/conductor/action_mailbox/inbound_emails` and click on `Deliver new inbound email`. Fill in all the then click `Deliver inbound email`. Ohh wait! before that let's add `byebug` to our `process` method so we know action mailbox is actually forwarding our emails to the right place.

```ruby
# app/mailboxes/forwards_mailbox.rb
class ForwardsMailbox < ApplicationMailbox
  def process
    byebug
  end
end
```

You should make sure that email in from input box matches the email domain configured. Now when you click `Deliver inbound email`, the execution of the server process should stop at the `process` method since we have a breakpoint at there. This means action mailbox is correctly forwarding incoming emails and our configurations are correct. You can perform further process as required in your app now.

That's it, we have now successfully setup action mailbox and tested in development it is working.

In the second part, we will configure postfix in production server to pipe emails to our rails app where action mailbox will further process it. You can read it <a href="/articles/action-mailbox-with-postfix-part-2/">here</a>.

If you have any confusions or suggestions, please let me know in comment section below.

**References:** <a href="https://guides.rubyonrails.org/action_mailbox_basics.html" target="_blank">Action Mailbox</a>

**Image Credits:** Cover Image by <a href="https://pixabay.com/users/ribkhan-380399/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3249062" target="_blank">Muhammad Ribkhan</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3249062" target="_blank">Pixabay</a>
