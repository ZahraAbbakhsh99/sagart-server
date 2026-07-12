import { Injectable } from '@nestjs/common';
import { SmsProvider } from '../interfaces/sms-provider.interface';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<boolean> {
    console.log(`[MOCK SMS] به شماره ${phone} ارسال شد:`);
    console.log(`پیام: ${message}`);
    return true;
  }
}