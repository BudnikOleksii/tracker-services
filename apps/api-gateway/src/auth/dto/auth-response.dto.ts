import { ApiProperty } from '@nestjs/swagger';
import type { AuthResponse, AuthUser } from '@tracker/shared';

import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto implements Omit<AuthResponse, 'refreshToken'> {
  @ApiProperty({
    description: 'JWT access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user!: AuthUser;
}
