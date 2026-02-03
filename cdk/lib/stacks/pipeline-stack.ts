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
          // Use existing 'n' if present; otherwise install
          "bash -lc 'set -e; command -v n >/dev/null 2>&1 || npm install --location=global n'",
          // Switch to Node 20 (idempotent if already on 20)
          "n 20 || true",
          "node -v",
          // Install global CDK CLI (match your aws-cdk-lib range); guard if already present
          "bash -lc 'set -e; if ! command -v cdk >/dev/null 2>&1; then npm install --location=global aws-cdk@2.232.2 --no-fund --no-audit; fi'",
          "cdk --version",
        ],
        commands: [
          // Build React app
          "npm ci --prefix school-tracker-ui",
          "npm run build --prefix school-tracker-ui",

          // CDK: absolute path + single shell + diagnostics
          "bash -lc 'set -euo pipefail; " +
            'echo ROOT=$CODEBUILD_SRC_DIR; ls -la "$CODEBUILD_SRC_DIR"; ' +
            'cd "$CODEBUILD_SRC_DIR"/cdk; pwd; ls -la; ' +
            "npm ci; " +
            // If /cdk/cdk.json uses ts-node (recommended):
            "cdk synth" +
            // If your cdk.json targets compiled JS, use: npm run build; cdk synth
            "'",
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
