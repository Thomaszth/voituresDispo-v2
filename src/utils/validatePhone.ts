import { isValidPhoneNumber } from 'libphonenumber-js';
import { findCountryByCode } from '../data/countries';

export function validatePhoneNumber(phone: string, countryCode: string): boolean {
  if (!phone.trim()) return false;

  const country = findCountryByCode(countryCode);
  if (!country) return false;

  let fullNumber = phone.trim();
  if (!fullNumber.startsWith('+')) {
    fullNumber = country.callingCode + fullNumber;
  }

  if (countryCode === 'BJ') {
    const cleaned = fullNumber.replace(/\D/g, '');
    if (!/^22991\d{7}$/.test(cleaned) && !/^229019\d{7}$/.test(cleaned)) {
      return false;
    }
    return true;
  }

  return isValidPhoneNumber(fullNumber, countryCode as any);
}
