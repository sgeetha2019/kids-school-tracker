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
        installCommands: ["n 20", "node -v"],
        commands: [
          // Build React app
          "npm ci --prefix school-tracker-ui",
          "npm run build --prefix school-tracker-ui",

          // Build & synth CDK
          "cd cdk && npm ci",
          "cd cdk && npx cdk synth",
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
