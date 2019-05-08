import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { PerformanceEntity } from './performance.entity'


@Module({
  imports: [TypeOrmModule.forFeature([PerformanceEntity])],
  controllers: [PerformanceController],
  providers: [PerformanceService]
})
export class PerformanceModule { }
