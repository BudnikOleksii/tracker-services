import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: unknown } | undefined>();

    const user = request?.user;

    if (!user) {
      return null;
    }

    return user;
  },
);
