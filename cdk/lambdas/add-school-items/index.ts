import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "node:crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event: any) => {
  try {
    // Auth: read user id from Cognito claims
    const claims = event.requestContext?.authorizer?.claims;
    const sub = claims?.sub;
    if (!sub) return json(401, { message: "Unauthorized" });

    const body = event.body ? JSON.parse(event.body) : {};
    if (!body) return json(400, { message: "Missing body" });

    const userId = `USER-${sub}`;
    const unique = crypto.randomUUID().slice(0, 8);
    const kid = (body.kidName ?? "NA").toString().trim();
    const kidId = `${kid}-${unique}`;

    const now = new Date().toISOString();
    const item = {
      userId,
      kidId,

      type: (body.type ?? "").toString(),
      kidName: kid,
      status: (body.status ?? "").toString(),
      dueDate: (body.dueDate ?? "").toString(),
      title: (body.title ?? "").toString(),
      notes: (body.notes ?? "").toString(),

      createdAt: now,
      updatedAt: now,
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return json(201, item);
  } catch (err: any) {
    console.error(err);
    return json(500, {
      message: "Server error",
      error: err?.message ?? "Unknown error",
    });
  }
};
