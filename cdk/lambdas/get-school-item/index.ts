import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME!;
const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
export const handler = async (event: any) => {
  const claims = event.requestContext?.authorizer?.claims;
  const sub = claims?.sub;

  if (!sub) {
    return json(401, { message: "Unauthorized" });
  }

  const userId = `USER#${sub}`;
  const id = event.pathParameters?.id;

  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId, kidId: id },
    })
  );
  if (!result.Item) return json(404, { message: "Not found" });

  return json(200, result.Item);
};
