---
title: 'Setup Action Mailbox with Postfix - Part 2'
date: 2020-05-02
path: /articles/action-mailbox-with-postfix-part-2/
excerpt: 'This is the second part of a 2 series tutorial to setup action mailbox with postfix. In this part, we will configure postfix in production server to forward incoming emails to our rails app so action mailbox can process it.'
image: ../../images/articles/action-mailbox-with-postfix-part-2.webp
categories: [articles]
tags: [ruby on rails, tutorial, web development]
toc: true
featured: false
comments: true
last_modified_at: 2024-02-18
canonical: true
canonical_url: 'https://thedevpost.com/blog/setup-action-mailbox-with-postfix-part-2/'
---

_NOTE_: This article was first posted on <a href="https://thedevpost.com/blog/setup-action-mailbox-with-postfix-part-2/" target="_blank">The Dev Post.</a>

This is the second part of a 2 series tutorial to setup action mailbox with postfix. In this part, we will configure postfix in production server to forward incoming emails to our rails app so action mailbox can process it.

If you haven't read the first part where we setup action mailbox and test it in development, you can read it <a href="/articles/action-mailbox-with-postfix-part-1/">here.</a>

## You should have

- Postfix configured in production server (same server as your rails app)
- Existing app built with rails 6
- Ruby with rbenv setup
- Patience

## Steps

Let's login to our production server first.

### Step 1: Create bash script

Create a script to forward incoming emails to our rails app inside `/usr/local/bin/`

```shell
$ nano email_forwarder.sh
```

Add following to the script

```shell
#!/bin/sh
export HOME=YOUR_HOME_PATH
export PATH=YOUR_PATH
export RBENV_ROOT=YOUR_RBENV_PATH

cd /path/to/your/project && bin/rails action_mailbox:ingress:postfix URL='https://truemark.com.np/rails/action_mailbox/relay/inbound_emails' INGRESS_PASSWORD='YOUR_INGRESS_PASSWORD'
```

Replace values of `HOME`, `PATH`, `RBENV_ROOT`, `URL` and `INGRESS_PASSWORD` as described below:

- Copy your home directory for **HOME**

`cd` and copy what you get from `pwd` command

```shell
$ cd
$ pwd
```

- Copy what you get from `$PATH` and `which rbenv` command for **PATH** and **RBENV_ROOT** respectively

```shell
$ $PATH
$ which rbenv
```

- Copy the password you added previously to `credentials.yml` file or your ENV file as described in <a href="/articles/action-mailbox-with-postfix-part-1/" target="_blank">part 1</a> for **INGRESS_PASSWORD**

For **URL**, if your application lived at `https://example.com`, the full command would look like this:

`bin/rails action_mailbox:ingress:postfix URL=https://example.com/rails/action_mailbox/relay/inbound_emails INGRESS_PASSWORD=YOUR_STRONG_PASSWORD`

### Step 2: Configure Postfix to Pipe Incoming emails to script

We will follow steps as described <a href="https://serverfault.com/a/258491" target="_blank">here.</a>

- Create `/etc/postfix/virtual_aliases` to add a catch-all alias; **localuser** needs to be an existing local user:

```file
# /etc/postfix/virtual_aliases
@mydomain.tld   localuser@mydomain.tld
```

- Create `/etc/postfix/transport` to add a transport mapping. "forward_to_rails" can be whatever you want; it will be used later in `master.cf`

```file
# /etc/postfix/transport
mydomain.tld    forward_to_rails:
```

- Next, both transport and virtual_aliases need to be compiled into berkeley db files:

```shell
$ sudo postmap /etc/postfix/virtual_aliases
$ sudo postmap /etc/postfix/transport
```

- Add the transport to `/etc/postfix/master.cf`

```file
# /etc/postfix/master.cf
forward_to_rails   unix  -       n       n       -       -       pipe
  flags=Xhq user=deploy:deploy argv=/usr/local/bin/email_forwarder.sh
  ${nexthop} ${user}
```

We should specify **user** so script is run by that user and not postfix or nobody. `user=deploy:deploy` ~ `user=user:group`

- Add following in `/etc/postfix/main.cf`

```file
# /etc/postfix/main.cf
  transport_maps = hash:/etc/postfix/transport
  virtual_alias_maps = hash:/etc/postfix/virtual_aliases
```

You can view postfix log with `tail -f /var/log/mail.log`.

You must have everything now to receive email in your rails app. Test it with any of your email provider; just send the email to `email@your-configured-domain.com` and check if it is being received in the log. If you have any comments or suggestions, please let me know in comments below.

## Similar Articles

If you are interested in seeing how this same process can be accomplished with other ingress options, you can check articles below:

- <a href="/articles/action-mailbox-with-sendgrid" target="_blank">Action Mailbox with SendGrid</a>
- <a href="https://www.codynorman.com/ruby/deploy_action_mailbox_with_postmark/" target="_blank" rel="noopener">Deploy Action Mailbox To Postmark [External Link]</a> from <a href="https://www.codynorman.com/about/" target="_blank" rel="noopener">Cody Norman</a>

**References:** <a href="https://guides.rubyonrails.org/action_mailbox_basics.html" target="_blank">Action Mailbox</a>, <a href="https://serverfault.com/questions/258469/how-to-configure-postfix-to-pipe-all-incoming-email-to-a-script" target="_blank">Pipe incoming mails to script</a>

**Image Credits:** Cover Image by <a href="https://pixabay.com/users/Clker-Free-Vector-Images-3736/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=34686" target="_blank">Clker-Free-Vector-Images</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3249062" target="_blank">Pixabay</a>