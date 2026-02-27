import { CURRENCY_CODES, type CurrencyCode } from '@tracker/database';

export const isValidCurrencyCode = (value: string): value is CurrencyCode => {
  return CURRENCY_CODES.includes(value as CurrencyCode);
};

export const validateCurrencyCode = (value: string): CurrencyCode => {
  if (!isValidCurrencyCode(value)) {
    throw new Error('Invalid currency code');
  }

  return value;
};
