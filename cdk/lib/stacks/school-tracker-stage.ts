import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiStack } from "./api-stack";
import { AuthStack } from "./auth-stack";
import { DataStack } from "./data-stack";
import { WebAppStack } from "./web-app-stack";

export interface SchoolTrackerStageProps extends cdk.StageProps {}

export class SchoolTrackerStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: SchoolTrackerStageProps) {
    super(scope, id, props);

    const authStack = new AuthStack(this, "AuthStack", { env: props.env });
    const dataStack = new DataStack(this, "DataStack", { env: props.env });

    new ApiStack(this, "ApiStack", {
      env: props.env,
      userPool: authStack.userPool,
      table: dataStack.table,
    });

    new WebAppStack(this, "WebAppStack", { env: props.env });
  }
}
