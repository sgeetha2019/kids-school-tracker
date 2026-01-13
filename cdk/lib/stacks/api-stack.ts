import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, "ItemsHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: "lambda/items-handler/index.ts",
      handler: "proxyHandler",
    });

    const api = new apigw.RestApi(this, "SchoolTrackerApi", {
      restApiName: "kids-school-tracker-api",
    });

    const items = api.root.addResource("items");
    items.addMethod("GET", new apigw.LambdaIntegration(handler));
    items.addMethod("POST", new apigw.LambdaIntegration(handler));

    const item = items.addResource("{id}");
    item.addMethod("GET", new apigw.LambdaIntegration(handler));
    item.addMethod("PUT", new apigw.LambdaIntegration(handler));
    item.addMethod("DELETE", new apigw.LambdaIntegration(handler));
  }
}
