import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.IUserPool;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, "ItemsHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambda/items-handler/index.ts",
      handler: "proxyHandler",
    });

    const api = new apigw.RestApi(this, "SchoolTrackerApi", {
      restApiName: "kids-school-tracker-api",
    });

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "SchoolTrackerAuthorizer",
      {
        cognitoUserPools: [props!.userPool],
      }
    );

    const items = api.root.addResource("items");
    items.addMethod("GET", new apigw.LambdaIntegration(handler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    items.addMethod("POST", new apigw.LambdaIntegration(handler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    const item = items.addResource("{id}");
    item.addMethod("GET", new apigw.LambdaIntegration(handler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    item.addMethod("PUT", new apigw.LambdaIntegration(handler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
    item.addMethod("DELETE", new apigw.LambdaIntegration(handler), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });
  }
}
