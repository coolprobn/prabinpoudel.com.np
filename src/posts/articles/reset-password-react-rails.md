---
uid: 'PB-A-1'
title: 'Reset password in react and rails app with devise'
date: 2020-01-16
path: /articles/reset-password-react-rails/
excerpt: 'This tutorial shows you how to send reset password instructions email in React and Rails app. Learn about these steps to reset password for Rails/React app with Devise.'
image: ../../images/articles/reset-password-react-rails.webp
categories: [articles]
tags: [ruby on rails, reactjs, tutorial]
last_modified_at: 2020-04-15
toc: true
featured: true
comments: true
---

_NOTE_: This article was first posted on <a href="https://truemark.com.np/blog/reset-password-in-react-and-rails/" rel="canonical">Truemark Blog</a>

Recently when I was working on a project, I was assigned the task of resetting the password for a Rails/React app setup with Devise. I searched on google, as usual, there were a lot of tutorials for applications built with full-stack Rails, but couldn’t find any tutorial to implement this particular feature with React as a frontend. So, I decided to write my own after solving the problem so that it will be easier for the other developers who are looking for a way to implement it in React like I was assigned to.

Authentication for an app is a must when you are working in the real environment so that your app is only accessible to those who are authorized to use it. When we are talking about authentication in Rails, Devise is our go-to gem that is providing easy and flexible authentication. We won’t be going into depth about the Devise today. You can always learn it from the other sources as the tutorials for it are readily available.

## Skills required to follow the tutorial

Basics of

- Rails
- React
- Devise

## Requirements For the Features

- When a user receives a password reset instruction email, they should be redirected to the React app.
- Email design should be changed to what was given by the designer.

## What was Available?

- Tutorial to implement reset password feature in the Rails app only.
- Plain and simple email design provided by Devise.

If you have worked with Devise, then you must be aware that when you initialize Devise in your Rails app, it creates multiple routes and controllers to let you handle most user-related logics that are normally hidden. Route to reset the password will be provided by Devise and we will be using it to send the email for password reset instruction first.

## Steps

Follow these steps and do as instructed below.

### Step 1: Send the Reset Password Instruction to the User

- Hit `/users/password` with following request to get the password reset email provided by Devise

Request Sample:

```ruby
{
    "user":
    {
        "email":"emailtoreset@email.com"
    }
}
```

- The reset instructions will be plain and simple. When you click on the link provided in the email, it will redirect you to the Rails app. But the problem here is, we want the user to be redirected to our React app.

### Step 2: Create Custom Mailer

- Create a new mailer. I have created UserMailer, but you can create it with any name you want as long as you and other developers understand it. Next, we should extend Devise mailer as shown below:

```ruby
class UserMailer < Devise::Mailer

end
```

### Step 3: Override Reset Password Instruction Method

```ruby
class UserMailer < Devise::Mailer
 default from: "<#{ENV['DEFAULT_FROM_EMAIL']}>" // I am using figaro to store environment variables so I am accessing email from the application.yml file with this code
 before_action :add_inline_attachments!

 def reset_password_instructions(record, token, opts={})
   super
 end

 private
 def add_inline_attachments!
   attachments.inline['your-logo.png'] = File.read(Rails.root.join('app/assets/images/your-logo.png'))
 end
end
```

- We need to override the method so that we can create a new mailer view to add our own design to the email and access the token to use for resetting the forgotten password.

### Step 4: Create a Mailer View

- Create a mailer view inside `views/{your\_custom\_mailer}` named `reset\_password\_instructions.html.erb`
- Add HTML content to reflect the design you want or have been provided by the designer.

### Step 5: Link to Redirect User to React app

- You can access `reset_token` in your view with `@token` as shown below.
- Following code snippet reflects the use of token:

```html
<% reset_password_link =
"#{ENV['FRONTEND_APP_HOST']}/new_password?reset_token=#{@token}" %> <%= link_to
reset_password_link do %>
<button class="new-password-button">
  Choose a new password
</button>
<% end %>
```

Now when you try to send the email again, you will get the same old email instead of your custom-designed one. Right? That’s not good. Now, let’s fix that issue so that we can get our own custom-designed email with our own instructions.

### Step 6: Update Devise Initializer File

- To get the custom-designed email, you need to tell Devise to use your custom mailer you just created.
- For this, go to Devise initializer under `config/initializers` and search for `config.mailer`. The name has to be same as the mailer you had created in the second step. Here I have changed it to UserMailer:

```ruby
# Configure the class responsible to send e-mails.
config.mailer = 'UserMailer'
```

Now try to send the email again and …. Magic! You are all set, you should get a new email that you added just now with a link redirecting to React app from where you can handle the rest of the process. Good Work!

This is how you send a password reset email with custom design and instructions in React and Rails. I hope this article helped you a lot. If you have any suggestions or confusion, please let me know in the comment section below.
