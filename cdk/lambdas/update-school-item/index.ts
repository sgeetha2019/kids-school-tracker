import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { json } from "../../utils/helpers";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

const ALLOWED_FIELDS = ["status", "date", "notes"] as const;

export const handler = async (event: any) => {
  try {
    const claims = event.requestContext?.authorizer?.claims;
    const sub = claims?.sub;
    if (!sub) return json(401, { message: "Unauthorized" });

    const body = event.body ? JSON.parse(event.body) : {};

    const userId = `USER#${sub}`;
    const kidId = event.pathParameters?.id;

    // Build UpdateExpression dynamically
    const names: Record<string, string> = {};
    const values: Record<string, any> = {};
    const sets: string[] = [];

    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        names[`#${field}`] = field;
        values[`:${field}`] = body[field];
        sets.push(`#${field} = :${field}`);
      }
    }

    names["#updatedAt"] = "updatedAt";
    values[":updatedAt"] = new Date().toISOString();
    sets.push("#updatedAt = :updatedAt");

    const result = await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId, kidId },
        UpdateExpression: "SET " + sets.join(", "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConditionExpression:
          "attribute_exists(userId) AND attribute_exists(kidId)",
        ReturnValues: "ALL_NEW",
      })
    );

    return json(200, result.Attributes);
  } catch (err: any) {
    if (err?.name === "ConditionalCheckFailedException") {
      return json(404, { message: "Not found" });
    }
    console.error(err);
    return json(500, {
      message: "Server error",
      error: err?.message ?? "Unknown error",
    });
  }
};
