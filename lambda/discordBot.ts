import { Handler } from "aws-lambda";
import { verifyKey } from "discord-interactions";

export const handler: Handler = async (event: any, context: any) => {
  const CLIENT_PUBLIC_KEY = process.env.DISCORD_TOKEN!;

  const signature = event.headers["x-signature-ed25519"];
  const timestamp = event.headers["x-signature-timestamp"];
  const strBody = event.body;

  const isValid = verifyKey(strBody, signature, timestamp, CLIENT_PUBLIC_KEY);

  if (!isValid) {
    context.res = {
      status: 401,
      Headers: {},
      body: "",
    };
    return;
  }
};
