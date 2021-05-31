---
title: 'Integrate Pronto with Gitlab CI for Rails App'
date: 2021-05-29
path: /articles/integrate-pronto-with-gitlab-ci-for-rails-app/
excerpt: "There are multiple ways to fix missing top level class documentation comment in Rubocop. You can disable it in your whole app with by disabling cop in the whole project, disable it in one class or just add a comment above the class declaration."
image: ../../images/articles/integrate-pronto-with-gitlab-ci-for-rails-app.webp
categories: [articles]
tags: [ruby on rails, rubocop, lint, automated code review]
toc: true
featured: true
comments: true
last_modified_at: 2021-05-31
---

At <a href="https://truemark.com.np" target="_blank">Truemark</a>, we are constantly looking to improve the code quality in our projects. And one way to do that is through the regular code review process. Code review process can quickly get exhausting if team members have to spend majority of their time on maintaining best practices.

Enters automated code review; which reviews source code for compliance with a predefined set of rules and best practices.

In Rails projects, to define rules and best practices, we use RuboCop and for code reviews we will be using Pronto integrated with Gitlab CI.

## What is Pronto?

Pronto is a gem which uses RuboCop configuration file to perform analysis on changes made in the given feature branch and adds comment to merge requests based on the best practices configured. Pronto can be integrated with popular version control system managers like Gitlab. Github and Bitbucket.

It also works on local machine and is perfect if you want to find out quickly if a branch introduces changes that conform to your style guide (rules configuration file), are DRY and doesn't introduce security holes.


## Why Pronto?

Short answer, for automating the code review process so your team doesn't have to manually comment and make sure that every team member is following the best practices.

Every developer has their own belief on the best practices and styles, for e.g. some want to use single quotes whereas others prefer double quotes. Some love using semicolons, other just think it's unnecessary. This can brew conflict in the team, when teammates are reviewing merge requests, hence we let Pronto do this. 

Best practices and style guide can first be setup by the team and Pronto makes sure that every member is adhering to those rules.

## Assumption

- RuboCop has been configured in the app, i.e. **.rubocop.yml** exists in the project

## Install Pronto

1. Add following to development, test group

    ```gemfile
      group :development, :test do
        gem 'pronto'
        gem 'pronto-rubocop', require: false
        gem 'pronto-flay', require: false
      end
    ```

2. From command line, run `bundle install`

   ```cmd
    bundle install
   ```

3. Add specific version for the installed Gems

    After bundle install, go to your Gemfile and search the gem version installed and update the Gemfile with that version

    ```gemfile
      group :development, :test do
        gem 'pronto', '~> 0.11.0'
        gem 'pronto-rubocop', '~> 0.11.1', require: false
        gem 'pronto-flay', '~> 0.11.0', require: false
      end
    ```

## Setup Pronto

Create **.gitlab-ci.yml** in the root project and add the following:

```yml
  image: ruby:3.0.0 # this should be the ruby version that your rails app is using, ours was using 3.0.0

  before_script:
    - apt-get update && apt-get install -y cmake # Install cmake needed for pronto
    - bundle install # install all packages in the Gemfile
    - git fetch origin # fetch all branches, was throwing Rugged::ReferenceError, you can remove this and try if it works for you

  stages:
    - lint # we are only formatting/linting the changes

  pronto:
    stage: lint # runs pronto on the lint stage
    only:
      - merge_requests # run pronto only on merge requests (also runs when new changes are pushed to the merge request)
    script:
      - PRONTO_GITLAB_API_PRIVATE_TOKEN=$PRONTO_ACCESS_TOKEN bundle exec pronto run -f gitlab_mr -c origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME # Run pronto on branch of current merge request
```

_NOTES_: 

1. `$PRONTO_ACCESS_TOKEN` should be configured in gitlab which is explained in steps below. 
2. `$CI_MERGE_REQUEST_TARGET_BRANCH_NAME` is the predefined Gitlab CI variable which returns the branch name of the current merge request. You can read more about the predefined Gitlab CI variables <a href="https://docs.gitlab.com/ee/ci/variables/predefined_variables.html" target="_blank">here</a>.


## Setup Personal Access Token

1. In Gitlab, after login, go to <a href="https://gitlab.com/-/profile/personal_access_tokens" target="_blank">personal access token</a>
2. Enter a name and optional expiry date for the token.
3. In scopes, choose only **api**, it is enough for our purpose as it gives all access to the project via Gitlab API.
4. Click on **Create token**
5. Copy the token and keep it somewhere safe, we will need this in next step.

Reference: <a href="https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html" target="_blank">Official documentation</a>

## Add Personal Access Token to the Project

To use the Personal Access Token (`$PRONTO_ACCESS_TOKEN`) in our Gitlab CI, we should set it up as custom variable in settings inside CI/CD.

_NOTE_: Only project members with maintainer permissions can add or update project CI/CD variables, so make sure you have the correct access.

1. Go to your project
2. From the left menu, in Settings; choose the CI/CD
3. Expand **Variables** Section
4. Click on **Add Variable**
5. In **Key**, add `PRONTO_ACCESS_TOKEN` as that is what we have configured in our .gitlab-ci.yml file. You can use any key name, just make sure to update it inside .gilab-ci.yml.
6. In **Value**, add the token generated in the previous step
7. In **Flags** section, uncheck **Protect variable**, checking this option will export the variable (`PRONTO_ACCESS_TOKEN`) only for protected branches like master/main. But we need this variable inside all merge request branches.
8. Check **Mask variable** so our token value is not visible in the CI job logs.
9. Click on **Add variable**

Reference: <a href="https://docs.gitlab.com/ee/ci/variables/#project-cicd-variables" target="_blank">Official documentation</a>

## Run Pronto locally

1. Run against master
    `pronto run`

2. Run against other branches
    `pronto run -c branch-name`

## Run Pronto with Gitlab CI

1. Commit the changes made in the branch and push the code to Gitlab
2. You should see Gitlab CI running automatically now and it should pass
3. If Pronto finds any issues after analyzing the codes changed in the merge request, it will post those issues as comments in that merge request.

_NOTE_: Sometimes it throws **Reference::RuggedError** due to missing git branch, retry running the job in that case and it should work the second time.

## View Job Log

If you are curious and want to see what is happening in the background, you can check the Gitlab CI Job log.

1. From the left menu inside the project, hover over CI/CD and click on Jobs
2. To view the log, click on job id in the Job column which starts with #, for e.g. #1290157388

Due to installation of all gems (`bundle install`) in the project, it can take up to 3 minutes for the job to be completed even when there are not many changes.

## Conclusion

The main reason for writing this article was because I couldn't find decent article explaining exactly what we should do to integrate Pronto in Gitlab. Integration guide for Pronto in official documentation was not clear enough to guide us what exactly to do for integrating Pronto with Gitlab CI.

We were able to find some blogs, and majority of them were using Docker or were Github integrations, it took a while for the team to figure this solution out. Now this blog should save your team's time when you are using Pronto with Gitlab Ci in your projects. Good luck!

Thank you for reading. See you in the next blog.

**References**

- https://github.com/prontolabs/pronto
- https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html
- https://docs.gitlab.com/ee/ci/variables/#project-cicd-variables


**Image Credits:** Cover Image by <a href="https://unsplash.com/@pankajpatel?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Pankaj Patel</a> from <a href="https://unsplash.com/s/photos/git?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank">Unsplash</a>
