import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as pipelines from "aws-cdk-lib/pipelines";
import { SchoolTrackerStage } from "./school-tracker-stage";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repo = "sgeetha2019/kids-school-tracker";
    const branch = "main";
    const connectionArn =
      "arn:aws:codeconnections:eu-west-2:194442925705:connection/c827f9dc-bdeb-4210-a2e2-6d97446eb7da";

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      pipelineName: "kids-school-tracker-pipeline",
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
        },
      },
      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.connection(repo, branch, {
          connectionArn,
        }),
        installCommands: [
          "npm install -g n",
          "n 20",
          "node -v",
          // global CDK CLI aligned with your aws-cdk-lib
          "npm install -g aws-cdk@2.232.2",
          "cdk --version",
        ],
        commands: [
          // React UI
          "npm ci --prefix school-tracker-ui",
          "npm run build --prefix school-tracker-ui",

          // CDK: install and synth (single shell)
          "bash -lc 'set -euo pipefail; cd cdk; pwd; ls -la; npm ci; cdk synth'",
          // If your cdk.json targets compiled JS:
          // "bash -lc 'set -euo pipefail; cd cdk; npm ci; npm run build; cdk synth'"
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
