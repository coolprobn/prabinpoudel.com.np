---
title: '[Fix] Rails server is already running'
date: 2021-06-27
path: /notes/fix-rails-server-is-already-running/
excerpt: "A server is already running. Check .../tmp/pids/server.pid This error means the rails server suspended or stopped abruptly, due to which background process is already running on the port that rails server was previously running on."
image: ../../images/notes/fix-rails-server-is-already-running.webp
categories: [notes]
tags: [ruby on rails]
toc: true
featured: true
comments: true
---

## Error

"A server is already running. Check **.../tmp/pids/server.pid**"

This error means that the server is already running in the port you are trying to start the rails server on; normally 3000.

## Reasons for Error

This error can occur in two cases:

1. You are running the Rails server on port 3000 in another tab of the terminal

2. You suspended the server abruptly
     
    This normally happens when you stop the server with `ctrl+z` instead of `ctrl+c` to exit the Rails server. `ctrl+z` suspends the process but doesn't close the server running on port 3000 meaning the server is still running on background.

    This can also happen when you close the terminal that the rails server was running on.

## Solution

### Rails server is running on port 3000 in another tab of the terminal

You can just close the server running on another tab on port 3000 to resolve this issue.

### Server suspended abruptly

Solution for this case is to kill the process running in the background on port 3000

1. Find the process id for the rails server port
   
     If the port you are running the rails server is different than 3000, you should replace 3000 with the port number as required.

     ```cmd
       lsof -wni tcp:3000
     ```

     You should be able to see the output like this:

     ```cmd
      COMMAND   PID USER   FD   TYPE            DEVICE SIZE/OFF NODE NAME
      ruby    16660 cool   14u  IPv4 0x89786e1f70a36a3      0t0  TCP 127.0.0.1:hbci (LISTEN)
      ruby    16660 cool   15u  IPv6 0x89786e1d82f7aeb      0t0  TCP [::1]:hbci (LISTEN)
     ``` 

2. Copy value in PID column, here **16660**

3. Kill the process

     ```cmd
       kill -9 16660
     ```

     You should see the following output:

     ```cmd
       [1]  + 10975 killed     rails s
     ```

 4. Try running the server again
      

## Conclusion

Rails server should be up and running without any errors now.

Thank you for reading. Happy Coding!

## References

- <a href="https://stackoverflow.com/a/64998938/9359123" target="_blank" rel="noopener">A server is already running (Stack Overflow)</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@olav_ahrens?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Olav Ahrens Røtne</a> on <a href="https://unsplash.com/s/photos/solution?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
