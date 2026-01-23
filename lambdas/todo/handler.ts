import { Handler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME as string;

export const addTodo: Handler = async (event, context) => {
    try {
      const { title, description } = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
      const command = new PutItemCommand({
        TableName: tableName,
        Item: {
          id: { S: uuidv4() },
          createdAt: { N: new Date().getTime().toString() },
          title: { S: title || '' },
          description: { S: description || '' }
        }
      });

      const result = await dynamoDB.send(command);

      console.log('PutItem succeeded:', JSON.stringify(result, null, 2));
      console.log('Table name:', tableName);
      console.log('Item written:', { id: { S: uuidv4() }, createdAt: { N: new Date().getTime().toString() }, title: { S: title || '' }, description: { S: description || '' } });

      return result;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error adding item to DynamoDB table');
    }
};