---
title: 'Override Default Date Format in Rails Admin'
date: 2021-07-11
path: /notes/override-default-date-format-in-rails-admin/
excerpt: "It's always tricky when we need to override default behavior of engine/gems. It was the same case with date format. Rails Admin uses long date format as a default value for formatting the dates, to override the format we can add keys for the long date format in our locale files"
image: ../../images/notes/override-default-date-format-in-rails-admin.webp
categories: [notes]
tags: [ruby on rails, rails admin]
toc: true
featured: true
comments: true
---

Rails Admin is a Rails engine that provides an easy-to-use interface for managing your data. It's perfect for the cases where we want admin dashboard quickly for CRUD (Create, Read, Update and Delete) operations.

When using engines, it can be difficult to override its default behavior. It was the same case for overriding the default date format. It was tricky as I didn't know exactly where to look at.

After some research, I found out that Rails Admin uses **long** date and time format from the locale. We can check the related code in <a href="https://github.com/sferik/rails_admin/blob/555f7783f2255ddc736141c410c5bdaee074887a/lib/rails_admin/config/fields/types/datetime.rb#L33" target="_blank" rel="noopener">official gem repository</a>.

Line for the exact code may change in the future, if it has, you can search for the code below:

```
  register_instance_option :date_format do
    :long
  end
```

## Override default date format

To override the default format of the date and display the format we want in our UI, we will need to add the required format in our locale files so the values inside the engine are overridden.

Add the following to `config/locale/en.yml`

     ```
       en:
         date:
           formats:
             long: "%Y-%m-%d"
         time:
           formats:
             long: "%Y-%m-%d %H:%M:%S"
     ```

Please change format of the date and time as required for your application.

If you have other locales that your Rails app supports, you can update the date formats as required in related locale file by copying this exact code and updating content inside key "long"

_NOTE_: date is for datatype **date** and time is for data type **datetime**

## Conclusion

If you restart the rails server and reload the UI, you should be able to see the date format you added.

Thanks for reading. Happy coding!

## Image Credits

- Cover Image by <a href="https://unsplash.com/@esteejanssens?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Estée Janssens</a> on <a href="https://unsplash.com/s/photos/calendar?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
