import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { OrderService } from '../order/order.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class PaymentService {
  private readonly ZARINPAL_REQUEST_URL =
    process.env.NODE_ENV === 'production'
      ? 'https://payment.zarinpal.com/pg/v4/payment/request.json'
      : 'https://sandbox.zarinpal.com/pg/v4/payment/request.json';
  private readonly ZARINPAL_VERIFY_URL =
    process.env.NODE_ENV === 'production'
      ? 'https://payment.zarinpal.com/pg/v4/payment/verify.json'
      : 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json';
  private readonly ZARINPAL_START_PAY_URL =
    process.env.NODE_ENV === 'production'
      ? 'https://payment.zarinpal.com/pg/StartPay/'
      : 'https://sandbox.zarinpal.com/pg/StartPay/';

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    private orderService: OrderService,
    private httpService: HttpService,
  ) {}

  async requestPayment(orderId: string, userId: string) {
    const order = await this.orderService.findOne(orderId, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('این سفارش قابل پرداخت نیست');
    }

    const payment = this.paymentRepo.create({
      orderId,
      amount: order.finalPrice,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepo.save(payment);

    const description = `پرداخت سفارش #${order.id.substring(0, 8)} - فروشگاه ساگارت`;
    const callbackUrl = `${process.env.BASE_URL}/api/payments/verify`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.ZARINPAL_REQUEST_URL, {
          merchant_id: process.env.ZARINPAL_MERCHANT_ID,
          amount: order.finalPrice,
          callback_url: callbackUrl,
          description,
          metadata: {
            order_id: order.id,
            mobile: order.address?.phone || '',
          },
        }),
      );

      const data = response.data;

      if (data.data.code === 100) {
        payment.authority = data.data.authority;
        await this.paymentRepo.save(payment);

        return {
          paymentId: payment.id,
          authority: data.data.authority,
          redirectUrl: `${this.ZARINPAL_START_PAY_URL}${data.data.authority}`,
        };
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.responseData = data;
        await this.paymentRepo.save(payment);
        throw new BadRequestException(`خطا در اتصال به درگاه پرداخت: ${data.data.message}`);
      }
    } catch (error: unknown) {
      let errorMessage = 'خطا در اتصال به درگاه پرداخت';
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      payment.status = PaymentStatus.FAILED;
      payment.responseData = { error: errorMessage };
      await this.paymentRepo.save(payment);
      
      throw new BadRequestException(errorMessage);
    }
  }

  async verifyPayment(authority: string, status: string) {
    if (status !== 'OK') {
      throw new BadRequestException('پرداخت توسط کاربر لغو شد یا ناموفق بود');
    }

    const payment = await this.paymentRepo.findOne({
      where: { authority },
      relations: {order: true},
    });
    if (!payment) {
      throw new NotFoundException('پرداخت یافت نشد');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('این پرداخت قبلاً تأیید شده است');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.ZARINPAL_VERIFY_URL, {
          merchant_id: process.env.ZARINPAL_MERCHANT_ID,
          amount: payment.amount,
          authority,
        }),
      );

      const data = response.data;

      if (data.data.code === 100) {
        payment.status = PaymentStatus.SUCCESS;
        payment.refId = data.data.ref_id;
        payment.cardPan = data.data.card_pan;
        payment.responseData = data.data;
        await this.paymentRepo.save(payment);

        // await this.orderService.findOne(payment.orderId, payment.order.userId);
        await this.orderService.updateStatus(payment.orderId, {
          status: OrderStatus.PAID,
        });

        return {
          success: true,
          refId: data.data.ref_id,
          message: 'پرداخت با موفقیت انجام شد',
        };
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.responseData = data.data;
        await this.paymentRepo.save(payment);

        throw new BadRequestException(`پرداخت ناموفق: ${data.data.message}`);
      }
    } catch (error: unknown) {
      let errorMessage = 'خطا در تأیید پرداخت';
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      payment.status = PaymentStatus.FAILED;
      payment.responseData = { error: errorMessage };
      await this.paymentRepo.save(payment);
      
      throw new BadRequestException(errorMessage);
    }
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: {order: true},
    });
    if (!payment) throw new NotFoundException('پرداخت یافت نشد');
    return payment;
  }
}