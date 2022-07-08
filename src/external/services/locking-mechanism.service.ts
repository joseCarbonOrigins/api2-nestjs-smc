import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LockingMechanismService {
  constructor(private http: HttpService) {}

  async sendLockingPayload(
    skippyEmail: string,
    skippyStatus: string,
    password: number,
    customerName: string,
  ) {
    const obj = {
      skippy: skippyEmail.split('@')[0],
      skippy_status: skippyStatus,
      password,
      customer: customerName,
    };

    await firstValueFrom(
      this.http.post('http://54.172.111.235:3000/skippy/locking', obj),
    );
  }
}
