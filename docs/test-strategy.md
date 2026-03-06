# Cosmic Watch - Test Strategy (Simple)

**Task:** CW-005  
**Status:** Complete  
**Project:** Hobby Project - Single VPS

---

## 1. Testing Philosophy

Simple hobby project = simple testing. No complex CI/CD, just basic sanity checks.

---

## 2. Test Types

### 2.1 Unit Tests (What matters)
- Orbital engine calculations (satellite position)
- Data transformation functions
- API validation logic

```typescript
// Example: test orbital engine
import { propagate } from '@cosmic-watch/orbital-engine';

test('propagate returns valid position', () => {
  const result = propagate(tleLine1, tleLine2, new Date());
  expect(result).toBeDefined();
  expect(result.position.latitude).toBeGreaterThan(-90);
  expect(result.position.latitude).toBeLessThan(90);
});
```

### 2.2 Integration Tests (Nice to have)
- API endpoints return correct data
- Database queries work
- External API clients work

### 2.3 Manual Testing (Most important for MVP)
- Open browser, click around
- Verify satellites render
- Check ISS highlighted

---

## 3. Tools

| Type | Tool | Why |
|------|------|-----|
| Unit | Vitest | Fast, simple, React-friendly |
| Integration | Supertest | HTTP testing |
| Manual | Browser | Verify it actually works |

---

## 4. Test Structure

```
apps/
├── web/
│   └── src/
│       └── __tests__/          # Unit tests
├── api/
    └── src/
        └── __tests__/          # Unit + integration
packages/
    └── orbital-engine/
        └── __tests__/          # Core logic tests
```

---

## 5. Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## 6. Exit Criteria

| Check | Target |
|-------|--------|
| Unit test coverage | 60%+ for core packages |
| All tests pass | ✅ |
| Manual browser test | Works on Chrome/Firefox |

---

## 7. What's NOT Required

- ❌ E2E automation (Playwright/Cypress)
- ❌ Load testing (k6)
- ❌ Code coverage 80%+
- ❌ Automated security scanning
- ❌ Performance benchmarks

This is a hobby project. If it works in the browser, that's the test.

---

## 8. Quick Test Commands

```bash
# Test orbital engine
cd packages/orbital-engine && npm test

# Test API
cd apps/api && npm test

# Manual verification
npm run dev
# Open http://localhost:5173
# Click around, verify satellites render
```
