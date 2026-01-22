import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { json } from "../../utils/helpers";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  try {
    const claims = event.requestContext?.authorizer?.claims;
    const sub = claims?.sub;

    if (!sub) {
      return json(401, { message: "Unauthorized" });
    }

    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": `USER#${sub}`,
        },
      })
    );

    return json(200, { items: result.Items ?? [] });
  } catch (e: any) {
    console.error(e);
    return json(500, {
      message: "Server error",
      error: e?.message ?? "Unknown",
    });
  }
};
