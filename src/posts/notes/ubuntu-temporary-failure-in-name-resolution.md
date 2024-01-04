---
title: '[Solved] Ubuntu 22 Temporary failure in name resolution'
date: 2024-01-04
path: /notes/ubuntu-temporary-failure-in-name-resolution/
excerpt: "The Temporary failure in name resolution error occurs when the system cannot translate a website name into an IP address. We will look at the solution to this issue in this post."
image: ../../images/notes/ubuntu-temporary-failure-in-name-resolution.webp
categories: [notes]
tags: [ubuntu]
toc: true
featured: false
comments: true
---

## Background

In one of the client project, we had to upgrade our existing Ubuntu server from the version 20 to 22. Upgrade was smooth but after the upgrade was done, we started noticing the issue of "Temporary failure in name resolution".

## When does this error occur?

The "Temporary failure in name resolution" error occurs when the system cannot translate a website name into an IP address. Somehow it got messed up during the upgrade

## Fix

To fix the issue, you can hit the following commands; this fix was tested on an upgrade Ubuntu at version 22.04.2

```
$ apt install netplan.io
$ systemctl unmask systemd-networkd.service
$ systemctl unmask systemd-resolved.service
$ ENABLE_TEST_COMMANDS=1 netplan migrate
$ netplan try

# WARNING: This will immediately log you out of the server and restart it, if you are working with Production server; run with care.
$ reboot

$ apt purge ifupdown resolvconf
$ ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

Tada, and that should fix the issue 🎉

## Conclusion

Are there any other solutions you tried and it worked? Let us know in the comments below.

Thank you for reading. Until next time! Happy tinkering.

## References:

- <a href="https://askubuntu.com/a/1444331" target="_blank" rel="noopener">"Temporary failure in name resolution" after upgrading 22.04 to 22.10</a>
- <a href="https://gist.github.com/mss/7a8e048dd51e5ef928039f1450ba8f31" target="_blank" rel="noopener">Migrate from ifupdown to netplan</a>

## Image Credits

- Cover Image by <a href="https://unsplash.com/@albertstoynov?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash" target="_blank" rel="noopener">Albert Stoynov</a> on <a href="https://unsplash.com?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a>
