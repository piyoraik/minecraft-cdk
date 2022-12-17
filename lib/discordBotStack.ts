import {
  Stack,
  StackProps,
  aws_lambda_nodejs as lambda,
  aws_lambda,
  Duration,
  CfnOutput,
} from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class MinecraftDiscordBotStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Lambda関数作成
    const discordBotFunction = new lambda.NodejsFunction(
      this,
      "modDownloadURLPost",
      {
        entry: "lambda/discordBot.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_16_X,
        timeout: Duration.seconds(60), 
        environment: {
          CLIENT_PUBLIC_KEY: process.env.HOGE!,
        },
      }
    );

    const functionURL = discordBotFunction.addFunctionUrl({
      authType: aws_lambda.FunctionUrlAuthType.NONE,
    });
    new CfnOutput(this, "FunctionURL", {
      value: functionURL.url,
    });
  }
}
