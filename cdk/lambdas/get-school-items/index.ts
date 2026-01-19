import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const claims = event.requestContext?.authorizer?.claims;
  const sub = claims?.sub;

  if (!sub) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const userId = `USER#${sub}`;

  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items ?? []),
  };
};
