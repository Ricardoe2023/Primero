import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { BarbershopsModule } from './barbershops/barbershops.module'
import { BookingsModule } from './bookings/bookings.module'
import { AuthGuard } from './common/guards/auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import configuration from './config/configuration'
import { PrismaModule } from './database/prisma.module'
import { HaircutHistoryModule } from './haircut-history/haircut-history.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60000, limit: 200 },
    ]),
    PrismaModule,
    AuthModule,
    BarbershopsModule,
    BookingsModule,
    HaircutHistoryModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
