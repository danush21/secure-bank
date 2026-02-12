/**
 * Email validation utilities for the application
 */

const COMMON_TLD_TYPOS = [
  '.con', '.comm', '.coom', '.ccom', '.cm', '.om', '.ocm',
  '.net', '.nett', '.neet', '.nte',
  '.org', '.orrg', '.orgg', '.ogr',
  '.edu', '.eddu', '.eduu', '.edu',
  '.gov', '.gouv', '.gob'
];

const VALID_TLDS = [
  '.com', '.net', '.org', '.edu', '.gov', '.mil', '.info', '.biz',
  '.co', '.io', '.ai', '.app', '.dev', '.tech', '.online', '.store'
];

export function validateEmail(email: string): { isValid: boolean; error?: string; warning?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const hasUppercase = /[A-Z]/.test(trimmedEmail);
  const warning = hasUppercase
    ? 'Note: Your email will be stored in lowercase format'
    : undefined;

  const normalizedEmail = trimmedEmail.toLowerCase();

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(normalizedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., user@example.com)',
      warning
    };
  }

  const tldMatch = normalizedEmail.match(/\.([a-z]{2,})$/);
  if (tldMatch) {
    const tld = '.' + tldMatch[1];
    if (COMMON_TLD_TYPOS.includes(tld)) {
      let suggestedTld = '.com';
      if (tld === '.con' || tld === '.comm' || tld === '.coom' || tld === '.ccom' || tld === '.cm') {
        suggestedTld = '.com';
      } else if (tld === '.ocm') {
        suggestedTld = '.com';
      } else if (tld === '.om') {
        suggestedTld = '.com';
      } else if (tld === '.orrg' || tld === '.orgg' || tld === '.ogr') {
        suggestedTld = '.org';
      } else if (tld === '.eddu' || tld === '.eduu') {
        suggestedTld = '.edu';
      } else if (tld === '.gouv' || tld === '.gob') {
        suggestedTld = '.gov';
      }

      return {
        isValid: false,
        error: `Did you mean "${normalizedEmail.replace(tld, suggestedTld)}"? "${tld}" is not a valid domain extension.`,
        warning
      };
    }

    if (tldMatch[1].length < 2) {
      return {
        isValid: false,
        error: 'Email domain must have a valid extension (e.g., .com, .org, .net)',
        warning
      };
    }
  }

  if (normalizedEmail.includes('..')) {
    return {
      isValid: false,
      error: 'Email address cannot contain consecutive dots',
      warning
    };
  }

  const [localPart] = normalizedEmail.split('@');
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email address cannot start or end with a dot before the @ symbol',
      warning
    };
  }

  const [, domain] = normalizedEmail.split('@');
  if (!domain || domain.length < 4) {
    return {
      isValid: false,
      error: 'Please enter a complete email address with a valid domain',
      warning
    };
  }

  return { isValid: true, warning };
}

export function validateEmailForForm(email: string): string | true {
  const result = validateEmail(email);
  if (!result.isValid) {
    return result.error || 'Invalid email address';
  }
  return true;
}

export function getEmailNormalizationWarning(email: string): string | undefined {
  return validateEmail(email).warning;
}

/**
 * Date of Birth Validation Configuration
 */
const MINIMUM_AGE = 18;
const MAXIMUM_AGE = 150;

export function validateDateOfBirth(dateString: string): { isValid: boolean; error?: string; age?: number } {
  if (!dateString || typeof dateString !== 'string') {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const trimmed = dateString.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Date of birth is required' };
  }

  const date = new Date(trimmed);

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date in YYYY-MM-DD format' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return {
      isValid: false,
      error: 'Date of birth cannot be in the future'
    };
  }

  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  if (age < MINIMUM_AGE) {
    return {
      isValid: false,
      error: `You must be at least ${MINIMUM_AGE} years old to create an account.`,
      age
    };
  }

  if (age > MAXIMUM_AGE) {
    return {
      isValid: false,
      error: `Please double-check your birth date. The system detected you as being ${age} years old.`,
      age
    };
  }

  return { isValid: true, age };
}

export function validateDateOfBirthForForm(dateString: string): string | true {
  const result = validateDateOfBirth(dateString);
  if (!result.isValid) {
    return result.error || 'Invalid date of birth';
  }
  return true;
}

export function getAgeFromDateOfBirth(dateString: string): number | null {
  const result = validateDateOfBirth(dateString);
  return result.age ?? null;
}

export function formatDateOfBirth(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Valid US State Codes (2-letter abbreviations)
 */
const VALID_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'AS', 'GU', 'MP', 'PR', 'UM', 'VI'
];

const STATE_CODE_MAP: { [key: string]: string } = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia', 'AS': 'American Samoa', 'GU': 'Guam', 'MP': 'Northern Mariana Islands',
  'PR': 'Puerto Rico', 'UM': 'U.S. Minor Outlying Islands', 'VI': 'Virgin Islands'
};

export function validateStateCode(stateCode: string): { isValid: boolean; error?: string; stateName?: string } {
  if (!stateCode || typeof stateCode !== 'string') {
    return { isValid: false, error: 'State code is required' };
  }

  const trimmed = stateCode.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'State code is required' };
  }

  const upperCode = trimmed.toUpperCase();

  if (upperCode.length !== 2) {
    return {
      isValid: false,
      error: 'State code must be exactly 2 characters (e.g., CA, NY, TX)'
    };
  }

  if (!/^[A-Z]{2}$/.test(upperCode)) {
    return {
      isValid: false,
      error: 'State code must contain only letters (e.g., CA, NY, TX)'
    };
  }

  if (!VALID_STATE_CODES.includes(upperCode)) {
    return {
      isValid: false,
      error: `"${upperCode}" is not a valid US state code. Please use a valid 2-letter state abbreviation (e.g., CA, NY, TX).`
    };
  }

  const stateName = STATE_CODE_MAP[upperCode];

  return {
    isValid: true,
    stateName
  };
}

export function validateStateCodeForForm(stateCode: string): string | true {
  const result = validateStateCode(stateCode);
  if (!result.isValid) {
    return result.error || 'Invalid state code';
  }
  return true;
}

export function getStateNameFromCode(stateCode: string): string | null {
  const upperCode = stateCode?.toUpperCase() || '';
  return STATE_CODE_MAP[upperCode] || null;
}

export function getValidStateCodes(): string[] {
  return [...VALID_STATE_CODES];
}

/**
 * Phone Number Validation Configuration
 */
const US_PHONE_PATTERN = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
const INTERNATIONAL_PHONE_PATTERN = /^(\+)?(?:[0-9]\s?){6,14}[0-9]$/;

const VALID_COUNTRY_CODES = [
  '+1',   // USA, Canada
  '+44',  // UK
  '+33',  // France
  '+49',  // Germany
  '+39',  // Italy
  '+34',  // Spain
  '+31',  // Netherlands
  '+32',  // Belgium
  '+41',  // Switzerland
  '+43',  // Austria
  '+45',  // Denmark
  '+46',  // Sweden
  '+47',  // Norway
  '+48',  // Poland
  '+61',  // Australia
  '+81',  // Japan
  '+86',  // China
  '+91',  // India
  '+55',  // Brazil
  '+52',  // Mexico
  '+36',  // Hungary
  '+353', // Ireland
  '+358', // Finland
  '+60',  // Malaysia
  '+65',  // Singapore
  '+66',  // Thailand
  '+84',  // Vietnam
  '+62',  // Indonesia
];

export function validatePhoneNumber(phoneNumber: string): { isValid: boolean; error?: string; formatted?: string; isInternational?: boolean } {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const trimmed = phoneNumber.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      error: 'Phone number must have at least 10 digits'
    };
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      error: 'Phone number is too long. Maximum 15 digits allowed.'
    };
  }

  const isInternational = trimmed.startsWith('+');

  if (isInternational) {
    const countryCodeMatch = trimmed.match(/^\+(\d{1,3})/);
    if (!countryCodeMatch) {
      return {
        isValid: false,
        error: 'International numbers must start with + followed by country code'
      };
    }

    const countryCode = '+' + countryCodeMatch[1];
    if (!VALID_COUNTRY_CODES.includes(countryCode)) {
      return {
        isValid: false,
        error: `"${countryCode}" is not a recognized country code. Please check your international phone number.`
      };
    }

    if (!INTERNATIONAL_PHONE_PATTERN.test(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid international phone number format. Use format like +1-234-567-8900 or +44 20 7946 0958'
      };
    }

    const formatted = formatInternationalPhoneNumber(trimmed);
    return {
      isValid: true,
      formatted,
      isInternational: true
    };
  } else {
    if (!US_PHONE_PATTERN.test(trimmed)) {
      return {
        isValid: false,
        error: 'Invalid US phone number format. Use format like (123) 456-7890 or 123-456-7890'
      };
    }

    const formatted = formatUSPhoneNumber(trimmed);
    return {
      isValid: true,
      formatted,
      isInternational: false
    };
  }
}

function formatUSPhoneNumber(phoneNumber: string): string {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  const digits = digitsOnly.length === 11 && digitsOnly.startsWith('1')
    ? digitsOnly.substring(1)
    : digitsOnly;

  if (digits.length !== 10) {
    return phoneNumber;
  }

  return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
}

function formatInternationalPhoneNumber(phoneNumber: string): string {
  const match = phoneNumber.match(/^(\+\d{1,3})(.*)$/);
  if (!match) {
    return phoneNumber;
  }

  const countryCode = match[1];
  const numberPart = match[2].replace(/\D/g, '');

  if (numberPart.length >= 10) {
    return `${countryCode} ${numberPart.substring(0, 3)} ${numberPart.substring(3, 6)} ${numberPart.substring(6)}`;
  } else if (numberPart.length >= 7) {
    return `${countryCode} ${numberPart.substring(0, 3)} ${numberPart.substring(3)}`;
  }

  return `${countryCode} ${numberPart}`;
}

export function validatePhoneNumberForForm(phoneNumber: string): string | true {
  const result = validatePhoneNumber(phoneNumber);
  if (!result.isValid) {
    return result.error || 'Invalid phone number';
  }
  return true;
}

export function getFormattedPhoneNumber(phoneNumber: string): string | null {
  const result = validatePhoneNumber(phoneNumber);
  return result.formatted || null;
}

/**
 * Funding amount validation utilities
 */

const MIN_FUNDING_AMOUNT = 0.01;
const MAX_FUNDING_AMOUNT = 10000;

export function validateFundingAmount(value: string | number): { 
  isValid: boolean; 
  amount?: number; 
  normalized?: string;
  error?: string 
} {
  const stringValue = typeof value === 'number' ? value.toString() : value;

  if (!stringValue || stringValue.trim() === '') {
    return { 
      isValid: false, 
      error: 'Amount is required' 
    };
  }

  const trimmed = stringValue.trim();

  if (!/^\d+\.?\d{0,2}$/.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Invalid amount format. Use format like 100 or 100.50' 
    };
  }

  const parts = trimmed.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] || '';

  if (integerPart.length > 1 && integerPart.startsWith('0')) {
    const cleanInteger = integerPart.replace(/^0+/, '') || '0';
    const suggestedAmount = decimalPart 
      ? `${cleanInteger}.${decimalPart}`
      : cleanInteger;
    return {
      isValid: false,
      error: `Amount cannot have leading zeros. Did you mean $${suggestedAmount}?`
    };
  }

  const amount = parseFloat(trimmed);

  if (amount === 0) {
    return { 
      isValid: false, 
      error: `Funding amount must be at least $${MIN_FUNDING_AMOUNT.toFixed(2)}` 
    };
  }

  if (amount < MIN_FUNDING_AMOUNT) {
    return { 
      isValid: false, 
      error: `Funding amount must be at least $${MIN_FUNDING_AMOUNT.toFixed(2)}` 
    };
  }

  if (amount > MAX_FUNDING_AMOUNT) {
    return { 
      isValid: false, 
      error: `Funding amount cannot exceed $${MAX_FUNDING_AMOUNT.toFixed(2)}` 
    };
  }

  if (isNaN(amount)) {
    return { 
      isValid: false, 
      error: 'Invalid amount' 
    };
  }

  return { 
    isValid: true, 
    amount,
    normalized: amount.toFixed(2)
  };
}

export function validateFundingAmountForForm(value: string): true | string {
  const result = validateFundingAmount(value);
  return result.isValid ? true : (result.error || 'Invalid amount');
}

/**
 * Credit card validation utilities
 */

interface CardInfo {
  cardType: string;
  displayName: string;
  isValid: boolean;
}

/**
 * Card type patterns
 */
const CARD_PATTERNS = {
  visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
  
  mastercard: /^(?:5[1-5][0-9]{14}|2(?:22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7(?:0[0-9]|1[0-9]|20))[0-9]{12})$/,
  
  amex: /^3[47][0-9]{13}$/,
  
  discover: /^(?:6011[0-9]{12}|65[0-9]{14}|64[4-9][0-9]{13}|622(?:12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[01][0-9]|92[0-5])[0-9]{10})$/,
  
  diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
  
  jcb: /^(?:2131|1800|35\d{3})\d{11,15}$/,
  
  unionpay: /^62[0-9]{14,17}$/,
  
  mir: /^220[0-4][0-9]{12}$/,
};


export function identifyCardType(cardNumber: string): CardInfo {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (CARD_PATTERNS.amex.test(cleaned)) {
    return { cardType: 'amex', displayName: 'American Express', isValid: true };
  }
  if (CARD_PATTERNS.diners.test(cleaned)) {
    return { cardType: 'diners', displayName: 'Diners Club', isValid: true };
  }
  if (CARD_PATTERNS.mir.test(cleaned)) {
    return { cardType: 'mir', displayName: 'Mir', isValid: true };
  }
  if (CARD_PATTERNS.mastercard.test(cleaned)) {
    return { cardType: 'mastercard', displayName: 'MasterCard', isValid: true };
  }
  if (CARD_PATTERNS.visa.test(cleaned)) {
    return { cardType: 'visa', displayName: 'Visa', isValid: true };
  }
  if (CARD_PATTERNS.discover.test(cleaned)) {
    return { cardType: 'discover', displayName: 'Discover', isValid: true };
  }
  if (CARD_PATTERNS.jcb.test(cleaned)) {
    return { cardType: 'jcb', displayName: 'JCB', isValid: true };
  }
  if (CARD_PATTERNS.unionpay.test(cleaned)) {
    return { cardType: 'unionpay', displayName: 'UnionPay', isValid: true };
  }
  
  return { cardType: 'unknown', displayName: 'Unknown', isValid: false };
}

export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

export function validateCardNumber(cardNumber: string): {
  isValid: boolean;
  cardType?: string;
  error?: string;
} {
  if (!cardNumber || cardNumber.trim() === '') {
    return {
      isValid: false,
      error: 'Card number is required',
    };
  }

  const cleaned = cardNumber.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) {
    return {
      isValid: false,
      error: 'Card number must be 13-19 digits',
    };
  }

  const cardInfo = identifyCardType(cleaned);

  if (!cardInfo.isValid) {
    return {
      isValid: false,
      error: 'Invalid card number format. Accepted: Visa, MasterCard, American Express, Discover, Diners Club, JCB, UnionPay, Mir',
    };
  }

  // Validate using Luhn algorithm
  if (!luhnCheck(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid card number (failed validation check)',
    };
  }

  return {
    isValid: true,
    cardType: cardInfo.displayName,
  };
}

export function validateCardNumberForForm(value: string): true | string {
  const result = validateCardNumber(value);
  return result.isValid ? true : (result.error || 'Invalid card number');
}

/**
 * Bank routing number validation utilities
 */

export function validateRoutingNumber(routingNumber: string): {
  isValid: boolean;
  error?: string;
} {
  if (!routingNumber || routingNumber.trim() === '') {
    return {
      isValid: false,
      error: 'Routing number is required',
    };
  }

  const cleaned = routingNumber.replace(/[\s\-]/g, '');

  if (cleaned.length !== 9) {
    return {
      isValid: false,
      error: 'Routing number must be exactly 9 digits',
    };
  }

  if (!/^\d{9}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Routing number must contain only digits',
    };
  }

  // Validate using checksum algorithm (Fed routing number checksum)
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const digit = parseInt(cleaned[i], 10);
    sum += digit * weights[i];
  }

  if (sum % 10 !== 0) {
    return {
      isValid: false,
      error: 'Invalid routing number (failed validation check)',
    };
  }

  return {
    isValid: true,
  };
}

export function validateRoutingNumberForForm(value: string): true | string {
  const result = validateRoutingNumber(value);
  return result.isValid ? true : (result.error || 'Invalid routing number');
}

/**
 * Password validation utilities with strength requirements
 */

const COMMON_WEAK_PASSWORDS = [
  'password', '12345678', 'qwerty', 'abc123', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'sunshine', 'princess', '1234567', 'solo', 'starwars', 'shadow', 'michael',
  'superman', 'batman', 'iloveyou', 'trustno1', 'admin', 'root', 'pass', 'test',
  '123456', '12345', '654321', 'asdfgh', 'zxcvbn', 'qazwsx', 'password123', '111111',
];

interface PasswordStrengthResult {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
  feedback: string[];
  error?: string;
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add numbers');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add special characters');
  }

  let uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.75) {
    score += 10;
  } else {
    feedback.push('Use more diverse characters');
  }

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'fair';
  else if (score < 80) strength = 'good';
  else strength = 'strong';

  return {
    isValid: score >= 50,
    strength,
    score,
    feedback,
  };
}

export function validatePassword(password: string): {
  isValid: boolean;
  strength?: string;
  error?: string;
  feedback?: string[];
} {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      error: 'Password is required',
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Password must not exceed 128 characters',
    };
  }

  const lowerPassword = password.toLowerCase();
  if (COMMON_WEAK_PASSWORDS.includes(lowerPassword)) {
    return {
      isValid: false,
      error: 'Password is too common. Choose a more unique password',
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password);

  const typeCount = [hasUppercase, hasLowercase, hasDigit, hasSpecial].filter(Boolean).length;

  if (typeCount < 3) {
    return {
      isValid: false,
      error: 'Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters',
    };
  }

  const sequencePatterns = [
    'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz',
    '123', '234', '345', '456', '567', '678', '789', '890',
    'qwerty', 'asdf', 'zxcv',
  ];

  const lowerCheck = password.toLowerCase();
  for (const pattern of sequencePatterns) {
    if (lowerCheck.includes(pattern)) {
      return {
        isValid: false,
        error: 'Password contains sequential characters. Avoid patterns like abc, 123, or qwerty',
      };
    }
  }

  if (/(.)\1{2,}/.test(password)) {
    return {
      isValid: false,
      error: 'Password cannot contain the same character more than twice in a row',
    };
  }

  const strengthResult = calculatePasswordStrength(password);

  return {
    isValid: strengthResult.isValid,
    strength: strengthResult.strength,
    feedback: strengthResult.feedback,
  };
}

export function validatePasswordForForm(password: string): true | string {
  const result = validatePassword(password);
  return result.isValid ? true : (result.error || 'Password does not meet requirements');
}