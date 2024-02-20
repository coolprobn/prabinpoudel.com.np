---
title: 'Setup Action Mailbox with SendGrid'
date: 2022-05-14
path: /articles/action-mailbox-with-sendgrid/
excerpt: 'Action mailbox can be used to forward all incoming emails to our Rails app and process them further. In this tutorial, we will be looking at the implementation and setup steps for making action mailbox work with SendGrid. We will test in development environment and also test with NGROK to make sure it will work perfectly in production.'
image: ../../images/articles/action-mailbox-with-sendgrid.webp
categories: [articles]
tags: [ruby on rails, tutorial, web development]
toc: true
featured: false
comments: true
last_modified_at: 2024-02-18
---

Rails 6 released with many awesome features and action mailbox was one of them that has come to make the life easier. <a href="https://guides.rubyonrails.org/action_mailbox_basics.html#introduction" target="_blank">From Official Action Mailbox Guide:</a>

> Action Mailbox routes incoming emails to controller-like mailboxes for processing in Rails. It ships with ingresses for Mailgun, Mandrill, Postmark, and SendGrid. You can also handle inbound mails directly via the built-in Exim, Postfix, and Qmail ingresses.

Basically, action mailbox can be used to forward all incoming emails to your Rails app and process it further as required like storing attachments, creating records from the email body in you database and many more.

And today, we will be implementing Action Mailbox with <a href="https://sendgrid.com/" target="_blank">SendGrid</a>.

## Requirements

- Setup Action Mailbox with SendGrid using the official Rails documentation
- Update DNS records to forward emails received in the mailbox towards our Rails app
- Test integration in development with built in UI provided by Rails
- Test integration in development with NGROK to ensure seamless production release

## Tested and working in

- Ruby 3.0.0
- Rails 7.0.2.4
- Action Mailbox 7.0.2.4

## You should have

- Existing app built with Rails 7 or higher

Let's start integrating Action Mailbox with SendGrid in our Rails app now.

## Step 1: Setup action mailbox

We will be following instructions from the <a href="https://guides.rubyonrails.org/action_mailbox_basics.html#sendgrid" target="_blank">Official Rails Guide for Action Mailbox</a>.

- Install migrations needed for InboundEmail and ensure Active Storage is set up:

```shell
$ rails action_mailbox:install
$ rails db:migrate
```

## Step 2: Ingress Configuration

Tell Action Mailbox to accept emails from SendGrid by adding the following to both "development.rb" and "production.rb"

```ruby
# config/environments/development.rb & config/environments/production.rb
config.action_mailbox.ingress = :sendgrid
```

## Step 3: Generate Password for authenticating requests

First of all, we should generate a strong password that Action Mailbox can use to authenticate requests to the SendGrid ingress.

You can add any strong password or let Rails generate it for you. You can log into Rails console and generate a password for you:

```cmd
> rails c
irb > SecureRandom.alphanumeric
# => "Kk9YGvzdPN69bfiu"
```

After that you can use `rails credentials:edit` in the command line to add the password to your application's encrypted credentials under `action_mailbox.ingress_password`, where Action Mailbox will automatically find it:

```ruby
action_mailbox:
  ingress_password: YOUR_STRONG_PASSWORD
```

If you are using **nano** editor you can edit credentials with following command:

```shell
  $ EDITOR="nano" rails credentials:edit
```

Alternatively, you can also provide the password in the `RAILS_INBOUND_EMAIL_PASSWORD` environment variable.

If you are using `figaro` gem you can add the following to your "config/application.yml":

```yml
# config/application.yml

RAILS_INBOUND_EMAIL_PASSWORD: 'YOUR_STRONG_PASSWORD'
```

## Step 4: Setup a mailbox

Now we should setup a mailbox that will process all incoming emails through our Rails app.

You can generate a new mailbox with:

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

## Step 5: Whitelist email domains

We can configure our `application_mailbox` to accept all incoming emails to our Rails app and forward it to our `forwards_mailbox` for further processing.

Action Mailbox also accepts regex to whitelist domains or match certain emails. Let's look at how we can configure all these alternatives:

- Accept all incoming emails

  ```ruby
  # app/mailboxes/application_mailbox.rb
  class ApplicationMailbox < ActionMailbox::Base
    routing :all => :forwards
  end
  ```

- Accept all emails from single domain

  ```ruby
  # app/mailboxes/application_mailbox.rb
  class ApplicationMailbox < ActionMailbox::Base
    routing /.*@email-domain.com/i => :forwards
  end
  ```

- Accept email from multiple domains

```ruby
# app/mailboxes/application_mailbox.rb
class ApplicationMailbox < ActionMailbox::Base
  routing /.*@primary-email-domain.com|.*@secondary-email-domain.com/i => :forwards
end
```

This regex matching is telling application mailbox to forward all emails coming from `@email-domain.com` to our `forwards_mailbox`. For e.g. if we configure it to be `/.*@gmail.com/i` and our Rails app receives email to `john-doe@gmail.com` then it will be forwarded to our `forwards_mailbox` where we can further process it since this email matches with the pattern `@gmail.com`.

[[notice | Note]]
|Your mailbox name should match the name you've given it in the routing params i.e. `forwards` will route to `forwards_mailbox`.

## Step 6: Test in development

Action Mailbox provides it's own set of UIs to test inbound emails in the development environment. To access this, let's fire up the Rails server first:

```ruby
$ rails s
```

Visit <a href="http://localhost:3000/rails/conductor/action_mailbox/inbound_emails" target="_blank">Action Mailbox Inbound Emails Localhost URL</a> and click on `New inbound email by form`. Fill in all required details like From, To, Subject and Body. You can leave other fields blank.

Before clicking on `Deliver inbound email`, let's add `byebug` (or any other debugging breakpoint e.g. binding.pry) to our `process` method so we know action mailbox is actually forwarding our emails to the right place.

```ruby
# app/mailboxes/forwards_mailbox.rb
class ForwardsMailbox < ApplicationMailbox
  def process
    byebug
  end
end
```

You should make sure that email in **From** input box matches the email domain configured. Now when you click `Deliver inbound email`, the execution of the server process should stop at the `process` method since we have a breakpoint there. This means action mailbox is correctly forwarding incoming emails and our configurations are correct. You can perform further process as required in your app now.

But wait. Dang, there is an error from Rails while testing inbound emails in development!

Let's dig into what is happening.

### Issue with Inbound Action Mailbox Testing in Development

![Error while testing action mailbox in development due to empty attachment](../../images/articles/action-mailbox-with-sendgrid/action-mailbox-development-testing-rails-core-error.webp)

Error reads: "undefined method `original_filename' for "":String" and "NoMethodError in Rails::Conductor::ActionMailbox::InboundEmailsController#create"

Looking at the code in Action Mailbox of core Rails, I found out that this error is occurring because controller is trying to process the empty attachment further. But finding out why Rails was submitting empty attachment when we haven't chosen any attachment was hard. Note that, this also happens even if you choose one or multiple attachments.

In params, we get this `"attachments"=>[""]` and controller is trying to process it further with the following code:

```ruby
private
  def new_mail
    Mail.new(mail_params.except(:attachments).to_h).tap do |mail|
      mail[:bcc]&.include_in_headers = true
      mail_params[:attachments].to_a.each do |attachment|
        mail.add_file(filename: attachment.original_filename, content: attachment.read)
      end
    end
  end
```

Here, we are getting error in the line `mail.add_file(filename: attachment.original_filename, content: attachment.read)` because "attachment" is empty string i.e. "" and not an object which has properties like "original_filename". Hence the error.

After looking into controller, my next stop for debugging the error was to look into the view because it shouldn't have sent the empty attachment in the first place.

View was just using a normal file_upload tag:

```html.erb
<div>
  <%= form.label :attachments, "Attachments" %><br>
  <%= form.file_field :attachments, multiple: true %>
</div>
```

There couldn't be any issue here, so I looked into the rendered HTML in the webpage and found out that there was a hidden tag for attachment:

```html
<input name="mail[attachments][]" type="hidden" value="" autocomplete="off">
<input multiple="multiple" type="file" name="mail[attachments][]" id="mail_attachments">
```

Hence, the form is submitting empty attachment to the controller.

This problem could be solved in controller by filtering out attachments that are empty and I was near to submitting a PR to Rails. But then I thought, if I am getting this issue, there are obviously other developers who have been into this since this is an issue in Rails core and not in the code I have written.

Searching further, I found this issue titled <a href="https://github.com/rails/rails/issues/43928" target="_blank">Action Mailbox Conductor throws NoMethodError when creating inbound email</a> submitted to Rails Core Github.

And if there is an issue, there must also be a PR. YES, there was one already titled <a href="https://github.com/rails/rails/pull/44008" target="_blank">Cannot deliver new inbound email via form</a> but it hadn't been merged yet. 

But for this tutorial and until PR is merged, we need this to work in our app. So, I was looking into how I can resolve it the best and searching for the solution that would work for all of us and not just me.

Scrolling further into the issue, I found a monkey patching very suitable for our use case.

### Monkey Patching the issue 

Add the following to your `config/application.rb`

```ruby
# monkey patching to resolve the issue of action mailbox inbound email sending empty attachment
config.to_prepare do
  Rails::Conductor::ActionMailbox::InboundEmailsController.class_eval do
    private

    def new_mail
      Mail.new(mail_params.except(:attachments).to_h).tap do |mail|
        mail[:bcc]&.include_in_headers = true
        mail_params[:attachments].to_a.compact_blank.each do |attachment|
          mail.add_file(filename: attachment.original_filename, content: attachment.read)
        end
      end
    end
  end
end
```

Don't forget to restart the server and reload the page. After that you can submit the form again.

Voilà!! It works 🥳. 

Now, your server should have stuck in the debugging breakpoint.

That's it, we have now successfully setup action mailbox and tested in development.

Now let's test using NGROK so we know that our configuration will work seamlessly (pretty much) in our production environment.

## Step 7: Setup NGROK

Let's setup NGROK in our local machine:

1. Download the application

    You can download the application from this <a href="https://ngrok.com/download" target="_blank">download link</a>.

    If you are on MacOS, I highly suggest downloading NGROK using homebrew with the command `brew install ngrok/ngrok/ngrok`. It's easier than manual download and also don't normally give off any issue.

2. Serve your app using NGROK URL

    While keeping the rails server running as it is, open a new tab in your command line.
  
    You can then run the command `ngrok http 3000`, which will give you an URL connecting your local Rails app running on port 3000 to the internet. You should look at the URL besides the "Forwarding" option, it will be something similar to `Forwarding https://e73a-27-34-12-7.in.ngrok.io -> http://localhost:3000`

    When running the NGROK, you should see a screen similar to the screenshot below:

    ![Screenshot of active NGROK session in command line](../../images/articles/action-mailbox-with-sendgrid/ngrok-running-screen.webp)

3. Access the Rails app with NGROK URL
  
    Open the URL you got before from NGROK e.g. `https://e73a-27-34-12-7.in.ngrok.io` in your browser and you should be able to see the Rails welcome screen or whatever your default page for the app is.

    But, but, there is an error again 😭
  
    Hah, don't worry. I have got you covered.

    You should be seeing the Error UI similar to what is in the screenshot below:

    ![Ngrok error page when trying to access rails app due to missing auth token](../../images/articles/action-mailbox-with-sendgrid/ngrok-error-due-to-missing-auth-token.webp)

    This happens because of missing "auth token" which you can get after signing up to NGROK for free.

4. Sign up to NGROK
  
    You can sign up to NGROK using this <a href="https://dashboard.ngrok.com/signup" target="_blank">signup link</a>.

5. Add NGROK auth-token to local configuration file
  
    After signing up, you are presented with a dashboard and you can copy the auth-token from setup-and-installation step number 2 called "Connect you account"

    Or you can follow this link to your <a href="https://dashboard.ngrok.com/get-started/your-authtoken" target="_blank">auth token page</a>.

    Copy the token given and run the following in your command line:

    ```cmd
    $ ngrok config add-authtoken <your-authtoken>
    ```

    Now restart your NGROK server and go to the new URL provided. 
    
    [[notice | Note]]
    |URL changes each time you restart the NGROK server unless you use pro version and pay for the static URL.

    What, Error? Again!!! 🤕

6. Resolving blocked host in Rails app
  
    After accessing the NGROK URL, you should see an error page similar to the one below:

    ![Blocked host error in Rails](../../images/articles/action-mailbox-with-sendgrid/blocked-host-error-in-rails.webp)

    This is because Rails blocks https access in development and unauthorized URLs overall.

    Let's add the NGROK URL to "config/environments/development.rb"

    ```ruby
    # config/environments/development.rb

    config.hosts << "add-your-ngrok-url"
    ```

    Restart the rails server and reload the page in the browser. Now, you should be able to see the default page of your Rails app. This is what I see in mine since it's a new application just for this blog:

    ![Welcome page in Rails](../../images/articles/action-mailbox-with-sendgrid/rails-welcome-page.webp)
  
7. Authorize all NGROK URLs in development
  
    Above, we only allowed current URL provided by NGROK and as I have already said this URL changes each time we restart the server.
    
    Changing it every time we restart the server is a hassle so we will add regex which will allow matching NGROK URLs to connect to our Rails app in development.

    Let's replace previous configuration with the following:

    ```ruby
    config.hosts << /.+\.ngrok\.io/
    ``` 

    Now, if you restart the rails server you should still be able to access the default page in your app. Also, try with restarting the NGROK server and accessing the page again which you should still be able to without getting blocked host error.

## Step 8: Authenticate domain in SendGrid

You can follow the <a href="https://www.twilio.com/blog/how-to-set-up-domain-authentication-for-twilio-sendgrid" target="_blank"> official SendGrid tutorial</a> to authenticate your domain in SendGrid.

Part of the tutorial also goes through setting up MX records which we will go into detail here.

You can authenticate your domain by following this link to the <a href="https://app.sendgrid.com/settings/sender_auth/domain/create" target="_blank">Domain Authentication page</a> 

You will receive list of CNAME and Values similar to what is listed below in the process where `prabinpoudel.com.np` and `em1181` will be different:

1. em1181.prabinpoudel.com.np
2. s1._domainkey.prabinpoudel.com.np
3. s2._domainkey.prabinpoudel.com.np

We will come back to this page after next step again so don't close the page yet.

Let's go to our DNS provider's dashboard and configure these records first.

### Setup DNS Records

We need to add DNS records from SendGrid to our DNS provider so our email is actually being processed by SendGrid and routed to our Rails app with Inbound Parse Hook.

I use <a href="https://www.cloudflare.com/" target="_blank">CloudFlare</a>, so I will be showing you process to setup MX record using the settings from CloudFlare as an example.

1. Go to DNS tab from the left menu
    ![Side Menu with menu item "DNS" active in Cloudflare](../../images/articles/action-mailbox-with-sendgrid/side-menu-in-cloudflare.webp)

2. Click on "Add Record" and choose MX from the dropdown then add the following values to each field

    - Name: "@"
    - Mail Server: "mx.sendgrid.net"
    - TTL: "auto"
    - Priority: "10"

    ![Adding MX Record from SendGrid to Cloudflare](../../images/articles/action-mailbox-with-sendgrid/adding-mx-records-from-sendgrid-to-cloudflare.webp)

    You can also find the instruction for adding MX record in the tutorial to <a href="https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook#set-up-an-mx-record" target="_blank">setup Inbound Parse Hook</a> from SendGrid.

3. Click on "Add Record" again and add all three CNAME records we got previously while authenticating the domain one by one

    Copy values from authenticating the domain page add them to CloudFlare:
    
    - Type: CNAME
    - Name: value from CNAME
    - Target: value from VALUE
    - Proxy Status: Turn the toggle button off (it will be on by default)
    - TTL: Auto

    ![Adding CNAME Records from SendGrid to Cloudflare](../../images/articles/action-mailbox-with-sendgrid/adding-cname-records-from-sendgrid-to-cloudflare.webp)

4. Go back to domain authentication page and click on "I've added these records" and click on "Verify" button
  
    If everything was copied over correctly, you will see a page with the information "It worked! Your authenticated domain for prabinpoudel.com.np was verified."

    Else you will get errors and you will have to fix those before moving forward.

## Step 9: Configure Inbound Parse in SendGrid

We will be following the <a href="https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook" target="_blank">official SendGrid doc</a> for configuring inbound parse hook to forward inbound emails to `/rails/action_mailbox/sendgrid/inbound_emails` with the username "actionmailbox" and the password we generated just before this.

1. From your SendGrid Dashboard click Settings, and then click Inbound Parse. You are now on the Inbound Parse page. Or you can click on this <a href="https://app.sendgrid.com/settings/parse" target="_blank">Inbound Parse Link</a> to go there directly.
2. Click "Add Host & URL"
3. You can add/leave the subdomain part as required. I have left it blank because I don't have any subdomain just for receiving emails
4. Under "Domain", choose your domain name that you just verified

5. Under the URL we will have to construct one and add it
  
    The format for the URL should be: `https://actionmailbox:<your_action_mailbox_ingress_password>@<rails_app_nginx_url>/rails/action_mailbox/sendgrid/inbound_emails`

    For e.g. it will be `https://actionmailbox:my_strong_password@5829-2400-1a00-b050-3fb6-b0ce-5946-b9be.in.ngrok.io/rails/action_mailbox/sendgrid/inbound_emails` for my Rails app.

    In production it can be a different URL so you should replace `rails_app_nginx_url` with the URL from where your Rails application is accessible to the internet.

    ![Configure Inbound Parse Hook Page in SendGrid](../../images/articles/action-mailbox-with-sendgrid/configure-inbound-parse-hook-in-sendgrid.webp)
  
6. Check "POST the raw, full MIME message" and click on Add

Now we are ready to test our integration with live email using SendGrid and Ngrok.

## Step 10: Test if MX records are recognized by the internet

Before we test our integration with live email, we need to make sure that MX records are recognized by the Internet.

It may take some time for DNS records to be recognized throughout the world so email forwarding may yet not work for you. The maximum time period until this happens is 24 hours.

You can test if DNS records for your domain is working correctly and recognized from the website <a href="https://mxtoolbox.com/SuperTool.aspx" target="_blank">MX Toolbox</a>

1. Add your domain name e.g. prabinpoudel.com.np
2. Click on "MX Lookup"

    You should see "DNS Record Published" status in the test result table

    ![Test result for MX records in the website of MX Toolbox](../../images/articles/action-mailbox-with-sendgrid/test-mx-records-using-mx-toolbox-website.webp)


## Step 11: Test incoming email with SendGrid and NGROK

Finally, we are now at the last step. We will now send email to our mail server and we should receive it in our local Rails app and server should stop in our debugging breakpoint.

From your favorite email provider e.g. Gmail, send a test email to your domain e.g. for me I will test it via sendgrid-test@prabinpoudel.com.np. 

It takes some time to process the email by SendGrid and receive in our Rails app, maximum ~1 minute.

You can check if the email is being received by SendGrid or not from <a href="https://app.sendgrid.com/statistics/parse_webhook" target="_blank">Parse Webhook Statistics</a>

![Statistics of incoming emails received by SendGrid from the internet and forwarded to Rails App URL as per the configuration](../../images/articles/action-mailbox-with-sendgrid/sendgrid-inbound-parse-webhook-statistics.webp)

Tada!! 🎉

You should have received the email and rails server must have stopped in the debugging breakpoint.

## Conclusion

Congratulations!!! You have come a long way and gone through a lot of process to integrate Action Mailbox with SendGrid.

You can find a working app for this blog at <a href="https://github.com/coolprobn/action-mailbox-with-sendgrid-test" target="_blank">Action Mailbox with SendGrid</a>. You can view all changes I made for configuring SendGrid with Action Mailbox in the PR: <a href="https://github.com/coolprobn/action-mailbox-with-sendgrid-test/pull/1" target="_blank">Setting up Action Mailbox with SendGrid</a>

Next, you can deploy the app to staging or production and add new Inbound Parse URL in SendGrid to point to the URL of those applications.

If you have any confusions, suggestions or issues while implementing any steps in this email, please let me know in comment section below and I will do my best to help you.

Thanks for reading. Happy coding and tinkering!

## Similar Articles

If you are interested in seeing how this same process can be accomplished with other ingress options, you can check articles below:

- <a href="/articles/action-mailbox-with-postfix-part-1/" target="_blank">Action Mailbox with Postfix</a>
- <a href="https://www.codynorman.com/ruby/deploy_action_mailbox_with_postmark/" target="_blank" rel="noopener">Deploy Action Mailbox To Postmark [External Link]</a> from <a href="https://www.codynorman.com/about/" target="_blank" rel="noopener">Cody Norman</a>

**References:** 

- <a href="https://guides.rubyonrails.org/action_mailbox_basics.html" target="_blank">Action Mailbox (Official Documentation)</a>
- <a href="https://dev.to/rob__race/using-action-mailbox-in-rails-6-to-receive-mail-2nje" target="_blank">Using Action Mailbox in Rails 6 to Receive Mail</a> 
- <a href="https://github.com/rails/rails/issues/43928" target="_blank">Action Mailbox Conductor throws NoMethodError when creating inbound email</a>
- <a href="https://github.com/rails/rails/pull/44008" target="_blank">Cannot deliver new inbound email via form #44008</a>
- <a href="https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook" target="_blank">Setting Up The Inbound Parse Webhook</a>
- <a href="https://www.twilio.com/blog/how-to-set-up-domain-authentication-for-twilio-sendgrid" target="_blank">How to set up domain authentication for Twilio SendGrid</a>

**Image Credits:** Cover Image by <a href="https://unsplash.com/@ecees?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">erica steeves</a> from <a href="https://unsplash.com/s/photos/mail?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
