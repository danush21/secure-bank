import {
  validateFundingAmount,
  validateFundingAmountForForm,
  validateCardNumber,
  validateCardNumberForForm,
  validateDateOfBirth,
  validateDateOfBirthForForm,
  validateEmail,
  validateEmailForForm,
  getEmailNormalizationWarning,
  validatePhoneNumber,
  validatePhoneNumberForForm,
  validateRoutingNumber,
  validateRoutingNumberForForm,
  validateStateCode,
  validateStateCodeForForm,
  validatePassword,
  validatePasswordForForm,
} from '@/lib/validation'

describe('Validation Functions', () => {
  describe('validateFundingAmount', () => {
    it('should accept valid amounts', () => {
      expect(validateFundingAmount('100.00')).toEqual({
        isValid: true,
        amount: 100,
        normalized: '100.00'
      })
      expect(validateFundingAmount('0.01')).toEqual({
        isValid: true,
        amount: 0.01,
        normalized: '0.01'
      })
      expect(validateFundingAmount('50.5')).toEqual({
        isValid: true,
        amount: 50.5,
        normalized: '50.50'
      })
      expect(validateFundingAmount('10000.00')).toEqual({
        isValid: true,
        amount: 10000,
        normalized: '10000.00'
      })
    })

    it('should reject amounts with leading zeros', () => {
      expect(validateFundingAmount('00100.00')).toEqual({
        isValid: false,
        error: 'Amount cannot have leading zeros. Did you mean $100.00?',
      })
      expect(validateFundingAmount('0050.50')).toEqual({
        isValid: false,
        error: 'Amount cannot have leading zeros. Did you mean $50.50?',
      })
    })

    it('should reject zero amounts', () => {
      expect(validateFundingAmount('0.00')).toEqual({
        isValid: false,
        error: 'Funding amount must be at least $0.01',
      })
      expect(validateFundingAmount('0')).toEqual({
        isValid: false,
        error: 'Funding amount must be at least $0.01',
      })
    })

    it('should reject amounts below minimum', () => {
      expect(validateFundingAmount('0.001')).toEqual({
        isValid: false,
        error: 'Invalid amount format. Use format like 100 or 100.50',
      })
    })

    it('should reject amounts above maximum', () => {
      expect(validateFundingAmount('10000.01')).toEqual({
        isValid: false,
        error: 'Funding amount cannot exceed $10000.00',
      })
    })

    it('should reject invalid formats', () => {
      expect(validateFundingAmount('abc')).toEqual({
        isValid: false,
        error: 'Invalid amount format. Use format like 100 or 100.50',
      })
      expect(validateFundingAmount('100.999')).toEqual({
        isValid: false,
        error: 'Invalid amount format. Use format like 100 or 100.50',
      })
    })

    it('should reject amounts with leading zeros', () => {
      expect(validateFundingAmount('00100.00')).toEqual({
        isValid: false,
        error: 'Amount cannot have leading zeros. Did you mean $100.00?'
      })
    })
  })

  describe('validateFundingAmountForForm', () => {
    it('should return true for valid amounts', () => {
      expect(validateFundingAmountForForm('100.00')).toBe(true)
      expect(validateFundingAmountForForm('0.01')).toBe(true)
    })

    it('should return error message for invalid amounts', () => {
      expect(validateFundingAmountForForm('0.00')).toBe('Funding amount must be at least $0.01')
      expect(validateFundingAmountForForm('00100.00')).toBe('Amount cannot have leading zeros. Did you mean $100.00?')
    })
  })

  describe('validateCardNumber', () => {
    it('should accept valid Visa cards', () => {
      expect(validateCardNumber('4111111111111111')).toEqual({
        isValid: true,
        cardType: 'Visa',
      })
      expect(validateCardNumber('4012888888881881')).toEqual({
        isValid: true,
        cardType: 'Visa',
      })
    })

    it('should accept valid MasterCard cards', () => {
      expect(validateCardNumber('5555555555554444')).toEqual({
        isValid: true,
        cardType: 'MasterCard',
      })
      expect(validateCardNumber('2223003122003222')).toEqual({
        isValid: true,
        cardType: 'MasterCard',
      })
    })

    it('should accept valid American Express cards', () => {
      expect(validateCardNumber('378282246310005')).toEqual({
        isValid: true,
        cardType: 'American Express',
      })
    })

    it('should accept valid Discover cards', () => {
      expect(validateCardNumber('6011111111111117')).toEqual({
        isValid: true,
        cardType: 'Discover',
      })
    })

    it('should reject invalid card numbers', () => {
      expect(validateCardNumber('4111111111111112')).toEqual({
        isValid: false,
        error: 'Invalid card number (failed validation check)',
      })
      expect(validateCardNumber('1234567890123456')).toEqual({
        isValid: false,
        error: 'Invalid card number format. Accepted: Visa, MasterCard, American Express, Discover, Diners Club, JCB, UnionPay, Mir',
      })
    })

    it('should reject cards with wrong length', () => {
      expect(validateCardNumber('411111111111111')).toEqual({
        isValid: false,
        error: 'Invalid card number format. Accepted: Visa, MasterCard, American Express, Discover, Diners Club, JCB, UnionPay, Mir',
      })
      expect(validateCardNumber('411111111111111110')).toEqual({
        isValid: false,
        error: 'Invalid card number format. Accepted: Visa, MasterCard, American Express, Discover, Diners Club, JCB, UnionPay, Mir',
      })
    })
  })

  describe('validateCardNumberForForm', () => {
    it('should return true for valid cards', () => {
      expect(validateCardNumberForForm('4111111111111111')).toBe(true)
    })

    it('should return error message for invalid cards', () => {
      expect(validateCardNumberForForm('4111111111111112')).toBe('Invalid card number (failed validation check)')
    })
  })

  describe('validateDateOfBirth', () => {
    const mockToday = new Date('2024-06-15')

    beforeAll(() => {
      jest.useFakeTimers()
      jest.setSystemTime(mockToday)
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('should accept valid dates for users 18+', () => {
      expect(validateDateOfBirth('2000-06-15')).toEqual({
        isValid: true,
        age: 24,
      })
      expect(validateDateOfBirth('1990-01-01')).toEqual({
        isValid: true,
        age: 34,
      })
    })

    it('should reject future dates', () => {
      expect(validateDateOfBirth('2025-06-15')).toEqual({
        isValid: false,
        error: 'Date of birth cannot be in the future',
      })
    })

    it('should reject users under 18', () => {
      expect(validateDateOfBirth('2010-06-15')).toEqual({
        isValid: false,
        error: 'You must be at least 18 years old to create an account.',
        age: 14,
      })
    })

    it('should reject unreasonably old ages', () => {
      expect(validateDateOfBirth('1850-01-01')).toEqual({
        isValid: false,
        error: 'Please double-check your birth date. The system detected you as being 174 years old.',
        age: 174,
      })
    })
  })

  describe('validateDateOfBirthForForm', () => {
    it('should return true for valid dates', () => {
      expect(validateDateOfBirthForForm('1990-01-01')).toBe(true)
    })

    it('should return error message for invalid dates', () => {
      expect(validateDateOfBirthForForm('2025-01-01')).toBe('You must be at least 18 years old to create an account.')
    })
  })

  describe('validateEmail', () => {
    it('should accept valid email formats', () => {
      expect(validateEmail('user@example.com')).toEqual({
        isValid: true,
      })
      expect(validateEmail('test.email+tag@domain.co.uk')).toEqual({
        isValid: true,
      })
    })

    it('should detect common typos', () => {
      expect(validateEmail('user@example.con')).toEqual({
        isValid: false,
        error: 'Did you mean "user@example.com"? ".con" is not a valid domain extension.',
      })
      expect(validateEmail('test@domain.ocm')).toEqual({
        isValid: false,
        error: 'Did you mean "test@domain.com"? ".ocm" is not a valid domain extension.',
      })
    })

    it('should warn about uppercase', () => {
      expect(validateEmail('TEST@example.com')).toEqual({
        isValid: true,
        warning: 'Note: Your email will be stored in lowercase format',
      })
    })

    it('should reject invalid formats', () => {
      expect(validateEmail('test@')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., user@example.com)',
      })
      expect(validateEmail('@example.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address (e.g., user@example.com)',
        warning: undefined,
      })
    })
  })

  describe('validateEmailForForm', () => {
    it('should return true for valid emails', () => {
      expect(validateEmailForForm('user@example.com')).toBe(true)
    })

    it('should return error message for invalid emails', () => {
      expect(validateEmailForForm('test@')).toBe('Please enter a valid email address (e.g., user@example.com)')
    })
  })

  describe('getEmailNormalizationWarning', () => {
    it('should return warning for uppercase emails', () => {
      expect(getEmailNormalizationWarning('TEST@example.com')).toBe('Note: Your email will be stored in lowercase format')
    })

    it('should return null for lowercase emails', () => {
      expect(getEmailNormalizationWarning('test@example.com')).toBeUndefined()
    })
  })

  describe('validatePhoneNumber', () => {
    it('should accept valid US phone numbers', () => {
      expect(validatePhoneNumber('(123) 456-7890')).toEqual({
        isValid: true,
        formatted: '(123) 456-7890',
        isInternational: false,
      })
      expect(validatePhoneNumber('1234567890')).toEqual({
        isValid: true,
        formatted: '(123) 456-7890',
        isInternational: false,
      })
    })

    it('should accept valid international phone numbers', () => {
      expect(validatePhoneNumber('+1 234 567 8900')).toEqual({
        isValid: true,
        formatted: '+1 234 567 8900',
        isInternational: true,
      })
      expect(validatePhoneNumber('+1 541 754 3010')).toEqual({
        isValid: true,
        formatted: '+1 541 754 3010',
        isInternational: true,
      })
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123456789')).toEqual({
        isValid: false,
        error: 'Phone number must have at least 10 digits',
      })
      expect(validatePhoneNumber('+99-123-456-7890')).toEqual({
        isValid: false,
        error: '"+99" is not a recognized country code. Please check your international phone number.',
      })
    })
  })

  describe('validatePhoneNumberForForm', () => {
    it('should return true for valid phone numbers', () => {
      expect(validatePhoneNumberForForm('(123) 456-7890')).toBe(true)
    })

    it('should return error message for invalid phone numbers', () => {
      expect(validatePhoneNumberForForm('123456789')).toBe('Phone number must have at least 10 digits')
    })
  })

  describe('validateRoutingNumber', () => {
    it('should accept valid routing numbers', () => {
      expect(validateRoutingNumber('071000013')).toEqual({
        isValid: true,
      })
      expect(validateRoutingNumber('121000248')).toEqual({
        isValid: true,
      })
    })

    it('should reject invalid routing numbers', () => {
      expect(validateRoutingNumber('123456789')).toEqual({
        isValid: false,
        error: 'Invalid routing number (failed validation check)',
      })
      expect(validateRoutingNumber('07100001')).toEqual({
        isValid: false,
        error: 'Routing number must be exactly 9 digits',
      })
    })
  })

  describe('validateRoutingNumberForForm', () => {
    it('should return true for valid routing numbers', () => {
      expect(validateRoutingNumberForForm('071000013')).toBe(true)
    })

    it('should return error message for invalid routing numbers', () => {
      expect(validateRoutingNumberForForm('123456789')).toBe('Invalid routing number (failed validation check)')
    })
  })

  describe('validateStateCode', () => {
    it('should accept valid state codes', () => {
      expect(validateStateCode('CA')).toEqual({
        isValid: true,
        stateName: 'California',
      })
      expect(validateStateCode('NY')).toEqual({
        isValid: true,
        stateName: 'New York',
      })
      expect(validateStateCode('DC')).toEqual({
        isValid: true,
        stateName: 'District of Columbia',
      })
    })

    it('should reject invalid state codes', () => {
      expect(validateStateCode('XX')).toEqual({
        isValid: false,
        error: '"XX" is not a valid US state code. Please use a valid 2-letter state abbreviation (e.g., CA, NY, TX).',
      })
      expect(validateStateCode('ABC')).toEqual({
        isValid: false,
        error: 'State code must be exactly 2 characters (e.g., CA, NY, TX)',
      })
    })

    it('should handle case insensitivity', () => {
      expect(validateStateCode('ca')).toEqual({
        isValid: true,
        stateName: 'California',
      })
    })
  })

  describe('validateStateCodeForForm', () => {
    it('should return true for valid state codes', () => {
      expect(validateStateCodeForForm('CA')).toBe(true)
    })

    it('should return error message for invalid state codes', () => {
      expect(validateStateCodeForForm('XX')).toBe('"XX" is not a valid US state code. Please use a valid 2-letter state abbreviation (e.g., CA, NY, TX).')
    })
  })

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      expect(validatePassword('MySecure@Pass1')).toEqual({
        isValid: true,
        strength: 'good',
        feedback: [],
      })
      expect(validatePassword('Tr0p!cal#Sunset')).toEqual({
        isValid: true,
        strength: 'good',
        feedback: [],
      })
    })

    it('should reject weak passwords', () => {
      expect(validatePassword('password1')).toEqual({
        isValid: false,
        error: 'Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters',
      })
      expect(validatePassword('12345678a')).toEqual({
        isValid: false,
        error: 'Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters',
      })
      expect(validatePassword('Pass123abc')).toEqual({
        isValid: false,
        error: 'Password contains sequential characters. Avoid patterns like abc, 123, or qwerty',
      })
      expect(validatePassword('aaaa1111A')).toEqual({
        isValid: false,
        error: 'Password cannot contain the same character more than twice in a row',
      })
    })

    it('should reject passwords that are too short', () => {
      expect(validatePassword('Pass1')).toEqual({
        isValid: false,
        error: 'Password must be at least 8 characters long',
      })
    })

    it('should reject passwords that are too long', () => {
      const longPassword = 'A'.repeat(129)
      expect(validatePassword(longPassword)).toEqual({
        isValid: false,
        error: 'Password must not exceed 128 characters',
      })
    })
  })

  describe('validatePasswordForForm', () => {
    it('should return true for valid passwords', () => {
      expect(validatePasswordForForm('MySecure@Pass1')).toBe(true)
    })

    it('should return error message for invalid passwords', () => {
      expect(validatePasswordForForm('password1')).toBe('Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, special characters')
    })
  })
})