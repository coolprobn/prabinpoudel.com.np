---
title: 'Run Cron Job Manually'
date: 2024-01-16
path: /notes/run-cron-job-manually/
excerpt: "Cron Jobs run at specific time but what if you want to run them manually and immediately? In this blog we will look into a solution using which we can run any of our Cron Jobs manually."
image: ../../images/notes/run-cron-job-manually.webp
categories: [notes]
tags: [cron]
toc: true
featured: false
comments: true
---

Cron Job has made the scheduling of various tasks super easy but debugging those scripts from Cron Job is equally harder. This is because Cron Job runs command you provide to it always at one specific time; which means there are only two ways for you to run the Cron Job:

- Wait for the Cron Job to run at the time you have given, could be seconds, minutes or even hours
- Run the Cron Job every minute and see if it throws any error (most people do this)

What if I tell you there is also a third way; run the Cron Job manually.

This approach will help us in running any of our script immediately without having to wait for Crontab to execute our job at specific time. And it will also run the job by replicating the same environment Cron uses while running it's jobs. Super helpful for debugging any Cron related issue if you ask me.

## Steps

Let's dig into the approach of running the Cron Job manually then.

### Step 1: Get PATHs your normal Cron Job uses

The biggest difference in running the script directly from the command line versus from the Cron Job is difference in it's PATH values.

A lot of times, Cron Job fails to execute because PATH doesn't include executables for e.g. for Ruby, PERL, etc. and due to these executables not being found script that was running properly in development or even from command line in the production server will no more work when running the same script from the Cron Job.

Run the command `crontab -e` to edit your crontab and add the following entry to the top (or anywhere in the file):

```crontab
* * * * * /usr/bin/env > /home/deploy/cron-env
```

Please note that `/home/deploy` is the root path of my logged in user in the Production server, it could be different for you.

With the above entry in the crontab, we are telling the Cron Job to run every minute and add PATHs it gets from the command "/usr/bin/env" to a file named "cron-env"

Wait for a minute and check the content inside the file "cron-env" with the command `cat cron-env`, it should have the content similar to this:

```bash
HOME=/home/deploy
LOGNAME=deploy
PATH=/usr/bin:/bin
LANG=en_US.UTF-8
SHELL=/bin/sh
PWD=/home/deploy
```

Please note that "deploy" is the name of the logged in user.

You should remove the Cron Job we added previously from the Crontab since it has served it's purpose of providing us with PATHs we will require to run commands as a Cron Job.

### Step 2: Create a bash script to run any command similar to Cron Job

Create a new file with the command `nano run-as-cron` and add the following inside:

```bash
#!/bin/bash

/usr/bin/env -i $(cat /home/deploy/cron-env) "$@"

```

Here is what the above command is doing:

- `/usr/bin/env` is the path to the env command, which is used to find and execute a specified command with a modified environment
- `-i` option tells env to start with an empty environment, ignoring the inherited environment variables.
- `$(cat /home/deploy/cron-env)` uses the "cat" command to read the contents of the file located at /home/deploy/cron-env and then uses command substitution `$(...)` to include the contents of the file as arguments to the env command. The contents of the file are expected to be environment variable assignments for any commands that is run using this bash script.
- `"$@"` is a special variable which represents all the arguments passed to the script or command. In this context, it allows the script or command executed by env to receive the same arguments that were passed to the original script or command containing this line.

  For e.g. if you run the command `./run-as-cron /path/to/script -with arguments` then everything after "./run-as-cron" is passed as it is here and executed by this script.

### Step 3: Run any command you want by replicating the Cron behavior

Now we are ready to run any command we want using the same environment variables Cron Job uses during it's run.

You can run the command you want now with:

```cmd
$ ./run-as-cron /path/to/script --with arguments --and parameters
```

For example if you have a script let's say to read a CSV file and parse them as JSON then you can run that command now with:

```cmd
$ ./run-as-cron /home/deploy/production/scripts/parse-csv-as-json '/home/deploy/production/csv-files/employees.csv'
```

This assumes you take the file path as an argument inside the script.

And that's it, you should now be able to run the Cron Job manually and debug the result from it immediately! 

If you are a Ruby on Rails developer follow along for a bit more as I have a bonus tip for you.

### Bonus: Run Ruby on Rails tasks replicating the Cron behavior

Unrelated to this tutorial and being a Rails developer myself, I thought of attaching some bonus example on running the rake task by executing as the Cron Job manually.

I am also assuming that you also already have whenever gem configured and added some Rake tasks to "config/schedule.rb"

Now for example if you have a rake task that sends an email to you once a day with the list of users who registered yesterday to your app then the command could look like something below:

```cmd
$ ./run-as-cron /bin/bash -l -c 'cd /home/deploy/production/your-app/current && RAILS_ENV=production /home/deploy/.rbenv/shims/bundle exec rake users:registered_yesterday --silent >> log/whenever.log 2>&1'
```

I have just copied the command whenever executes when we deploy the Rails app with "Capistrano", here is the short explanation of bash command and options used above:

- `/bin/bash` specifies the Bash shell to be used for running the command.
- `-l` option makes Bash act as if it had been invoked as a login shell. This means it will read certain login-specific configuration files.
- `-c '...'` option allows you to pass a command as a string for Bash to execute. The command inside the single quotes is the actual command being executed.
- `cd /home/deploy/production/your-app/current && RAILS_ENV=production /home/deploy/.rbenv/shims/bundle exec rake users:registered_yesterday` tells the script to change the working directory to the folder ".... /current" and execute the Rake task.
- ``>> log/whenever.log 2>&1` appends both standard output and standard error to the file "log/whenever.log". This is a common technique to capture both normal output and errors in a log file.

## Conclusion

In this short and to the point tutorial we have learnt how we can run the Cron Job manually and immediately be able to debug issues instead of having to wait for some minutes or hours to debug the issue.

I hope you have also learnt about some new bash command options and techniques as I did while writing this blog. Lastly, I hope it helps you save a lot of your time into the future now when debugging any Cron Job.

Thank you for reading. Happy Tinkering!

## References

- <a href="https://serverfault.com/questions/85893/running-a-cron-job-manually-and-immediately" target="_blank" rel="noopener">Running a cron job manually and immediately [Server Fault]</a> 

## Image Credits

- Cover Image by <a href="https://unsplash.com/@icons8?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Icons8 Team</a> on <a href="https://unsplash.com/photos/silver-bell-alarm-clock-dhZtNlvNE8M?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Unsplash</a>
