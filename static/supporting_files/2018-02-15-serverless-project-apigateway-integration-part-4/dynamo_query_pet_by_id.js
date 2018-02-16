var AWS = require("aws-sdk");
var docClient = new AWS.DynamoDB.DocumentClient();
exports.dynamo_query_pet_by_id = (event, context, callback) => {
var id = 1; // we will change this later

if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.petId !== undefined && 
            event.pathParameters.petId !== null && 
            event.pathParameters.petId !== "") {
            console.log("Received petId: " + event.pathParameters.petId);
            id = parseInt(event.pathParameters.petId);
    }
}


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
           let response = {
                    "statusCode": 500,
                    "headers": {
                        "my_header": "my_value"
                    },
                    "body": JSON.stringify(err),
                    "isBase64Encoded": false
           };
          callback(response);
    }  else {
        console.log("Query succeeded." + JSON.stringify(data));
        if(parseInt(data.Count) > 0) {
            let response = {
                "statusCode": 200,
                "headers": {
                    "my_header": "my_value"
                },
                "body": JSON.stringify(data.Items),
                "isBase64Encoded": false
             };
            callback(null,response); //returning call using callback
        } else {
            let response = {
                    "statusCode": 200,
                    "headers": {
                        "my_header": "my_value"
                    },
                    "body": JSON.stringify([]),
                    "isBase64Encoded": false
            };
            callback(null,response); //returning call using callback   
        }
    }
});
};