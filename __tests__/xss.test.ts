import {
  escapeHtml,
  sanitizeInput,
  isInputSafe,
  safenizeText,
} from '@/lib/xss'

describe('XSS Protection Functions', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
      expect(escapeHtml('<b>Bold</b>')).toBe('&lt;b&gt;Bold&lt;/b&gt;')
      expect(escapeHtml('& < > " \'')).toBe('&amp; &lt; &gt; &quot; &#039;')
    })

    it('should handle empty and null inputs', () => {
      expect(escapeHtml('')).toBe('')
      expect(escapeHtml(null as any)).toBe('')
      expect(escapeHtml(undefined as any)).toBe('')
    })

    it('should preserve safe content', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World')
      expect(escapeHtml('123')).toBe('123')
      expect(escapeHtml('safe-content')).toBe('safe-content')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags and escape content', () => {
      expect(sanitizeInput('<script>alert("xss")</script>Hello')).toBe('alert(&quot;xss&quot;)Hello')
      expect(sanitizeInput('<b>Bold</b>')).toBe('Bold')
      expect(sanitizeInput('<p>Paragraph</p>')).toBe('Paragraph')
    })

    it('should handle empty and null inputs', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })

    it('should escape special characters', () => {
      expect(sanitizeInput('<>"\'&')).toBe('&quot;&#039;&amp;')
    })
  })

  describe('isInputSafe', () => {
    it('should validate safe HTML', () => {
      expect(isInputSafe('<b>Safe</b>')).toBe(true)
      expect(isInputSafe('<p>Hello <i>world</i></p>')).toBe(true)
      expect(isInputSafe('Plain text')).toBe(true)
    })

    it('should reject dangerous HTML', () => {
      expect(isInputSafe('<script>alert(1)</script>')).toBe(false)
      expect(isInputSafe('<iframe src="evil.com">')).toBe(false)
      expect(isInputSafe('<a href="javascript:alert(1)">')).toBe(false)
      expect(isInputSafe('<img onerror="alert(1)">')).toBe(false)
      expect(isInputSafe('<object>dangerous</object>')).toBe(false)
      expect(isInputSafe('<embed src="evil.swf">')).toBe(false)
    })

    it('should handle empty input', () => {
      expect(isInputSafe('')).toBe(true)
      expect(isInputSafe(null as any)).toBe(false)
      expect(isInputSafe(undefined as any)).toBe(false)
    })
  })

  describe('safenizeText', () => {
    it('should escape HTML and convert newlines to br tags', () => {
      expect(safenizeText('Hello\nWorld')).toBe('Hello<br />World')
      expect(safenizeText('<b>Bold</b>\nText')).toBe('&lt;b&gt;Bold&lt;/b&gt;<br />Text')
    })

    it('should handle empty and null inputs', () => {
      expect(safenizeText('')).toBe('')
      expect(safenizeText(null as any)).toBe('')
      expect(safenizeText(undefined as any)).toBe('')
    })
  })

  describe('XSS Attack Prevention', () => {
    it('should prevent script injection', () => {
      const maliciousInput = '<script>alert("XSS Attack!")</script>'
      expect(isInputSafe(maliciousInput)).toBe(false)
      expect(sanitizeInput(maliciousInput)).toBe('alert(&quot;XSS Attack!&quot;)')
      expect(escapeHtml(maliciousInput)).toBe('&lt;script&gt;alert(&quot;XSS Attack!&quot;)&lt;/script&gt;')
    })

    it('should prevent event handler injection', () => {
      const maliciousInput = '<img src="x" onerror="alert(1)">'
      expect(isInputSafe(maliciousInput)).toBe(false)
    })

    it('should prevent javascript: URL injection', () => {
      const maliciousInput = '<a href="javascript:alert(1)">Click me</a>'
      expect(isInputSafe(maliciousInput)).toBe(false)
    })

    it('should prevent iframe injection', () => {
      const maliciousInput = '<iframe src="evil.com"></iframe>'
      expect(isInputSafe(maliciousInput)).toBe(false)
    })

    it('should prevent object injection', () => {
      const maliciousInput = '<object>dangerous</object>'
      expect(isInputSafe(maliciousInput)).toBe(false)
    })

    it('should prevent embed injection', () => {
      const maliciousInput = '<embed src="evil.swf">'
      expect(isInputSafe(maliciousInput)).toBe(false)
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large inputs efficiently', () => {
      const largeInput = '<b>'.repeat(1000) + 'content' + '</b>'.repeat(1000)
      const result = sanitizeInput(largeInput)
      expect(result).toContain('content')
      expect(result).not.toContain('<script>')
    })

    it('should handle unicode characters', () => {
      const unicodeInput = '<b>Hello 世界 🌍</b>'
      expect(sanitizeInput(unicodeInput)).toBe('Hello 世界 🌍')
      expect(escapeHtml('Hello 世界 🌍')).toBe('Hello 世界 🌍')
    })

    it('should handle mixed content', () => {
      const mixedInput = 'Safe text <b>bold</b> <script>evil</script> more text'
      expect(sanitizeInput(mixedInput)).toBe('Safe text bold evil more text')
      expect(isInputSafe(mixedInput)).toBe(false)
    })
  })
})