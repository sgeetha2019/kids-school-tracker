import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const proxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Kids School Tracker API is live",
      path: event.path,
      method: event.httpMethod,
    }),
  };
};
