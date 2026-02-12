import {
  secureRandomInt,
  secureRandomHex,
  secureRandomNumeric,
  generateSecureAccountNumber,
  generateSecureTransactionId,
} from '@/lib/random'

describe('Random Functions', () => {
  describe('secureRandomInt', () => {
    it('should generate random integers within range', () => {
      const results = new Set()
      for (let i = 0; i < 100; i++) {
        const result = secureRandomInt(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
        results.add(result)
      }
      expect(results.size).toBeGreaterThan(1)
    })

    it('should handle edge cases', () => {
      const result = secureRandomInt(5, 6)
      expect([5, 6]).toContain(result)
      expect(() => secureRandomInt(10, 5)).toThrow('min must be less than or equal to max')
    })
  })

  describe('secureRandomHex', () => {
    it('should generate hex strings of correct length', () => {
      expect(secureRandomHex(8)).toMatch(/^[0-9a-f]{8}$/)
      expect(secureRandomHex(16)).toMatch(/^[0-9a-f]{16}$/)
      expect(secureRandomHex(32)).toMatch(/^[0-9a-f]{32}$/)
    })

    it('should generate different values', () => {
      const results = new Set()
      for (let i = 0; i < 10; i++) {
        results.add(secureRandomHex(8))
      }
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('secureRandomNumeric', () => {
    it('should generate numeric strings of correct length', () => {
      expect(secureRandomNumeric(5)).toMatch(/^\d{5}$/)
      expect(secureRandomNumeric(10)).toMatch(/^\d{10}$/)
      expect(secureRandomNumeric(3)).toMatch(/^\d{3}$/)
    })

    it('should generate different values', () => {
      const results = new Set()
      for (let i = 0; i < 10; i++) {
        results.add(secureRandomNumeric(5))
      }
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('generateSecureAccountNumber', () => {
    it('should generate 10-digit account numbers', () => {
      const accountNumber = generateSecureAccountNumber()
      expect(accountNumber).toMatch(/^\d{10}$/)
      expect(accountNumber).toMatch(/^[1-9]\d{9}$/)
    })

    it('should generate unique account numbers', () => {
      const results = new Set()
      for (let i = 0; i < 100; i++) {
        results.add(generateSecureAccountNumber())
      }
      expect(results.size).toBe(100)
    })
  })

  describe('generateSecureTransactionId', () => {
    it('should generate 16-character hex transaction IDs', () => {
      const txId = generateSecureTransactionId()
      expect(txId).toMatch(/^[0-9a-f]{16}$/)
    })

    it('should generate unique transaction IDs', () => {
      const results = new Set()
      for (let i = 0; i < 100; i++) {
        results.add(generateSecureTransactionId())
      }
      expect(results.size).toBe(100)
    })
  })

  describe('Security properties', () => {
    it('should generate different values', () => {
      const samples = []
      for (let i = 0; i < 100; i++) {
        samples.push(secureRandomInt(0, 100))
      }

      const uniqueValues = new Set(samples)
      expect(uniqueValues.size).toBeGreaterThan(10)
    })
  })
})