import { defineBackend } from '@aws-amplify/backend';
import { postsApiFunction } from './functions/posts-api/resource';
import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const backend = defineBackend({
  postsApiFunction,
});

// Custom CDK stack for REST API
const apiStack = backend.createStack('RestApiStack');

// CloudFormation dynamic references
const userPoolArn = ssm.StringParameter.valueForStringParameter(
  apiStack,
  '/app/common/cognito/userPoolArn'
);
const postsTableArn = ssm.StringParameter.valueForStringParameter(
  apiStack,
  '/app/common/dynamodb/postsTableArn'
);
const postsTableName = ssm.StringParameter.valueForStringParameter(
  apiStack,
  '/app/common/dynamodb/postsTableName'
);

// Import User Pool for authorizer
const userPool = cognito.UserPool.fromUserPoolArn(apiStack, 'ImportedUserPool', userPoolArn);

// Lambda function reference (cast to concrete Function for addEnvironment)
const lambdaFn = backend.postsApiFunction.resources.lambda as lambda.Function;

// Grant DynamoDB read-only access
lambdaFn.addToRolePolicy(
  new iam.PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:Query'],
    resources: [postsTableArn, `${postsTableArn}/index/*`],
  })
);

// Set DynamoDB table name as env var
lambdaFn.addEnvironment('POSTS_TABLE_NAME', postsTableName);

// Create REST API
const api = new apigw.RestApi(apiStack, 'UserRestApi', {
  restApiName: 'user-posts-api',
  defaultCorsPreflightOptions: {
    allowOrigins: apigw.Cors.ALL_ORIGINS,
    allowMethods: apigw.Cors.ALL_METHODS,
    allowHeaders: ['Authorization', 'Content-Type'],
  },
  deployOptions: {
    stageName: 'prod',
  },
});

// Cognito authorizer
const authorizer = new apigw.CognitoUserPoolsAuthorizer(apiStack, 'CognitoAuthorizer', {
  cognitoUserPools: [userPool],
  authorizerName: 'UserCognitoAuthorizer',
  identitySource: 'method.request.header.Authorization',
});

const lambdaIntegration = new apigw.LambdaIntegration(lambdaFn);

// Routes
const postsResource = api.root.addResource('posts');
postsResource.addMethod('GET', lambdaIntegration, {
  authorizer,
  authorizationType: apigw.AuthorizationType.COGNITO,
});

const postResource = postsResource.addResource('{postId}');
postResource.addMethod('GET', lambdaIntegration, {
  authorizer,
  authorizationType: apigw.AuthorizationType.COGNITO,
});

// Output API URL
new cdk.CfnOutput(apiStack, 'UserApiUrl', {
  value: api.url,
  exportName: `UserApiUrl-${cdk.Stack.of(apiStack).stackName}`,
});

// Add output (auth values from env vars set in amplify.yml)
const userPoolId = process.env['USER_POOL_ID'] ?? '';
const userPoolClientId = process.env['USER_POOL_CLIENT_ID'] ?? '';

backend.addOutput({
  custom: {
    userPoolId,
    userPoolClientId,
  },
});
