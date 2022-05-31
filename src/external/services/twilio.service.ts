import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioService {
  constructor(private configService: ConfigService) {}

  makeACall(to: string, message: string) {
    const client = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
    client.calls.create(
      {
        twiml: `<Response><Say> ${message} </Say></Response>`,
        to: to,
        from: '+17633633711',
      },
      function (err, call) {
        if (err) {
          console.log(err);
        } else {
          console.log(call);
        }
      },
    );
  }

  sendSMS(to: string, message: string) {
    const client = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
    client.messages
      .create({
        body: `${message}`,
        from: '+17633633711',
        to: to,
      })
      .then((message) => console.log(message.sid));
  }
}
