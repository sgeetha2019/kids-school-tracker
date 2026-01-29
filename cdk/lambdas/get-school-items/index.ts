import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getSub, json } from "../../utils/helpers";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  try {
    const sub = getSub(event);

    if (!sub) {
      return json(event, 401, { message: "Unauthorized" });
    }

    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": `USER#${sub}`,
        },
      }),
    );

    return json(event, 200, { items: result.Items ?? [] });
  } catch (e: any) {
    console.error(e);
    return json(event, 500, {
      message: "Server error",
      error: e?.message ?? "Unknown",
    });
  }
};
