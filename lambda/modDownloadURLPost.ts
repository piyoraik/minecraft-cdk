import axios from "axios";
import { Handler } from "aws-cdk-lib/aws-lambda";
import { Context, S3Event } from "aws-lambda";

const DISCORD_URL = process.env.DISCORD_URL || "";
const S3_BUCKET = process.env.S3_BUCKET || "";
const S3_DOMAIN = `https://${S3_BUCKET}.s3.ap-northeast-1.amazonaws.com`;

export const handler: Handler = async (event: S3Event, context: Context) => {
  const fileName = event.Records[0].s3.object.key;

  const discordPostData = {
    username: "Mod導入",
    content: `【以下のmodがサーバーに導入されました】
    mod名: ${fileName}
    ダウンロードURL: ${S3_DOMAIN}/${fileName}
    `,
  };

  await axios.post(DISCORD_URL, discordPostData);
};
