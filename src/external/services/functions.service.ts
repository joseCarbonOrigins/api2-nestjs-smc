import { Injectable } from '@nestjs/common';
import moment from 'moment';

@Injectable()
export class FunctionsService {
  calculateDrivingTime(timeA: Date, timeB: Date): number {
    const difference = moment(timeB).diff(moment(timeA), 'milliseconds');
    return difference;
  }
}
