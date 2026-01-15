#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/stacks/api-stack";
import { AuthStack } from "../lib/stacks/auth-stack";

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const authStack = new AuthStack(app, "AuthStack", { env });

new ApiStack(app, "ApiStack", {
  env,
  userPool: authStack.userPool,
});
