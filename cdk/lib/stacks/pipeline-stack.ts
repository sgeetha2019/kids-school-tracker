import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as pipelines from "aws-cdk-lib/pipelines";
import { SchoolTrackerStage } from "./school-tracker-stage";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repo = "sgeetha2019/kids-school-tracker";
    const branch = "main";
    const connectionArn =
      "arn:aws:codeconnections:eu-west-2:194442925705:connection/3b5577ad-46be-4b34-bd5a-979898228146";

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      pipelineName: "kids-school-tracker-pipeline",

      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.connection(repo, branch, {
          connectionArn,
        }),
        env: {
          GITHUB_CONNECTION_ARN: connectionArn,
        },
        commands: [
          // UI build steps
          "cd school-tracker-ui",
          "npm ci",
          "npm run build",
          "cd ..",

          // CDK synth steps
          "cd cdk",
          "npm ci",
          "npx cdk synth",
        ],
        primaryOutputDirectory: "cdk/cdk.out",
      }),
    });

    pipeline.addStage(
      new SchoolTrackerStage(this, "Dev", {
        env: {
          account: process.env.CDK_DEFAULT_ACCOUNT,
          region: process.env.CDK_DEFAULT_REGION,
        },
      }),
    );
  }
}
