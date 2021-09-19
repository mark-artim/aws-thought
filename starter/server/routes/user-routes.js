const express = require('express');
const router = express.Router();

const AWS = require("aws-sdk");
const { LexModelBuildingService } = require('aws-sdk');
const awsConfig = {
    region: "us-east-2",
    endpoint: "http://localhost:8000",

};
AWS.config.update(awsConfig);
const dynamodb = new AWS.DynamoDB.DocumentClient();
const table = "Thoughts";

//GET ALL THOUGHTS
router.get('/users', (req, res) => {
    const params = {
        TableName: table
    };
    //scan all the items in the table
    dynamodb.scan(params, (err, data) => {
        if(err) {
            res.status(500).json(err);
        } else {
            res.json(data.Items)
        }
    })
})

//GET ALL THOUHGT FOR SPECIFIC USER
router.get('/users/:username', (req, res) => {
    console.log(`Querying for thoughts from ${req.params.username}.`)

    const params = {
        TableName: table,
        KeyConditionExpression: "#un = :user",
        ExpressionAttributeNames: {
            "#un": "username",
            "#ca": "createdAt",
            "#th": "thought"
        },
        ExpressionAttributeValues: {
            ":user": req.params.username
        },
        ProjectionExpression: "#th, #ca",
        ScanIndexForward: false
    }

    dynamodb.query(params, (err, data) => {
        if(err) {
            console.error('Unable to query. Error:', JSON.stringify(err, null, 2));
            res.status(500).json(err);
        } else {
            console.log('Query succeeded.');
            res.json(data.Items)
        }
    })
});

//CREATE A NEW THOUGHT (POST/PUT) AT /api/users
router.post('/users', (req, res) => {
    const params = {
        TableName: table,
        Item: {
            "username": req.body.username,
            "createdAt": Date.now(),
            "thought": req.body.thought
        }
    };

    dynamodb.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(500).json(err); // an error occurred
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
            res.json({"Added": JSON.stringify(data, null, 2)});
        }
    });
});  // ends the route for router.post('/users')

module.exports = router