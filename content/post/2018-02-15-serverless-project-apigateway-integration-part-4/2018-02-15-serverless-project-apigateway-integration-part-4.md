---
title: "AWS Serverless Project APIGateway Integration Part 4"
date: 2018-02-15T03:13:22-05:00
draft: false
include_toc: true
---
<!-- more -->

Lets get started with the API Gateway integraton. We will import a Swagger API definition and integrate one of out API , GET /pet/{petId}. We have enabled LAMBDA_PROXY integration method type for our API . Read more about the magic [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html). This will enable lambda to get a handle to our http request and all its details, coming from the API Gateway.

## Change the Lambda code 
Change the lambda code for the function `dynamo_query_pet_by_id` to read path prameter {petId}. We are going to add this exra bit of code in the lambda to derive the ID from the path.

Please review and understand the complete code [dynamo_query_pet_by_id.js](/supporting_files/2018-02-15-serverless-project-apigateway-integration-part-4/dynamo_query_pet_by_id.js). Replace your exising lambda function with this one. 

```

if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.petId !== undefined && 
            event.pathParameters.petId !== null && 
            event.pathParameters.petId !== "") {
            console.log("Received petId: " + event.pathParameters.petId);
            //reading pet id from path parameter, convert to int, assign to id
            id = parseInt(event.pathParameters.petId);  
    }
}
```

## Import the Swagger definition file for the API Gateway
```

$ aws apigateway import-rest-api --body "file://apigateway_swagger.json"

```
This will create the list of API's and each API will have a unique id.
The above command will output `rest-api-id` make not of it , we will use it further. Ignore the warnings.

## After Import go to APIs >Swagger Petstore >Resources 
The API Gateway console should show you the following.
![](/supporting_files/2018-02-15-serverless-project-apigateway-integration-part-4/APIGateway.png)


## Integration with Lambda Function using CLI

### #1 Find the API ID of `GET:/pet/{petId}` to be integrated

`$ aws apigateway get-resources --rest-api-id "kk5sum9398"` <-- use your parent rest api id

### #2 Create a role , namely - apigAwsProxyRole

This new role `apigAwsProxyRole` will enable the api gateway to invoke any lambda function.
Review the files and download

* [trustpolicy_apigateway.json](/supporting_files/2018-02-15-serverless-project-apigateway-integration-part-4/trustpolicy_apigateway.json)
* [apigateway_permission.json](/supporting_files/2018-02-15-serverless-project-apigateway-integration-part-4/apigateway_permission.json)

```
Execute the below commands in order , using above files
$ aws iam create-role 
	--role-name apigAwsProxyRole 
	--assume-role-policy-document file://trustpolicy_apigateway.json
$ aws iam put-role-policy 
	--role-name apigAwsProxyRole 
	--policy-name permission-invoke-lambda-serverless 
	--policy-document file://apigateway_permission.json

```

### #3 Integrate API with Lambda using `put-integration` CLI

```

$ aws apigateway put-integration \
	--rest-api-id "kk5sum9398" \ <-- your rest id 
	--resource-id "7pr6pj" \ <-- /pet/{petId}
	--http-method GET \ <-- depends on the rest api
	--type AWS_PROXY \
	--integration-http-method POST \ <-- show always be post
	--uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:374525349870:function:dynamo_query_pet_by_id/invocations \
	--credentials "arn:aws:iam::889825379870:role/apigAwsProxyRole" <-- arm of the role , check in console

```

### #4 Test API
`$ aws apigateway test-invoke-method --rest-api-id "kk5sum9398" --resource-id "7pr6pj" --http-method GET --path-with-query-string "/pet/1"`

You should see a response with status 200 and a big log of the lambda execution.

### #5 Check the Logs in CloudWatch
Go to CloudWatch > Logs > /aws/lambda/dynamo_query_pet_by_id and browse the logs

This completes the initial part of the aws serverless journey. We took multiple shortcuts , we also did not stage the url for a production use.We did not use any authentication.Lets look at some of those in the next post.

## References
* https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-http.html
* https://docs.aws.amazon.com/apigateway/latest/developerguide/integrating-api-with-aws-services-lambda.html
* https://docs.aws.amazon.com/cli/latest/reference/apigateway/index.html#cli-aws-apigateway
* https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
* https://docs.aws.amazon.com/lambda/latest/dg/with-on-demand-https-example-configure-event-source.html
* https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html