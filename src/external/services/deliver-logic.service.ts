import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DeliverLogicService {
  constructor(private http: HttpService) {}
  async getAllOrdersDriver(skippyEmail: string): Promise<any> {
    return await firstValueFrom(
      this.http.get(`https://www.skippy.cc/api2/drivers/${skippyEmail}/orders`),
    );
  }

  async updateOrderStatus(
    skippyEmail: string,
    orderId: number,
    status: string,
  ): Promise<any> {
    return await firstValueFrom(
      this.http.put(
        `https://www.skippy.cc/api2/drivers/${skippyEmail}/orders/${orderId}/status`,
        {
          status,
          is_pip: true,
          placement_method: 'Driver PiP',
        },
      ),
    );
  }

  async getAnOrder(skippyEmail: string, orderId: number): Promise<any> {
    return await firstValueFrom(
      this.http.get(
        `https://www.skippy.cc/api2/drivers/${skippyEmail}/orders/${orderId}`,
      ),
    );
  }

  async getDriverInfo(skippyEmail: string): Promise<any> {
    return await firstValueFrom(
      this.http.get(`https://www.skippy.cc/api2/users/${skippyEmail}/profile`),
    );
  }
}
