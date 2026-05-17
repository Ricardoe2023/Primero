import { Module } from '@nestjs/common'
import { HaircutHistoryController } from './haircut-history.controller'
import { HaircutHistoryService } from './haircut-history.service'

@Module({
  controllers: [HaircutHistoryController],
  providers: [HaircutHistoryService],
})
export class HaircutHistoryModule {}
