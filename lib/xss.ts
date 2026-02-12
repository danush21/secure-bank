export function escapeHtml(text: string): string {
  if (text == null) {
    return '';
  }
  
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function sanitizeInput(input: string): string {
  if (input == null) {
    return '';
  }
  
  const stripped = input.replace(/<[^>]*>/g, "");
  return escapeHtml(stripped);
}

export function isInputSafe(input: string): boolean {
  if (input == null) {
    return false;
  }
  
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }

  return true;
}

export function safenizeText(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br />");
}
