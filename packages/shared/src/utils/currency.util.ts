import { currencyCodeEnum } from '@tracker/database';

export type CurrencyCode = (typeof currencyCodeEnum.enumValues)[number];

export const isValidCurrencyCode = (value: string): value is CurrencyCode => {
  return currencyCodeEnum.enumValues.includes(value as CurrencyCode);
};

export const validateCurrencyCode = (value: string): CurrencyCode => {
  if (!isValidCurrencyCode(value)) {
    throw new Error('Invalid currency code');
  }

  return value;
};
