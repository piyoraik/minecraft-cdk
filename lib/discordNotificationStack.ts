import {
  Stack,
  StackProps,
  aws_lambda_nodejs as lambda,
  Duration,
} from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from "constructs";

export class MinecraftModManegeLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3バケット定義
    const s3Bucket = 'fcoding'

    // Lambda関数作成
    const modDownloadURLPostFunction = new lambda.NodejsFunction(
      this,
      "modDownloadURLPost",
      {
        entry: "lambda/modDownloadURLPost.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_16_X,
        timeout: Duration.seconds(60),
        environment: {
          AZ: "Asia/Tokyo",
          DISCORD_URL:
            "https://discord.com/api/webhooks/1031768121985478826/NFKHeyXjkpeG4HFNYf7gIDaMo8gG4YRpyaqvnmKtUCqmfgw4q1rBfD5DMtKhGvBhjcS8",
          S3_BUCKET: s3Bucket
        },
      }
    );

    // 既存S3バケット取得
    const fcodingBucket = Bucket.fromBucketArn(
      this,
      s3Bucket,
      "arn:aws:s3:::fcoding"
    );

    // S3Notification設定
    fcodingBucket.addEventNotification(
      EventType.OBJECT_CREATED_PUT,
      new LambdaDestination(modDownloadURLPostFunction)
    );
  }
}
