---
title: "S3 Website Ci Cd With Wercker"
date: 2018-01-30T13:13:22-05:00
draft: false
include_toc: true
---
<!--more-->


## Part 1 , Git Setup  

### Client
Install git client (https://git-scm.com/downloads) and make sure the git command line works.

### Commit project
cd to your hugo project root folder and issue the below commands
```
 > cd <to my project root folder>
 > git init
 > git add .
 > git commit -m "my first commit"

``` 
### Commit Wercker file
Add the below file to the root folder of your project and commit. This file has the following 3 steps for the build pipeline.

* setup hugo
* setup awscli
* push /public folder contents to the aws s3
* invalidate cloudfront cache


wercker.yml
```
# This references a standard debian container from the
# Docker Hub https://registry.hub.docker.com/_/debian/
# Read more about containers on our dev center
# http://devcenter.wercker.com/docs/containers/index.html
box: debian
# You can also use services such as databases. Read more on our dev center:
# http://devcenter.wercker.com/docs/services/index.html
# services:
    # - postgres
    # http://devcenter.wercker.com/docs/services/postgresql.html

    # - mongo
    # http://devcenter.wercker.com/docs/services/mongodb.html

# This is the build pipeline. Pipelines are the core of wercker
# Read more about pipelines on our dev center
# http://devcenter.wercker.com/docs/pipelines/index.html
build:
    # Steps make up the actions in your pipeline
    # Read more about steps on our dev center:
    # http://devcenter.wercker.com/docs/steps/index.html
  steps:
    - arjen/hugo-build:
        version: "0.32.4"
        theme: Hugo-Octopress
        flags: --buildDrafts=true
    - odk211/install-awscli:
        key: $AWS_KEY
        secret: $AWS_SECRET
        region: $AWS_REGION
    - script:
        name: "sync build with s3"
        code: |
          aws s3 sync --acl "public-read" --sse "AES256" public/ s3://${BUCKET_NAME}/ --exclude 'images' --exclude 'js' --exclude 'downloads' --exclude 'css' --exclude 'post'
          aws s3 sync --cache-control "max-age=2592000" --acl "public-read" --sse "AES256" public/images/ s3://${BUCKET_NAME}/images/
          aws s3 sync --cache-control "max-age=2592000" --acl "public-read" --sse "AES256" public/css/ s3://${BUCKET_NAME}/css/
          aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths /index.html /
```

## Part 2 , Setup project Wercker @ http://www.wercker.com/
________________________________________

* Sign In the site using your github account
* Click on `Create Application` and Select Github
* Select your hugo project repository from the list
* Let Wercker checkout code without using SSH key
* Hit on `Create` to create the applicaton.

Set the following environment variables for your application in Wercker. These are the parameter for the wercker.yml file we checked in prior step.

* AWS_KEY  (I created a new IAM user with access to s3 and cloudfront, no console access)
* AWS_SECRET
* AWS_REGION
* BUCKET_NAME
* DISTRIBUTION_ID ( cloudfront distribution id)

Next time after your unit test your hugo site locally. Push into the github ,a build should kickoff  and push /public hugo files into your S3 bucket.

### Wercker Buid...

![](/supporting_files/2018-01-30-s3-website-ci-cd-with-wercker/wercker_build.png)