---
uid: 'PB-N-4'
title: 'Remove files or folders from remote git'
date: 2020-08-16T17:43:06.026Z
path: /notes/git-remove-files-and-folders-from-remote/
excerpt: 'After pushing the code to the remote repository; Did I just push IDE related folder? What about that file containing sensitive information? I have been at the same spot and you can easily remove that file or folder!'
image: ../../images/notes/git-remove-files-and-folders-from-remote.webp
categories: [notes]
tags: [git]
comments: true
featured: true
toc: true
canonical: true
canonical_url: 'https://thedevpost.com/blog/remove-files-or-folders-from-remote-git/'
---

GIT is great, it has made collaboration with other developers so easy, I can't thank GIT enough. But GIT is vast and not every command remains on my mind. I find myself googling over and over again to get that right GIT command that can solve my problem.

Recently when working on one of the project that had just started, I accidentally pushed IDE folder to remote repository and I was there googling again, so I thought, why not write blog for this?. I can always come straight to my blog if this happens again and I can also help my fellow developers this way, right?

All sensitive information and IDE related folders should be added to gitignore so they are not tracked by git. You may already know this, but it doesn't help if your file or folder is already in the remote repository. Today we will learn how we can remove files or folders from remote repository. Let's get started!

## Remove file or folder from remote repo only

```shell
# Remove a single file
git rm --cached password.txt

# Remove a single folder
git rm --cached -rf .idea
```

## Remove file or folder from both remote repo and local

```shell
# Remove a single file
git rm password.txt

# Remove a single folder
git rm -rf .idea
```

[[notice | Don't forget to add file or folder to gitignore]]
| After removing the file or folder, we shouldn't forget to add them to **gitignore** before we commit and push to the repo again. Or we will be back to the start of blog removing those again!

Straight and sweet, that's it. Any confusions? Have a better solution? Please comment below, it's never a bad idea to have a healthy conversation. Thank you. See you again!

**References:** <a href="https://stackoverflow.com/a/3469805/9359123" target="_blank">Remove file or folder only from remote repo</a>

**Image Credits:** Cover Image by <a href="https://unsplash.com/@shaonpro?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Mahmudul Hasan Shaon</a> from <a href="https://unsplash.com/s/photos/code?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank">Unsplash</a>
