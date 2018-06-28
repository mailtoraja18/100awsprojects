---
title: "API Gateway using Swagger and SAM"
date: 2018-05-21T03:13:22-05:00
draft: false
include_toc: true
---
<!-- more -->

## Overview
This example combines AWS SAM and Swagger Notation.Review the 2 files given below and understand different aspects.Here are some things about this example.

* When deployed , the swagger file here serves to create the API in the API Gateway.
* The template file maps the api gateway API's to the node js methods.
	* [petstore_v2.yaml](/supporting_files/2018-05-21-swagger-aws-sam/petstore_v2.yaml)
	* [template_v2.yaml](/supporting_files/2018-05-21-swagger-aws-sam/template_v2.yaml)

## petstore_v2.yaml
Swagger file to create the API's in the API Gateway.

The x-amazon-apigateway-integration helps point to the IAM credetials that will be used for integrating the API with the AWS Lambda function code. We are using the `aws_proxy` type integration in our example.

Replace `374525342871` with your ARN in the petstore_v1.yaml
```
  x-amazon-apigateway-integration:
        credentials: arn:aws:iam::374525342871:role/apigAwsProxyRole
        responses:
          default:
            statusCode: 200
        uri:
          Fn::Sub: "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${GetPetFunction.Arn}/invocations"
        passthroughBehavior: when_no_match
        httpMethod: POST
        type: aws_proxy
```

## template_v2.yaml
The below yaml snippet helps to setup the CORS and include the the swagger file in the template.yaml
```
 Cors: "'http://localhost:4200'"
      DefinitionBody:
          'Fn::Transform':
            Name: 'AWS::Include'
            # Replace <bucket> with your bucket name
            Parameters:
              Location: "s3://xdr56yhn-aws-sam/petstore_v2.yaml"
```


## Commands
Use the below informaton to package and run the application.

* create a new bucket like `xdr56yhn-aws-sam` in your account.
* Copy the petstore_v2.yaml into the xdr56yhn-aws-sam s3 bucket.
* `sam package --template-file template_v2.yaml --s3-bucket xdr56yhn-aws-sam --output-template-file packaged_v2.yaml`
* `sam deploy --template-file ./packaged_v2.yaml --stack-name PetStack --capabilities CAPABILITY_IAM`