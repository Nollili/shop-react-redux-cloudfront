// Filename: hello-lambda-stack.ts
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class HelloLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, "lambda-function", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.main",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    });

    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions.",
    });

    const helloFromLambdaIntegration = new apigateway.LambdaIntegration(
      lambdaFunction,
      {
        proxy: false,

        requestTemplates: {
          "application/json": JSON.stringify({
            message: "$input.params('message')",
          }),
        },

        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `
            #set($inputRoot = $input.path('$'))
            {
              "message": "$inputRoot.message"
            }
          `,
            },
          },
          {
            // Optional: catch Lambda errors
            selectionPattern: "5\\d{2}",
            statusCode: "500",
            responseTemplates: {
              "application/json": `{ "message": "Internal server error" }`,
            },
          },
        ],
      }
    );

    // Create a resource /hello and GET request under it
    const helloResource = api.root.addResource("hello");
    helloResource.addCorsPreflight({
      allowOrigins: ["https://your-frontend-url.com"],
      allowMethods: ["GET"],
    });
    // On this resource attach a GET method which pass reuest to our Lambda function
    helloResource.addMethod("GET", helloFromLambdaIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            "application/json": apigateway.Model.EMPTY_MODEL,
          },
        },
        {
          statusCode: "500",
          responseModels: {
            "application/json": apigateway.Model.EMPTY_MODEL,
          },
        },
      ],
    });
  }
}
