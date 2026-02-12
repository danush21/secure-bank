# Bugfix Documentation

This document compiles all bug fixes from the docs folder, organized by bug. For each bug, it includes:
- What caused the bug
- How the fix resolves it
- What preventive measures can avoid similar issues

## Amount Input Issues (VAL-209)

### What caused the bug
The system was accepting funding amounts with multiple leading zeros (e.g., "00100.00"), creating confusion in transaction records. The regex pattern `/^\d+\.?\d{0,2}$/` accepted any string of digits without checking for leading zeros specifically. There was no leading zero detection, and no user guidance about unnecessary leading zeros.

### How the fix resolves it
Enhanced the amount validation function in `lib/validation.ts` to detect leading zeros. Added a check for integer part length > 1 AND starting with '0'. Provides user-friendly error message: "Amount cannot have leading zeros. Did you mean $100.00?". Updated `validateFundingAmount()` to include leading zero detection and normalized return value.

### What preventive measures can avoid similar issues
- Implement semantic validation beyond format checking
- Flag unusual but technically valid input to guide users
- Test edge cases like leading zeros, unusual patterns
- Provide suggestive error messages with corrected versions
- Include semantic validation in comprehensive test coverage

## Card Number Validation (VAL-206)

### What caused the bug
The system was accepting invalid credit card numbers due to missing Luhn algorithm validation. Only checked format and starting digit, rejecting valid American Express (15 digits) and other card types. Rigid 16-digit requirement and no checksum verification allowed invalid numbers like "4111111111111112" to pass.

### How the fix resolves it
Implemented comprehensive card validation with Luhn algorithm, support for all major card types (Visa, MasterCard, American Express, Discover, Diners Club, JCB), flexible length (13-19 digits), and automatic card type identification. Added `validateCardNumber()` function with Luhn checksum validation and specific error messages.

### What preventive measures can avoid similar issues
- Implement industry-standard validation algorithms (Luhn for cards)
- Support all major card types from day one
- Include checksum validation for any payment card input
- Test with known test card numbers from each network
- Verify supported card types with payment processor
- Use tools like BIN lookup APIs to validate patterns

## Card Type Detection (VAL-210)

### What caused the bug
Card type validation used incomplete regular expressions, rejecting valid cards from major networks. MasterCard pattern only checked legacy 51-55 range, missing modern 2221-2720 range. Discover pattern was incomplete, and emerging networks like UnionPay and Mir were not supported.

### How the fix resolves it
Updated CARD_PATTERNS with complete coverage: MasterCard (51-55 + 2221-2720), comprehensive Discover (6011, 65, 644-649, 622126-622925), flexible JCB length, new UnionPay and Mir patterns. Added proper pattern matching order and updated error messages to include all supported types.

### What preventive measures can avoid similar issues
- Maintain centralized BIN range database with periodic updates
- Research all major regional card networks
- Test with real test card numbers from each network
- Subscribe to payment network updates
- Document BIN range source and last update date
- Align with payment processor supported types

## Dark Mode Text Visibility (UI-101)

### What caused the bug
Dark mode text appeared white on white backgrounds due to incomplete CSS variable setup. Form inputs used hardcoded Tailwind classes without `dark:` variants, and CSS custom properties only covered general styling, not input-specific colors. Browsers applied default styling that didn't respect the application's color scheme.

### How the fix resolves it
Added comprehensive CSS custom properties for input styling with dark mode variants. Updated all form components to use Tailwind's `dark:` variants. Added explicit input styling rules in `globals.css` for background, foreground, and border colors. Updated all form components (login, signup, modals, etc.) with proper dark mode classes.

### What preventive measures can avoid similar issues
- Always use `dark:` variants for all Tailwind classes
- Use CSS custom properties for all theme colors
- Implement a design system with built-in dark mode support
- Test components in both light and dark modes
- Use ESLint rules to enforce dark mode variant usage
- Include dark mode screenshots in component documentation

## Date of Birth Validation (VAL-202)

### What caused the bug
System accepted future dates like "2025" due to no future date validation. Used basic HTML5 date input without server-side validation. No age verification logic, no check for unreasonably old ages, and no server-side validation.

### How the fix resolves it
Implemented comprehensive date validation with future date prevention, age calculation (18+ minimum), and unreasonable age detection (max 150). Added `validateDateOfBirth()` function with accurate age calculation accounting for birthday occurrence. Returns calculated age for compliance and provides helpful error messages.

### What preventive measures can avoid similar issues
- Always validate dates server-side, never rely only on HTML5 input
- Validate temporal bounds (future dates, reasonable ranges)
- Consider compliance requirements (COPPA, GDPR age verification)
- Return calculated values for audit purposes
- Provide helpful error messages for compliance rejections
- Test all age boundary cases and different current dates

## Email Validation (VAL-201)

### What caused the bug
System accepted invalid email formats and didn't handle special cases. Overly permissive regex `/^\S+@\S+$/i` only checked basic format. No validation for common typos like ".con" instead of ".com". No case normalization warning for "TEST@example.com".

### How the fix resolves it
Created comprehensive email validation with RFC 5322 compliant regex, common typo detection (".con" → ".com"), and case normalization warning. Added `validateEmail()` function with specific error messages and `getEmailNormalizationWarning()` for user feedback.

### What preventive measures can avoid similar issues
- Implement format validation plus content validation
- Detect common data entry mistakes proactively
- Provide real-time validation with inline feedback
- Test with various invalid formats and common typos
- Include semantic validation beyond basic pattern matching
- Use progressive validation as user types

## Account Creation Error (PERF-401)

### What caused the bug
New accounts displayed incorrect $100 balance when database operations failed. Fallback object returned hardcoded `balance: 100` instead of actual balance `0`. Database insert succeeded but fetch failed, showing wrong data to client.

### How the fix resolves it
Removed incorrect fallback object and enforced error handling. Changed from returning fallback data to throwing `TRPCError` if account fetch fails. Ensures client always receives accurate data or explicit failure, preventing data inconsistency.

### What preventive measures can avoid similar issues
- No fallback with wrong data - always use actual data or error
- Explicit error handling instead of returning fallback values
- Data validation - verify fetched data matches insert
- Principle of least surprise - client gets real data or explicit failure
- Code review checklist: no hardcoded fallback values, all database operations validated

## Logout Always Reports Success (PERF-402)

### What caused the bug
Logout endpoint always returned `{ success: true }` regardless of session invalidation outcome. Ignored return value of `invalidateSession(token)`, no error handling for missing token or database errors.

### How the fix resolves it
Capture return value of `invalidateSession(token)`, validate token extraction, handle missing sessions as successful logout (already logged out), and throw error if invalidation fails unexpectedly. Added detailed logging for edge cases.

### What preventive measures can avoid similar issues
- Capture and check return values from critical operations
- Implement proper error handling with specific error types
- Add logging for edge cases and monitoring
- Validate inputs and handle all possible failure modes
- Use defensive programming with explicit success/failure paths

## Session Expiry Boundary Conditions (PERF-403)

### What caused the bug
Sessions remained valid at exact expiry timestamp due to incorrect boundary condition `<` instead of `<=`. Inverted logic in `getUserActiveSessions()` returned expired sessions instead of active ones. Late expiry warning at 60 seconds instead of 5 minutes.

### How the fix resolves it
Changed comparison operator from `<` to `<=` in `validateSessionToken()`, fixed `lt()` to `gt()` in `getUserActiveSessions()`, extended expiry warning window from 60s to 300s. Added defensive check for already-expired sessions.

### What preventive measures can avoid similar issues
- Use correct boundary conditions (`<=` for expiry, `>` for active)
- Test all boundary cases (exact expiry, one second before/after)
- Implement early warnings for better UX
- Add defensive checks for edge cases
- Use consistent comparison operators throughout codebase

## Transaction Sorting (PERF-404)

### What caused the bug
Transactions appeared in random order due to missing explicit `ORDER BY` clause. API returned transactions without sorting, causing UI confusion.

### How the fix resolves it
Added deterministic ordering by `createdAt` descending in transaction queries. Used `.orderBy(desc(transactions.createdAt))` for consistent ordering.

### What preventive measures can avoid similar issues
- Always include explicit ORDER BY in queries returning multiple records
- Use descending order for time-based data (newest first)
- Test ordering with multiple records
- Document expected ordering in API specifications

## Missing Transactions (PERF-405)

### What caused the bug
Users reported missing transactions after funding events. Post-insert fetch used `SELECT ... ORDER BY created_at DESC LIMIT 1` without filtering by `account_id`, returning transactions from other accounts in high concurrency.

### How the fix resolves it
Updated query to filter by `account_id` before ordering: `where(eq(transactions.accountId, input.accountId)).orderBy(desc(transactions.createdAt)).limit(1)`. Guarantees returned transaction belongs to intended account.

### What preventive measures can avoid similar issues
- Always filter by user/account context in multi-tenant queries
- Use explicit WHERE clauses with proper indexes
- Test concurrent operations with multiple users/accounts
- Wrap related operations in database transactions
- Add unique external IDs for correlation

## Balance Calculation (PERF-406)

### What caused the bug
Account balances became incorrect due to read-modify-write pattern vulnerable to race conditions. Concurrent funding events overwrote each other's updates. Floating-point "hack" introduced inconsistencies.

### How the fix resolves it
Replaced read-modify-write with atomic SQL update: `sql`balance + ${amount}`` inside database transaction. Wrapped insert and balance update in `db.transaction()` for consistency.

### What preventive measures can avoid similar issues
- Use atomic database operations instead of read-modify-write
- Wrap related operations in transactions
- Compute balances from transaction ledger for verification
- Add optimistic locking for high-concurrency scenarios
- Implement periodic reconciliation jobs

## Performance Degradation (PERF-407)

### What caused the bug
System slowed under load due to N+1 database queries for transaction enrichment and per-row deletes for expired sessions. No batch operations for cleanup.

### How the fix resolves it
Eliminated N+1 by joining `transactions` with `accounts` in single query. Changed session cleanup to single `DELETE` query instead of per-row deletes. Reduced queries from O(N) to O(1) for transaction lists.

### What preventive measures can avoid similar issues
- Identify and eliminate N+1 query patterns
- Use JOINs instead of multiple queries
- Implement batch operations for bulk updates/deletes
- Add database query monitoring and alerts
- Use database indexes for frequently queried columns

## Resource Leak (PERF-408)

### What caused the bug
Database connections remained open, exhausting file descriptors. `initDb()` created extra `Database` instance pushed to unused array while main connection was already open.

### How the fix resolves it
Removed creation of unused `Database` instance. Added `closeDb()` function and process handlers for `exit`, `SIGINT`, `SIGTERM` to close connections on shutdown.

### What preventive measures can avoid similar issues
- Track all resource allocations and ensure cleanup
- Use connection pooling for database connections
- Implement proper shutdown handlers
- Monitor file descriptor usage in production
- Add resource leak detection in testing

## Phone Number Validation (VAL-204)

### What caused the bug
Phone number validation accepted invalid formats and lacked international support. Pattern `/^\d{10}$/` only accepted US 10-digit format, rejecting valid international numbers and formatted US numbers.

### How the fix resolves it
Implemented comprehensive validation supporting US and international formats, 27 country codes, automatic formatting, and flexible parsing. Added `validatePhoneNumber()` with E.164 compliance and specific error messages.

### What preventive measures can avoid similar issues
- Support international formats from day one
- Maintain list of valid country codes with periodic updates
- Accept multiple input formats but normalize to standard
- Test with various international number formats
- Provide clear placeholder examples for different formats

## Routing Number Validation (VAL-207)

### What caused the bug
Bank transfers accepted without routing numbers due to conditional field registration issues. React Hook Form didn't validate conditionally rendered fields properly. No checksum validation for routing numbers.

### How the fix resolves it
Implemented Federal Reserve checksum algorithm, required field validation in form submission, and proper conditional field handling. Added `validateRoutingNumber()` with ABA standard validation.

### What preventive measures can avoid similar issues
- Add validation in `onSubmit` handler for conditional required fields
- Use discriminated unions for form types
- Implement industry-standard checksums
- Test form behavior when toggling between conditional fields
- Never mark conditionally required fields as optional in types

## SSN Storage Security (SEC-301)

### What caused the bug
SSNs stored in plaintext violating HIPAA, PCI-DSS, SOX. No encryption utilities existed, database schema stored SSN as plain text.

### How the fix resolves it
Implemented AES-256-GCM encryption with random IVs, authentication tags, and secure key derivation. Changed database schema to encrypted storage, added migration script for existing data.

### What preventive measures can avoid similar issues
- Encrypt sensitive data at rest using industry standards
- Use authenticated encryption (AEAD)
- Store encryption keys securely (vaults, not code)
- Implement key rotation procedures
- Never log or expose decrypted sensitive data
- Regular security audits for PII handling

## Insecure Random Numbers (SEC-302)

### What caused the bug
Account numbers generated using `Math.random()`, which is cryptographically insecure and predictable with observation.

### How the fix resolves it
Replaced with `crypto.randomInt()` for cryptographically secure generation. Added `generateSecureAccountNumber()` and other secure random utilities.

### What preventive measures can avoid similar issues
- Use cryptographically secure RNG for security-sensitive operations
- Never use `Math.random()` for identifiers or tokens
- Test randomness properties of generated values
- Use OS-level secure random sources
- Implement proper entropy for security operations

## XSS Vulnerability (SEC-303)

### What caused the bug
Transaction descriptions rendered using `dangerouslySetInnerHTML` without escaping, allowing script injection attacks.

### How the fix resolves it
Replaced `dangerouslySetInnerHTML` with escaped text content. Added XSS protection utilities for HTML escaping and input sanitization.

### What preventive measures can avoid similar issues
- Never use `dangerouslySetInnerHTML` with user input
- Always escape HTML when rendering user-generated content
- Implement Content Security Policy headers
- Validate and sanitize user input on backend
- Use React's automatic text escaping
- Regular security testing for XSS vulnerabilities

## Session Management (SEC-304)

### What caused the bug
Multiple concurrent sessions allowed, no invalidation on login, incomplete logout, no expired session cleanup, no session limits.

### How the fix resolves it
Implemented single session per user, automatic invalidation on login, proper logout cleanup, expired session management, and session audit utilities.

### What preventive measures can avoid similar issues
- Enforce session limits per user
- Invalidate old sessions on new login
- Implement proper session cleanup routines
- Add session audit logging
- Use secure session storage and validation
- Regular session management reviews

## State Code Validation (VAL-203)

### What caused the bug
Accepted 'XX' as valid state code due to permissive pattern `/^[A-Z]{2}$/` without reference validation against actual US state codes.

### How the fix resolves it
Implemented complete US state code database with 57 valid codes, case-insensitive validation, and specific error messages for invalid codes.

### What preventive measures can avoid similar issues
- Always validate against authoritative reference lists
- Don't just check format - validate against known valid values
- Maintain centralized lists of valid values
- Test with invalid examples from the domain
- Provide user guidance for valid formats

## Weak Password Requirements (VAL-208)

### What caused the bug
Password validation only checked 8+ characters and one number, allowing weak passwords like "password1". No diversity requirements, pattern detection, or comprehensive weak password checking.

### How the fix resolves it
Implemented comprehensive validation requiring 3/4 character types, 40+ common password detection, sequential pattern blocking, and strength scoring.

### What preventive measures can avoid similar issues
- Follow NIST password guidelines
- Implement character diversity requirements
- Check against comprehensive weak password databases
- Detect sequential and keyboard patterns
- Provide strength feedback and improvement suggestions
- Regular updates to weak password lists

## Zero Amount Funding (VAL-205)

### What caused the bug
Users could submit $0.00 funding due to ineffective `min` validator on text input and no explicit zero check.

### How the fix resolves it
Added explicit zero check and business logic validation. Replaced generic validators with custom `validateFundingAmountForForm()` function.

### What preventive measures can avoid similar issues
- Use custom validators for business logic rules
- Test boundary conditions explicitly
- Match input types with appropriate validators
- Provide clear error messages for business rule violations
- Implement server-side validation for critical operations

## Comprehensive Test Coverage

Implemented comprehensive Jest test suite with 101 test cases covering all bug fixes:

**Validation Tests** (`__tests__/validation.test.ts` - 52 tests):
- **VAL-209 Amount Input** (7 tests):
  - Accept valid amounts with proper decimal formatting
  - Reject amounts with leading zeros (e.g., "00100.00")
  - Reject zero amounts ($0.00)
  - Reject amounts below minimum ($0.01)
  - Reject amounts above maximum ($10,000.00)
  - Reject invalid formats (non-numeric, too many decimals)
  
- **VAL-206 Card Number** (6 tests):
  - Accept valid Visa, MasterCard, American Express, Discover cards
  - Reject invalid card numbers (failed Luhn check)
  - Reject cards with wrong length (13-19 digit requirement)
  - Verify Luhn algorithm validation is applied
  
- **VAL-210 Card Type Detection** (covered in card tests):
  - Support Visa (4), MasterCard (51-55, 2221-2720), AmEx (34-37), Discover (6011, 65, 644-649, 622126-622925)
  - Auto-detect card type on validation
  - Return specific card type in response
  
- **VAL-202 Date of Birth** (4 tests):
  - Accept valid dates for users 18+
  - Reject future dates (shows age validation takes precedence)
  - Reject users under 18
  - Reject unreasonably old ages (>150 years)
  - Return calculated age for compliance
  
- **VAL-201 Email Validation** (4 tests):
  - Accept valid RFC 5322 format emails
  - Detect common typos (".con" → ".com", ".ocm" → ".com")
  - Warn about uppercase emails (normalization warning)
  - Reject invalid formats (missing local/domain parts)
  
- **VAL-204 Phone Number** (3 tests):
  - Accept valid US phone numbers (10 digits, various formats)
  - Accept international numbers (+1-234-567-8900 format with spaces)
  - Auto-format phone numbers to standard format
  - Reject invalid format/length
  - Support 27 country codes
  
- **VAL-207 Routing Number** (2 tests):
  - Accept valid 9-digit routing numbers with ABA checksum
  - Reject invalid routing numbers (failed checksum, wrong length)
  
- **VAL-203 State Code** (3 tests):
  - Accept valid US state codes (CA, NY, DC, etc.)
  - Reject invalid state codes (XX, ABC, etc.)
  - Handle case insensitivity (ca → CA)
  - Validate against complete list of 57 state codes
  
- **VAL-208 Password** (4 tests):
  - Accept strong passwords (3+ character types, length ≥8, <128)
  - Reject weak passwords (common weak passwords list)
  - Reject passwords with sequential characters (abc, 123, qwerty)
  - Reject passwords with repeated characters (aaaa1111A)
  - Return password strength (weak/fair/good/strong)
  
- **Form Validators** (14 tests):
  - Validate form submission with form-specific validators
  - Return true for valid input, error message for invalid
  - Consistent error messages across form and object validators

**Crypto Functions Tests** (`__tests__/crypto.test.ts` - 9 tests, SEC-301):
- **Encryption/Decryption:**
  - Encrypt and decrypt SSN correctly (123456789 → encrypted → 123456789)
  - Produce different encrypted outputs for same input (IV randomization)
  - Verify AES-256-GCM encryption is used
  - Verify authentication tag prevents tampering
  
- **Error Handling:**
  - Reject invalid SSN format (not 9 digits)
  - Reject invalid encrypted data (corrupted, missing IV/tag)
  - Gracefully handle edge cases
  
- **Masking:**
  - Mask SSN correctly (123456789 → XXX-XX-6789)
  - Handle invalid SSN formats gracefully (return XXX-XX-XXXX)
  
- **Verification:**
  - Verify valid encrypted SSN returns true
  - Reject invalid encrypted data
  - Validate authentication tag integrity
  
- **Integration Test:**
  - Full encrypt/decrypt/mask cycle validation

**Session Management Tests** (`__tests__/session.test.ts` - 10 tests, SEC-304):
- **Token Validation:**
  - Validate correct session tokens
  - Reject invalid/malformed tokens
  - Handle null/undefined inputs gracefully
  - Return user info for valid tokens
  
- **Session Limits:**
  - Enforce single session per user
  - Invalidate old sessions on new login
  - Return count of invalidated sessions
  
- **Session Invalidation:**
  - Invalidate existing sessions
  - Handle non-existent tokens gracefully
  - Return false for already-invalidated sessions
  
- **Session Retrieval:**
  - Return array of active sessions
  - Handle non-existent users (empty array)
  - Filter expired sessions from results
  
- **Cleanup:**
  - Cleanup expired sessions (past expiry)
  - Return count of cleaned-up sessions
  - Handle concurrent cleanup calls
  
- **Security Properties:**
  - Handle concurrent session limits correctly
  - Enforce expiry boundary conditions (≤ comparison)
  - Provide early expiry warnings (300s instead of 60s)

**Random Generation Tests** (`__tests__/random.test.ts` - 11 tests, SEC-302):
- **Secure Random Integers:**
  - Generate random integers within range [min, max]
  - Verify distribution (multiple calls produce different values)
  - Handle edge cases (same min/max)
  - Reject invalid range (min > max)
  
- **Secure Random Hex:**
  - Generate hex strings of specified length
  - Verify format (only [0-9a-f] characters)
  - Verify uniqueness across multiple calls
  
- **Secure Random Numeric:**
  - Generate numeric strings of specified length
  - Verify format (only [0-9] characters)
  - Verify uniqueness across multiple calls
  
- **Account Number Generation:**
  - Generate 10-digit account numbers starting with 1-9
  - Verify format (^\d{10}$)
  - Verify uniqueness (100 calls → 100 unique numbers)
  
- **Transaction ID Generation:**
  - Generate 16-character hex transaction IDs
  - Verify format ([0-9a-f]{16})
  - Verify uniqueness (100 calls → 100 unique IDs)
  
- **Security Properties:**
  - Generate sufficiently different values (entropy test)
  - Use crypto.randomInt() not Math.random()
  - Handle multiple concurrent generations

**XSS Protection Tests** (`__tests__/xss.test.ts` - 19 tests, SEC-303):
- **HTML Escaping:**
  - Escape HTML special characters (<, >, ", ', &)
  - Convert < to &lt;, > to &gt;, etc.
  - Handle empty/null/undefined inputs
  - Preserve safe text content
  
- **Input Sanitization:**
  - Remove HTML tags and escape content
  - Strip all HTML while preserving text
  - Handle empty/null/undefined inputs
  - Escape special characters in remaining text
  
- **Safety Validation:**
  - Accept safe HTML (<b>, <p>, <i>, plain text)
  - Reject dangerous elements (<script>, <iframe>, <object>, <embed>)
  - Reject event handlers (onerror, onclick, onload)
  - Reject javascript: URLs
  - Reject data: URLs
  - Handle empty/null/undefined inputs
  
- **Text Safenization:**
  - Escape HTML and convert newlines to <br /> tags
  - Handle multiple consecutive newlines
  - Preserve escaped content
  - Handle empty/null/undefined inputs
  
- **XSS Attack Prevention:**
  - Prevent script injection (<script>alert(1)</script>)
  - Prevent event handler injection (<img onerror="alert(1)">)
  - Prevent javascript: URL injection (<a href="javascript:alert(1)">)
  - Prevent HTML injection via user input

**Code Improvements:**
- Added null/undefined handling to XSS functions (escapeHtml, sanitizeInput, safenizeText)
- Fixed Jest configuration for Next.js projects (jest.config.js)
- Added proper TypeScript support in tests
- Ensured robust error handling across all tested functions
- Implemented proper async/await handling in session tests
- Added edge case coverage for all validation functions