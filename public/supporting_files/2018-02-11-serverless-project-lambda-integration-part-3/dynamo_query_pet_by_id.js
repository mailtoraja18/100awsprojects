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