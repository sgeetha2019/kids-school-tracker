import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.IUserPool;
  table: dynamodb.ITable;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, "SchoolTrackerApi", {
      restApiName: "kids-school-tracker-api",
      defaultCorsPreflightOptions: {
        allowOrigins: [
          "http://localhost:5173",
          "https://dlafrpbhnmjpp.cloudfront.net",
        ],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
      },
    });
    const schoolItems = api.root.addResource("school-items");
    const schoolItem = schoolItems.addResource("{id}");

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "SchoolTrackerAuthorizer",
      {
        cognitoUserPools: [props!.userPool],
      },
    );

    const kidsSchoolTrackerTable = props!.table;

    const getSchoolItems = new NodejsFunction(this, "GetSchoolItemsHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambdas/get-school-items/index.ts",
      environment: {
        TABLE_NAME: kidsSchoolTrackerTable.tableName,
      },
    });
    kidsSchoolTrackerTable.grantReadData(getSchoolItems);
    schoolItems.addMethod("GET", new apigw.LambdaIntegration(getSchoolItems), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    const addSchoolItems = new NodejsFunction(this, "AddSchoolItemsHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambdas/add-school-items/index.ts",
      environment: {
        TABLE_NAME: kidsSchoolTrackerTable.tableName,
      },
    });
    kidsSchoolTrackerTable.grantWriteData(addSchoolItems);
    schoolItems.addMethod("POST", new apigw.LambdaIntegration(addSchoolItems), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    const getSchoolItem = new NodejsFunction(this, "GetSchoolItemHandler", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: "lambdas/get-school-item/index.ts",
      environment: {
        TABLE_NAME: kidsSchoolTrackerTable.tableName,
      },
    });
    kidsSchoolTrackerTable.grantReadData(getSchoolItem);
    schoolItem.addMethod("GET", new apigw.LambdaIntegration(getSchoolItem), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    const updateSchoolItem = new NodejsFunction(
      this,
      "UpdateSchoolItemHandler",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: "lambdas/update-school-item/index.ts",
        environment: {
          TABLE_NAME: kidsSchoolTrackerTable.tableName,
        },
      },
    );
    kidsSchoolTrackerTable.grantWriteData(updateSchoolItem);
    schoolItem.addMethod("PUT", new apigw.LambdaIntegration(updateSchoolItem), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    const deleteSchoolItem = new NodejsFunction(
      this,
      "DeleteSchoolItemHandler",
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: "lambdas/delete-school-item/index.ts",
        environment: {
          TABLE_NAME: kidsSchoolTrackerTable.tableName,
        },
      },
    );
    kidsSchoolTrackerTable.grantWriteData(deleteSchoolItem);
    schoolItem.addMethod(
      "DELETE",
      new apigw.LambdaIntegration(deleteSchoolItem),
      {
        authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO,
      },
    );
  }
}
