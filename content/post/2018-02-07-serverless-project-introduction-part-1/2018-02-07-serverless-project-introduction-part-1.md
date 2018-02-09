---
title: "AWS Serverless Project Introduction Part 1"
date: 2018-02-07T13:13:22-05:00
draft: false
include_toc: true
---
<!--more-->
## Objective
We will create a Pet Store application using AWS serverless services, namely AWS DynamoDB , AWS Lambda , AWS API Gateway and AWS S3.
We will use nodejs for our AWS Lambda programming needs. We will initially create the Pet table , load data and integrate the `Find By Pet ID` API.
Then we can expand to integrating the others. 

## The Plan

* (Part 2)Using the Pet Store data model , create the DynamoDB table
* (Part 3)Create Lambda functions and integrate with Dynamo DB Pet table.
* (Part 4)Using the Pet Store YAML file , create the API Gateway and mock test the API
* (Part 5)Integrate the API Gateway and the Lambda Functions
* Understand how the above components work together

## Tools
* Swagger Editor (https://editor.swagger.io//#/
* Sublime text or any js editor. (https://www.sublimetext.com/)
* NodeJS (https://nodejs.org/en/)
* [Local installation of DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
* AWS Console

## Architecture
![](/supporting_files/2018-02-07-serverless-project-introduction-part-1/serverless-arch.png)

## Pet Store Swagger YAML

Complete YAML can be found [here](here)

Sample REST API 
```
'/pet/{petId}':
    get:
      tags:
        - pet
      summary: Find pet by ID
      description: Returns a single pet
      operationId: getPetById
      produces:
        - application/xml
        - application/json
      parameters:
        - name: petId
          in: path
          description: ID of pet to return
          required: true
          type: integer
      responses:
        '200':
          description: successful operation
          schema:
            $ref: '#/definitions/Pet'
        '400':
          description: Invalid ID supplied
        '404':
          description: Pet not found
      security:
        - api_key: []
```

## Pet Store Pet Table Data Model

The Pet table has 4 columns ID , Category , Info and Status
The Info Column would store a JSON with the details
```
definitions:
  Tag:
    type: object
    properties:
      id:
        type: integer
      name:
        type: string
  Pet:
    type: object
    required:
      - info
    properties:
      id:
        type: integer
      category:
        type: string
      info:
        $ref: '#/definitions/Info'
      status:
        type: string
        description: pet status in the store
        enum:
          - available
          - pending
          - sold
  Info:
    type: object
    properties:
      name:
        type: string
      photoUrls:
        type: array
        items:
          type: string
      tags:
        type: array
        items:
          $ref: '#/definitions/Tag'
```


