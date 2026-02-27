import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  JwtAuthGuard,
  RolesGuard,
  Roles,
  CurrentUser,
  MESSAGE_PATTERNS,
} from '@tracker/shared';
import { USER_ROLES } from '@tracker/database';

import { SERVICES } from '../constants/services.constant';
import { sendWithTimeout } from '../utils/microservice.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject(SERVICES.USERS) private readonly usersClient: ClientProxy,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieves the authenticated user profile',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(
    @CurrentUser() user: { id: string },
  ): Promise<UserResponseDto> {
    return sendWithTimeout<UserResponseDto>(
      this.usersClient,
      { cmd: MESSAGE_PATTERNS.USERS.GET_USER },
      { userId: user.id },
    );
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the authenticated user profile',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return sendWithTimeout<UserResponseDto>(
      this.usersClient,
      { cmd: MESSAGE_PATTERNS.USERS.UPDATE_PROFILE },
      { userId: user.id, ...dto },
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(USER_ROLES[1], USER_ROLES[2])
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by ID (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return sendWithTimeout<UserResponseDto>(
      this.usersClient,
      { cmd: MESSAGE_PATTERNS.USERS.GET_USER_BY_ID },
      { id },
    );
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(USER_ROLES[2])
  @ApiOperation({
    summary: 'Update user role',
    description: 'Updates user role (Super Admin only)',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Super Admin access required',
  })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<UserResponseDto> {
    return sendWithTimeout<UserResponseDto>(
      this.usersClient,
      { cmd: MESSAGE_PATTERNS.USERS.UPDATE_USER_ROLE },
      { id, role: dto.role },
    );
  }
}
