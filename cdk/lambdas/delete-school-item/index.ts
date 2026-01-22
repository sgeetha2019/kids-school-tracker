import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { json } from "../../utils/helpers";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  const claims = event.requestContext?.authorizer?.claims;
  const sub = claims?.sub;

  if (!sub) {
    return json(401, { message: "Unauthorized" });
  }

  const userId = `USER#${sub}`;
  const id = event.pathParameters?.id;

  const result = await ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { userId, kidId: id },
    })
  );
  return json(200, { message: "Deleted", id });
};
