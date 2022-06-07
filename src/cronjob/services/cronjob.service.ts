import { Injectable } from '@nestjs/common';
// dtos
import { Cronjob } from '../dtos/cronjob.dto';

@Injectable()
export class CronjobService {
  async pushSkippysOrders(orders: Cronjob[]): Promise<any> {
    return { data: orders };
  }
}
