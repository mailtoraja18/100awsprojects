---
title: "AWS Serverless Project DynamoDB Part 2"
date: 2018-02-08T03:13:22-05:00
draft: false
include_toc: true
---
<!--more-->
## Objective
Install DynamoDB locally and Create the Pet table and test it using Nodejs. Once done , create the table on the AWS Cloud using command line.
Load some data then login to the console to browse the table.

## Local

### Install DynamoDB and Nodejs
Install [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) and [Nodejs](https://nodejs.org/en/) and run the `aws configure` command to configure your local with a AWS access key id and secret access key and default region. [Read More..] (https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)

### Local
Start the DynamoDb instance locally using the below command
```
cd <dynamo db parent folder>
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```
This kicks off the dynamodb locally.

### Execute a js file
use the command `node fileName.js` to execute each of the files below from the command line.
Save each of the code snippets in their own js file and execute using node js.

### Create the table locally and load data.
```
var AWS = require("aws-sdk");

//local configuration
AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});
var dynamodb = new AWS.DynamoDB();
var params_pet_table = {
    TableName : "Pet",
    KeySchema: [       
        { AttributeName: "id", KeyType: "HASH"},
        { AttributeName: 'category', KeyType: 'RANGE'}  //Partition key
    ],
    AttributeDefinitions: [       
        { AttributeName: "id", AttributeType: "N" },
        { AttributeName: "category", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};
dynamodb.createTable(params_pet_table, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});

```
* You set the endpoint to indicate that you are creating the table in DynamoDB on your computer.
* In the createTable call, you specify table name, primary key attributes, and its data types.Other columns are not specified.
* The ProvisionedThroughput parameter is required, but the downloadable version of DynamoDB ignores it. [Read More..](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ProvisionedThroughput.html)

### Load data locally
```
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var tableName = "Pet";
var itemArray = [{"id":1,"category":"dog","info":{"name":"doggie duna","photoUrls":["todo"],"tags":[{"id":0,"name":"tag1"}]},"status":"available"},{"id":2,"category":"dog","info":{"name":"doggie juna","photoUrls":["todo"],"tags":[{"id":0,"name":"tag1"}]},"status":"available"},{"id":3,"category":"dog","info":{"name":"doggie muna","photoUrls":["todo"],"tags":[{"id":0,"name":"tag1"}]},"status":"available"},{"id":4,"category":"cat","info":{"name":"cattie muna","photoUrls":["todo"],"tags":[{"id":0,"name":"tag1"}]},"status":"available"},{"id":5,"category":"cat","info":{"name":"cattie luna","photoUrls":["todo"],"tags":[{"id":0,"name":"tag1"}]},"status":"available"},{"id":6,"category":"cat","info":{"name":"cattie tuna","photoUrls":["todo"],"tags":[{"id":0,"name":"tag1"}]},"status":"available"}]

for (var i = itemArray.length - 1; i >= 0; i--) {
		var params = {
		    TableName:tableName,
		    Item : itemArray[i]	
		};
		console.log("Adding a new item...");
		docClient.put(params, function(err, data) {
		    if (err) {
		        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		    } else {
		        console.log("Added item:", JSON.stringify(data, null, 2));
		    }
		});
}
```

### Scan All Data 

```
var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName: "Pet"
};

console.log("Scanning Pets table.");
docClient.scan(params, onScan);

function onScan(err, data) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // print all the pets
        console.log("Scan succeeded.");
        data.Items.forEach(function(pet) {
           console.log(
            JSON.stringify(pet)
            );
       });
    }
}
```

## DynamoDB Cloud
Now that the code executes file locally. remove the `endpoint: "http://localhost:8000"` from each of the code snippet and execute it again. This will create the tables in DynamoDB Cloud.
`Make sure your account has the right access to create the tables!!`
Now, login to the console and go to DynamoDB and browse your own Pet table.

## READ MORE
https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/WorkingWithDynamo.html

## Next Steps
Lets now integrate the PET table in DynamoDB with Lambda function. See you in part 3
