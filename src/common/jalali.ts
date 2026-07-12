import moment from 'moment-jalaali';

export class JalaliDateUtil {
  private static persianMonths: string[] = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  static toJalali(
    date: Date | string,
    format: 'jYYYY/jMM/jDD' | 'jYYYY-jMM-jDD' | 'jDD jMMMM jYYYY' | 'jDD MMM jYYYY' | 'full' | 'jYYYY/jMM' | 'jYYYY-jMM'  = 'jYYYY/jMM/jDD'
  ): string {
    const m = moment(typeof date === 'string' ? new Date(date) : date);
    if (!m.isValid()) return 'تاریخ نامعتبر';

    switch (format) {
      case 'jYYYY/jMM/jDD':
        return m.format('jYYYY/jMM/jDD');
      case 'jYYYY-jMM-jDD':
        return m.format('jYYYY-jMM-jDD');
      case 'jDD jMMMM jYYYY': {
        const day = m.jDate();
        const month = JalaliDateUtil.persianMonths[m.jMonth()];
        const year = m.jYear();
        return `${day} ${month} ${year}`;
      }
      case 'jDD MMM jYYYY': {
        const day = m.jDate();
        const month = JalaliDateUtil.persianMonths[m.jMonth()];
        const year = m.jYear();
        return `${day} ${month} ${year}`;
      }
      case 'full':
        return `${m.format('jYYYY/jMM/jDD')} ${m.format('HH:mm')}`;
      case 'jYYYY/jMM':
        return m.format('jYYYY/jMM');
      case 'jYYYY-jMM':
        return m.format('jYYYY-jMM');
        default:
        return m.format('jYYYY/jMM/jDD');
    }
  }

  static toJalaliDateTime(date: Date | string): string {
    const m = moment(typeof date === 'string' ? new Date(date) : date);
    return m.format('jYYYY/jMM/jDD HH:mm');
  }

  static toTime(date: Date | string): string {
    const m = moment(typeof date === 'string' ? new Date(date) : date);
    return m.format('HH:mm');
  }

  static getTodayGregorian(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  static getStartOfMonthGregorian(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  static getEndOfMonthGregorian(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  static getStartOfDayGregorian(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static getEndOfDayGregorian(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // src/common/jalali.ts

  static convertJalaliToGregorian(jalaliDate: string): Date | null {
    if (!jalaliDate) return null;
    // پشتیبانی از فرمت‌های YYYY/MM/DD و YYYY-MM-DD
    const cleaned = jalaliDate.replace(/-/g, '/');
    const parts = cleaned.split('/');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    const gregorian = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD').toDate();
    return isNaN(gregorian.getTime()) ? null : gregorian;
  }
}