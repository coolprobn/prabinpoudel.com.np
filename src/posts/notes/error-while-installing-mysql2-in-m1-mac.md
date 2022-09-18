---
title: '[Solved] Error while Installing mysql2 Gem in M1 Mac'
date: 2022-09-18
path: /notes/error-while-installing-mysql2-in-m1-mac/
excerpt: "In Ruby on Rails applications with mysql2 gem, mysql2 gem always threw error when trying in the new M1 Mac. The error always said \"ld: library not found for -lzstd\" and \"make failed\"."
image: ../../images/notes/error-while-installing-mysql2-in-m1-mac.webp
categories: [notes]
tags: [mysql, ruby on rails]
toc: true
featured: false
comments: true
---

In Ruby on Rails applications with mysql2 gem, mysql2 gem always threw error when trying in the new M1 Mac. The error always said "ld: library not found for -lzstd" and "make failed".

Let's resolve this issue today!

## Assumptions

1. You are using rbenv for ruby
2. You are using homebrew

## Error Message

Whenever I did bundle install inside the project, I got the following error:

```
linking shared-object mysql2/mysql2.bundle
ld: library not found for -lzstd
clang: error: linker command failed with exit code 1 (use -v to see invocation)
make: *** [mysql2.bundle] Error 1

make failed, exit code 2
```

## Solution

To resolve the issue, you will have to provide the location for mysql installation in homebrew and install the mysql2 gem separately.

1. Find out the version of mysql installed in your machine

  Run the following command in the command line:

  ```
  $ mysql --version
  mysql  Ver 8.0.27 for macos12.5 on arm64 (Homebrew)
  ```

  Note the mysql version; here 8.0.27 and move to next step.

2. Install mysql2 gem separately

  To resolve the make error we will have to install mysql2 gem separately. To do that run the following command by changing the mysql version you got in previous step.

  ```
  rbenv exec gem install mysql2 -- \
 --with-mysql-lib=/opt/homebrew/Cellar/mysql/8.0.27/lib \
 --with-mysql-dir=/opt/homebrew/Cellar/mysql/8.0.27 \
 --with-mysql-config=/opt/homebrew/Cellar/mysql/8.0.27/bin/mysql_config \
 --with-mysql-include=/opt/homebrew/Cellar/mysql/8.0.27/include 
  ```

2. Run "bundle install" from your project root

  Move to the project root and run `bundle install` in the command line.

## Still getting the same error?

  If you are still getting error, you need to also hit the command given below.

  ```
  # check zstd version
  $ ls /opt/homebrew/Cellar/zstd
  1.5.0

  $ bundle config --local build.mysql2 \
    "--with-ldflags=-L/opt/homebrew/Cellar/zstd/1.5.0/lib"
  ```

  Run `bundle install` again from inside the project root and the error should now go away.

## Downside

The downside of this solution is we have to run this command every time the mysql version is updated using homebrew.

So for example if your mysql version changes from 8.0.27 to 8.0.30 then you will again get this error. And in that case you will have to install the mysql2 gem separately again by using the steps above.

## Conclusion

If you have any other solutions for this problem, do let us know in the comment section below.

Thank you for reading. Happy coding!

## References

- [Stack Overflow] <a href="https://stackoverflow.com/a/70053102/9359123" target="_blank" rel="noopener"> An error occurred while installing mysql2 (0.4.8), and Bundler cannot continue</a>
- [Github] <a href="https://github.com/brianmario/mysql2/issues/1175#issuecomment-846496862" target="_blank" rel="noopener">bundle install fails with Gem::Ext::BuildError</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@rubaitulazad?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Rubaitul Azad</a> on <a href="https://unsplash.com/s/photos/mysql?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
