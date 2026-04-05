import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.POSTS_TABLE_NAME ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization,Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

const response = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, resource, pathParameters } = event;

  try {
    // GET /posts - List all posts (newest first)
    if (httpMethod === 'GET' && resource === '/posts') {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'createdAt-index',
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: { ':pk': 'POST' },
        ScanIndexForward: false,
      }));
      return response(200, result.Items ?? []);
    }

    // GET /posts/{postId} - Get single post
    if (httpMethod === 'GET' && resource === '/posts/{postId}') {
      const postId = pathParameters?.postId;
      if (!postId) return response(400, { message: 'Missing postId' });

      const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { postId },
      }));
      if (!result.Item) return response(404, { message: 'Post not found' });
      return response(200, result.Item);
    }

    return response(404, { message: 'Not found' });
  } catch (err) {
    console.error('Handler error:', err);
    return response(500, { message: 'Internal server error' });
  }
};
