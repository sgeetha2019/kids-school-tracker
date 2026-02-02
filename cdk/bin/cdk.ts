#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/stacks/pipeline-stack";

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new PipelineStack(app, "SchoolTrackerPipelineStack", { env });

// const authStack = new AuthStack(app, "AuthStack", { env });
// const dataStack = new DataStack(app, "DataStack", { env });

// new ApiStack(app, "ApiStack", {
//   env,
//   userPool: authStack.userPool,
//   table: dataStack.table,
// });

// new WebAppStack(app, "WebAppStack", { env });
