import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LockingMechanismService {
  constructor(
    private http: HttpService,
    private configService: ConfigService,
  ) {}

  async sendLockingPayload(
    skippyIpAddress: string,
    skippyStatus: string,
    password: number,
    customerName: string,
  ) {
    const obj = {
      skippy_ip_address: skippyIpAddress,
      skippy_status: skippyStatus,
      password,
      customer: customerName,
    };

    await firstValueFrom(
      this.http.post(
        `${this.configService.get('WS_SKIPPY_URL')}/skippy/locking`,
        obj,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  }
}
