---
title: '[Solved] .rbenv/shims/ruby: Argument list too long'
date: 2021-10-23
path: /notes/rbenv-shims-ruby-argument-list-too-long/
excerpt: "When running the command to check the ruby version with 'ruby -v', it would take a really long time and return the error '.rbenv/shims/ruby: Argument list too long'"
image: ../../images/notes/rbenv-shims-ruby-argument-list-too-long.webp
categories: [notes]
tags: [ruby on rails, ruby]
toc: true
featured: false
comments: true
---

I couldn't access any ruby command in the linux server where we have hosted the Rails app for one of my client. I had to access rails console to update some database records manually but I couldn't and got stuck in this issue for over 2 days.

I encountered two issues along the way:

- ruby version not found
- .rbenv/shims/ruby: Argument list too long

Solving the second issue solved the first issue too!

## Problem

Inside the root folder of the project , `ruby -v` always returned that ruby 2.7.0 was not found and need to be installed. When I tried installing ruby 2.7.0 via rbenv, it said version already exists.

I tried to execute `ruby -v` outside of the project just to be sure that it was not a problem with ruby version. It took a really long time to process the command which returned with following error:

```bash
/home/deploy/.rbenv/libexec/rbenv-exec: line 47: /home/deploy/.rbenv/shims/ruby: Argument list too long
```

Google searches didn't yield any relevant results.

In the process (after searching more for around two days), I stumbled upon the rbenv issue <a href="https://github.com/rbenv/rbenv/issues/759" target="_blank" rel="noopener">rbenv: cannot rehash</a>. I had never imagined these issues to be related at all. I executed the command to rehash the rbenv to see if it executes successfully instead of throwing the error mentioned in the Github issue.

Boom! same issue; rbenv could not be rehashed.

Solution as mentioned in the replies was to delete the file ".rbenv-shim", and rehash rbenv again. It worked!

## Solution

Execute the command `rbenv rehash`. It will return the location of the file you have to delete:

```bash
rbenv: cannot rehash: /home/deploy/.rbenv/shims/.rbenv-shim exists
```

Here, "/home/deploy/.rbenv/shims/.rbenv-shim" is the location of the file in my machine and it could be different in your local machine.

Remove the file to resolve the issue:

`rm /home/deploy/.rbenv/shims/.rbenv-shim`

Now when you run the command `ruby -v` it will return the version of ruby currently installed in your machine.

## Reason behind the issue

It happens when previous rehash of the rbenv was killed prematurely.

Quoting from <a href="https://github.com/rbenv/rbenv/issues/759#issuecomment-124748535" target="_blank" rel="noopener">reply to the Github Issue</a>:

> During the rehash process, rbenv writes out the temporary file .rbenv-shim to indicate that the rehash is in progress. Then, if a parallel rbenv rehash process tries to run at the same time, it will fail because the file already exists. This guards against race conditions in parallel rehashes.
>
> It seems like .rbenv-shim file was never cleaned up after a rehash that ran earlier. That earlier process might have been killed prematurely and never cleaned up after itself.

## Conclusion

I am not sure if solution to the issue `.rbenv/shims/ruby: Argument list too long` is always to delete the ".rbenv-shim" file but hey, it's worth a try.

If the solution to your problem was different than this, please let us know below in the replies and I will be sure to include it in this blog so that it helps others.

Thank you for reading. Happy coding!

## References

- <a href="https://github.com/rbenv/rbenv/issues/759" target="_blank" rel="noopener">rbenv: cannot rehash [Github]</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@art_maltsev?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Artem Maltsev</a> on <a href="https://unsplash.com/s/photos/frustration?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
  