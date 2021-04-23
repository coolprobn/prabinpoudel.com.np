---
title: '[Fix] Missing top level class documentation comment Rubocop'
date: 2020-09-12
path: /articles/fix-missing-top-level-class-documentation-comment-rubocop/
excerpt: "There are multiple ways to fix missing top level class documentation comment in Rubocop. You can disable it in your whole app with by disabling cop in the whole project, disable it in one class or just add a comment above the class declaration."
image: ../../images/articles/fix-missing-top-level-class-documentation-comment-rubocop.webp
categories: [articles]
tags: [ruby on rails, rubocop, lint]
toc: true
featured: false
comments: true
canonical: true
canonical_url: 'https://thedevpost.com/blog/fix-rubocop-missing-comment/'
---

Rubocop is the best way to enforce best practices in our rails project. While working on the project with rubocop enabled, it's normal to stumble upon the warning: **Missing top-level class documentation comment. [Style/Documentation]**. When this happens, we have three options to fix or disable the warning.

## Warning

- Missing top-level class documentation comment. [Style/Documentation]

## Options Available for Fix

You can disable or fix this warning using either of the 3 options:

1. Disable cop in the whole project
2. Disable cop in only one class
3. Add comment just above the class declaration

### Option 1: Disable cop in the whole project

Most of the classes we use are self describing, meaning as a developer, you can easily make sense of what the class is doing. Normally I find this rule not very useful, so most of the time I disable it in the whole project. Add the following cop to your configuration file to disable it project wide:

```ruby
# .rubocop.yml

Style/Documentation:
  Enabled: false
```

### Option 2: Disable cop in only one class

If you feel this cop is important in your project and don't want to disable it in the configuration file, then you can disable it in only one class as required.

```ruby
# app/models/user.rb

# rubocop:disable Style/Documentation
class User
end
```

### Option 3: Add comment just above the class declaration

You can also fix the warning by adding the comment by adding the comment above the class declaration.

```ruby
# app/models/user.rb

# Service to download ftp files from the server
class FtpService
end
```

Though this article is specific to resolving **Missing top-level class documentation comment. [Style/Documentation]**, this fix also works on every other warning that rubocop throws.

Did I miss any option that you are using? Let me know in the comments below.

**Image Credits:** Cover Image by <a href="https://unsplash.com/@mattpopovich?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Matt Popovich</a> on <a href="https://unsplash.com/s/photos/cop?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Unsplash</a>
