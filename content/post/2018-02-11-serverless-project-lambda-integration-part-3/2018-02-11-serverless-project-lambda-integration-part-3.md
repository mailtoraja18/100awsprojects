---
title: "AWS Serverless Project Lambda Integration Part 3"
date: 2018-02-11T03:13:22-05:00
draft: false
include_toc: true
---

## First Read this
Understanding the lambda function Handler [Read More...](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html)

## Create IAM Policy
Review and use the below 3 files , download to a folder and execute the following command
This create a IAM Role and grants (2) permission to the Pet table and the Cloudwatch logs

* [trustpolicy.json](/supporting_files/2018-02-11-serverless-project-lambda-integration-part-3/trustpolicy.json)
* [dynamodb_permission_serverless.json](/supporting_files/2018-02-11-serverless-project-lambda-integration-part-3/dynamodb_permission_serverless.json)
* [log_permission_serverless.json](/supporting_files/2018-02-11-serverless-project-lambda-integration-part-3/log_permission_serverless.json)

```

# Create the role and attach the trust policy that enables Lambda to assume this role.
$ aws iam create-role --role-name lambda-execution-serverless --assume-role-policy-document file://trustpolicy.json

# Embed the permissions policy (in this example an inline policy) to the role to specify what it is allowed to do.
$ aws iam put-role-policy --role-name lambda-execution-serverless --policy-name permission-dynamodb-serverless --policy-document file://dynamodb_permission_serverless.json
$ aws iam put-role-policy --role-name lambda-execution-serverless --policy-name permission-log-serverless --policy-document file://log_permission_serverless.json

```
After this step make a note of the `arn:aws:iam::375525124878:role/lambda-execution-serverless` fron your command window

Login and review from console now !!

## The Lambda function

We are going to use the below lambda function, which querries the DynamoDb for a pet using a hard-coded primary key. This also logs the informaton in the console.

```
var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
exports.dynamo_query_pet_by_id = (event, context, callback) => {
var id = 1; // we will change this later
var params = {
    TableName : "Pet",
    KeyConditionExpression: "#id_key = :id_val",
    ExpressionAttributeNames:{
        "#id_key": "id"
    },
    ExpressionAttributeValues: {
        ":id_val":id
    }
};
docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            callback(null, JSON.stringify(item)); //returning call using callback
            console.log(item);
        });
    }
});
};

```

## Create Above Lambda Function Using CLI
Review and use the below file

* [dynamo_query_pet_by_id.js](/supporting_files/2018-02-11-serverless-project-lambda-integration-part-3/dynamo_query_pet_by_id.js)

* [dynamo_query_pet_by_id.zip](/supporting_files/2018-02-11-serverless-project-lambda-integration-part-3/dynamo_query_pet_by_id.zip)

The below command uses all default values to create a `query by pet id` function.

```

$ aws lambda create-function --function-name "dynamo_query_pet_by_id" --runtime "nodejs6.10" --role "arn:aws:iam::374525349870:role/lambda-execution-serverless" --handler "dynamo_query_pet_by_id.dynamo_query_pet_by_id" --zip-file fileb://dynamo_query_pet_by_id.zip

```
Login to the console `Lambda > Functions > dynamo_query_pet_by_id` and review the function.

## Test your Lambda
Login to the console and create a test function. Dont worry about passing values. Just execute the query. 
You should see a response from the DynamoDB becuase the primary key is hard coded into the function.

Hurrey !! You now have a working function that can query the DynamoDb


## Next
Lets integrate the AWS API Gateway to call out Lambda function , which in turn would call the DynamoDb.