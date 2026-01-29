import { Stack, StackProps, CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class AuthStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, "SchoolTrackerUserPool", {
      userPoolName: "kids-school-tracker-user-pool",
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInAliases: { email: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.userPool.addDomain("SchoolTrackerDomain", {
      cognitoDomain: {
        domainPrefix: "kids-school-event-tracker-" + this.account,
      },
    });

    this.userPoolClient = this.userPool.addClient(
      "SchoolTrackerUserPoolClient",
      {
        userPoolClientName: "kids-school-tracker-user-pool-client",
        generateSecret: false,

        authFlows: {
          userPassword: true,
        },
        oAuth: {
          flows: { authorizationCodeGrant: true },
          scopes: [cognito.OAuthScope.OPENID],
          callbackUrls: [
            "http://localhost:5173/auth/callback",
            "https://dlafrpbhnmjpp.cloudfront.net/auth/callback",
          ],
          logoutUrls: [
            "http://localhost:5173/",
            "https://dlafrpbhnmjpp.cloudfront.net/",
          ],
        },
      },
    );

    new CfnOutput(this, "UserPoolId", { value: this.userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }
}
