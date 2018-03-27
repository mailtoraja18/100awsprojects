---
title: "Experiment with SAM Local"
date: 2018-03-21T03:13:22-05:00
draft: false
include_toc: true
---
<!-- more -->

The goal of AWS SAM is to define a standard application model for serverless applications. With AWS SAM Local you can be used to test functions LOCALLY in your desktop, start a LOCAL API Gateway from a SAM template, validate a SAM template, and generate sample payloads for various event sources. Lets get started to see some SAM Local in action. After testing locally you can package and deploy the functions to remote.

## Prerequisites
* Go through the url and setup the Prerequisites. https://github.com/awslabs/aws-sam-local
	* Install NodeJs
	* Install Docker CE (Windows or Mac) , start Docker
	* Execute command `npm install -g aws-sam-local` to install aws sam local
* In Windows you might need to do the following for Docker.
	* set HOME=C:\Users\user
	* provide access to your C drive to docker
* Install Dynamo DB Locally and Start 
	* https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
* Start Docker Container
	* use `Docker for Windows`s shortcut
* Install Postman for testing, https://app.getpostman.com/app/download/win64 , for Mac you can use curl.


## A Note about AWS Config Update Endpoint
This endpoint helps you point to the Local Dynamo DB. Be mindful wether your code is pointing locally or remote.
 ```
 AWS.config.update({
      region: "us-east-1",
      endpoint: "http://<what to put here ?>:8000"
  }); 
 ```

### In Windows   
In Docker for Windows, the container communicates through a vEthernet adapter called DockerNAT. To find its details, open Command Prompt and type ``ipconfig``
Look for an entry that looks like

Ethernet adapter vEthernet (DockerNAT):
```   
Connection-specific DNS Suffix  . :
Link-local IPv6 Address . . . . . : fe80::fd29:297:4583:3ad4%4
IPv4 Address. . . . . . . . . . . : 10.0.75.1
Subnet Mask . . . . . . . . . . . : 255.255.255.0
Gateway . . . . . . . . . :
```   
The IP address to the right of IPv4 Address is the one you need.

### For MAC
use this ```docker.for.mac.localhost```

## Code Resources and Next
###  1) Download and Review Code
Download the petclinic_sam folder https://github.com/mailtoraja18/aws_serverless_resources/tree/master/petclinic_sam

### 2) Start Dynamodb Locally and Create Pet table
* Run `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`
* Run `node dynamo_pet_create_table.js`

### 3) Load data
* Run `node dynamo_pet_load_data.js`

### 4) Start the SAM-LOCAL from petclinic_sam folder
`sam --version` and then `sam local start-api`

First time
```
2018/03/21 18:52:35 Connected to Docker 1.35
2018/03/21 18:52:35 Runtime image missing, will pull....
2018/03/21 18:52:35 Fetching lambci/lambda:nodejs6.10 image for nodejs6.10 runtime...
nodejs6.10: Pulling from lambci/lambda
5be106c3813f: Extracting  192.2MB/324.7MB
e240967675e1: Download complete
95d21be37ff9: Download complete
caf7e45f0ace: Download complete
```
You should see the below log next time onwards
```
2018/03/23 21:42:29 Fetching lambci/lambda:nodejs6.10 image for nodejs6.10 runtime...
nodejs6.10: Pulling from lambci/lambda
Digest: sha256:bc47c223a2accf47c51adc6e1949bda9b557764be38a76ebac73e545044079cc
Status: Image is up to date for lambci/lambda:nodejs6.10
```
Then you should see the REST API's deployed (i dont know why it shows the same file for all , bug ?)

```
Mounting dynamo_pet_find_by_status.handler (nodejs6.10) at http://127.0.0.1:3000/pets [POST]
Mounting dynamo_pet_find_by_status.handler (nodejs6.10) at http://127.0.0.1:3000/pets/info [POST]
Mounting dynamo_pet_find_by_status.handler (nodejs6.10) at http://127.0.0.1:3000/pets/status [POST]
Mounting dynamo_pet_find_by_status.handler (nodejs6.10) at http://127.0.0.1:3000/pets [DELETE]
Mounting dynamo_pet_find_by_status.handler (nodejs6.10) at http://127.0.0.1:3000/pets/{petId} [GET]
Mounting dynamo_pet_find_by_status.handler (nodejs6.10) at http://127.0.0.1:3000/pets [GET]
Mounting dynamo_pet_find_by_status.handler (nodejs6.10) at http://127.0.0.1:3000/pets/status/{status} [GET]
```

## Test Locally using Postman
Use postman to fire away at the REST API's. After you have tested , its time to deploy remotely.

## What just happened ?
The template.yaml provides the API definitions and the scripts they should point at. We are running the DynamoDB locally here . On AWS you would use 
the dynamo db access policy `Policies: AmazonDynamoDBFullAccess` to access the DynamoDB. The below package and deploy commands will push all teh code to S3 bucket and use clould formation to create 
the API Gateway and Lambda function and apply the policy.

## Deploy Remote
* create a new bucket like `xdr56yhn-aws-sam` in your account.
* `sam package --template-file template.yaml --s3-bucket xdr56yhn-aws-sam --output-template-file packaged.yaml`
* `sam deploy --template-file ./packaged.yaml --stack-name PetStack --capabilities CAPABILITY_IAM`

## Test Remote
Pull up the AWS API Gateway page and use the Console Test functionality to test the functions.

## Delete Stack
You just created a AWS Cloudformation Stack. You can get into the page and choose Action > Delete to delete the stact you just created.


