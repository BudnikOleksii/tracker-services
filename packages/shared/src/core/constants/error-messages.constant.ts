export const ERROR_MESSAGES = {
  unauthorized: 'Unauthorized',
  forbidden: 'Forbidden',
  notFound: 'Resource not found',
  badRequest: 'Bad request',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
