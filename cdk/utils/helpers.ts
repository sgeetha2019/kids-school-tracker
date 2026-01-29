export const json = (event: any, statusCode: number, body: any) => {
  const origin = event.headers?.origin || event.headers?.Origin;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  };
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
};

export function getSub(event: any): string | undefined {
  const claims = event?.requestContext?.authorizer?.claims;
  return claims?.sub;
}
