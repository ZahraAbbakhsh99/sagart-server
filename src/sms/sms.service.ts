import { Injectable, Inject } from '@nestjs/common';
import { SmsProvider } from './interfaces/sms-provider.interface';

@Injectable()
export class SmsService {
  constructor(
    @Inject('SmsProvider')
    private provider: SmsProvider,
  ) {}

  async sendOtp(phone: string, code: string): Promise<boolean> {
    const message = `کد تایید شما: ${code}`;
    return this.provider.send(phone, message);
  }
}