import { Inject, Injectable } from '@nestjs/common';
import {
  DRIZZLE,
  type DrizzleDB,
  knownDevices,
  eq,
  and,
  type KnownDevice,
} from '@tracker/database';

@Injectable()
export class KnownDevicesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findDevice(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<KnownDevice | undefined> {
    const [device] = await this.db
      .select()
      .from(knownDevices)
      .where(
        and(
          eq(knownDevices.userId, userId),
          eq(knownDevices.ipAddress, ipAddress),
          eq(knownDevices.userAgent, userAgent),
        ),
      );

    return device;
  }

  async upsertDevice(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<KnownDevice> {
    const [device] = await this.db
      .insert(knownDevices)
      .values({ userId, ipAddress, userAgent })
      .onConflictDoUpdate({
        target: [
          knownDevices.userId,
          knownDevices.ipAddress,
          knownDevices.userAgent,
        ],
        set: { lastSeenAt: new Date() },
      })
      .returning();

    return device as KnownDevice;
  }

  async insertDeviceIfNew(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<boolean> {
    const rows = await this.db
      .insert(knownDevices)
      .values({ userId, ipAddress, userAgent })
      .onConflictDoNothing({
        target: [
          knownDevices.userId,
          knownDevices.ipAddress,
          knownDevices.userAgent,
        ],
      })
      .returning({ id: knownDevices.id });

    return rows.length > 0;
  }
}
