import { encryptSSN, decryptSSN, maskSSN, verifyEncryptedSSN } from '@/lib/crypto'

describe('Crypto Functions', () => {
  const testSSN = '123456789'

  describe('encryptSSN and decryptSSN', () => {
    it('should encrypt and decrypt SSN correctly', () => {
      const encrypted = encryptSSN(testSSN)
      const decrypted = decryptSSN(encrypted)

      expect(decrypted).toBe(testSSN)
      expect(encrypted).not.toContain(testSSN)
    })

    it('should produce different encrypted outputs for same input', () => {
      const encrypted1 = encryptSSN(testSSN)
      const encrypted2 = encryptSSN(testSSN)

      expect(encrypted1).not.toBe(encrypted2)
    })

    it('should reject invalid SSN format', () => {
      expect(() => encryptSSN('123')).toThrow('Invalid SSN format. Expected 9 digits.')
      expect(() => encryptSSN('1234567890')).toThrow('Invalid SSN format. Expected 9 digits.')
      expect(() => encryptSSN('abc123456')).toThrow('Invalid SSN format. Expected 9 digits.')
    })

    it('should reject invalid encrypted data', () => {
      expect(() => decryptSSN('invalid')).toThrow('Failed to decrypt SSN. Data may be corrupted or invalid.')
      expect(() => decryptSSN('{"invalid": "json"}')).toThrow('Failed to decrypt SSN. Data may be corrupted or invalid.')
    })
  })

  describe('maskSSN', () => {
    it('should mask SSN correctly', () => {
      expect(maskSSN(testSSN)).toBe('XXX-XX-6789')
      expect(maskSSN('987654321')).toBe('XXX-XX-4321')
    })

    it('should handle invalid SSN format gracefully', () => {
      expect(maskSSN('123')).toBe('XXX-XX-XXXX')
      expect(maskSSN('1234567890')).toBe('XXX-XX-XXXX')
      expect(maskSSN('abc123456')).toBe('XXX-XX-XXXX')
      expect(maskSSN('')).toBe('XXX-XX-XXXX')
    })
  })

  describe('verifyEncryptedSSN', () => {
    it('should verify valid encrypted SSN', () => {
      const encrypted = encryptSSN(testSSN)
      expect(verifyEncryptedSSN(encrypted)).toBe(true)
    })

    it('should reject invalid encrypted data', () => {
      expect(verifyEncryptedSSN('invalid')).toBe(false)
      expect(verifyEncryptedSSN('{"iv": "invalid"}')).toBe(false)
      expect(verifyEncryptedSSN('')).toBe(false)
    })
  })

  describe('Integration test', () => {
    it('should handle full encrypt/decrypt/mask cycle', () => {
      // Encrypt
      const encrypted = encryptSSN(testSSN)
      expect(verifyEncryptedSSN(encrypted)).toBe(true)

      // Decrypt
      const decrypted = decryptSSN(encrypted)
      expect(decrypted).toBe(testSSN)

      // Mask
      const masked = maskSSN(decrypted)
      expect(masked).toBe('XXX-XX-6789')
    })
  })
})