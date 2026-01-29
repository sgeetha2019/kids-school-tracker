import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "node:crypto";
import { getSub, json } from "../../utils/helpers";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: any) => {
  try {
    const sub = getSub(event);
    if (!sub) return json(event, 401, { message: "Unauthorized" });

    const body = event.body ? JSON.parse(event.body) : {};
    if (!body) return json(event, 400, { message: "Missing body" });

    const userId = `USER#${sub}`;
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
      }),
    );

    return json(event, 201, item);
  } catch (err: any) {
    console.error(err);
    return json(event, 500, {
      message: "Server error",
      error: err?.message ?? "Unknown error",
    });
  }
};
