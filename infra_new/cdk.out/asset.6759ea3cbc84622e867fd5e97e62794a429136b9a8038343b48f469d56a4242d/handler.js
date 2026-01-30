"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTodo = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
const dynamoDB = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME;
const addTodo = async (event, context) => {
    try {
        const command = new client_dynamodb_1.PutItemCommand({
            TableName: tableName,
            Item: {
                id: { S: (0, uuid_1.v4)() },
                createdAt: { N: new Date().getTime().toFixed() },
                body: { S: event.todoBody }
            }
        });
        const result = await dynamoDB.send(command);
        console.log('PutItem succeeded:', JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error('Error:', error);
        throw new Error('Error adding item to DynamoDB table');
    }
};
exports.addTodo = addTodo;
