import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getSub, json } from "../../utils/helpers";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME!;
export const handler = async (event: any) => {
  const sub = getSub(event);

  if (!sub) {
    return json(event, 401, { message: "Unauthorized" });
  }

  const userId = `USER#${sub}`;
  const id = event.pathParameters?.id;

  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId, kidId: id },
    }),
  );
  if (!result.Item) return json(event, 404, { message: "Not found" });

  return json(event, 200, result.Item);
};
