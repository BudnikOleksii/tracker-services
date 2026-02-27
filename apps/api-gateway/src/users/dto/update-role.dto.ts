import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { UserRole } from '@tracker/database';
import { USER_ROLES } from '@tracker/database';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'User role',
    enum: USER_ROLES,
    enumName: 'UserRole',
    example: 'USER',
  })
  @IsIn(USER_ROLES)
  role!: UserRole;
}
