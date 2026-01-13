import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, "ItemsHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: "Kids School Tracker API is live",
              path: event.path,
              method: event.httpMethod
            })
          };
        };
      `),
    });

    const api = new apigw.RestApi(this, "SchoolTrackerApi", {
      restApiName: "kids-school-tracker-api",
    });

    const items = api.root.addResource("items");
    items.addMethod("GET", new apigw.LambdaIntegration(handler));
  }
}
