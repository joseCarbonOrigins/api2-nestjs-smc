import { Module } from '@nestjs/common';
import { OthersService } from './services/others.service';
import { OthersController } from './controllers/others.controller';

@Module({
  controllers: [OthersController],
  providers: [OthersService],
})
export class OthersModule {}
