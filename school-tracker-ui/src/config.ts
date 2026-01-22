export const config = {
  region: import.meta.env.VITE_AWS_REGION,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};
