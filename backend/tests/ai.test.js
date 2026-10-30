import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import { createCaller } from './caller.js';
import { resetRateLimits } from '../middleware/aiRateLimiter.js';

const request = createCaller(app);

describe('🧪 Practical 13: AI API Integration & Graceful Degradation Test Suite', () => {
  before(() => {
    resetRateLimits();
  });

  test('1. Health Check Endpoint (GET /api/health) reports Practical 13 AI backend UP', async () => {
    const res = await request('get', '/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'UP');
    assert.ok(res.body.service.includes('Practical 13'));
    assert.ok(res.body.aiService.includes('Active'));
  });

  test('2. AI Status Endpoint (GET /api/ai/status) returns service configuration & rate limits', async () => {
    const res = await request('get', '/api/ai/status');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.activeProvider);
    assert.strictEqual(res.body.data.rateLimitPolicy.maxRequestsPerMinute, 1);
    assert.strictEqual(res.body.data.rateLimitPolicy.windowSeconds, 60);
    assert.ok(res.body.data.privacyPolicy.serverSideOnly);
  });

  test('3. AI Description Generation (POST /api/ai/generate-description) generates structured output', async () => {
    resetRateLimits();
    const res = await request('post', '/api/ai/generate-description', {
      body: { title: 'Implement User Authentication with JWT and Refresh Tokens' }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.description.length > 20, 'Generated description should have meaningful content');
    assert.ok(res.body.data.disclaimer.includes('AI-generated suggestion'), 'Must include disclaimer');
    assert.strictEqual(res.body.data.suggestedPriority, 'high');
  });

  test('4. AI Description Validation: Missing title returns HTTP 400 Bad Request', async () => {
    resetRateLimits();
    const res = await request('post', '/api/ai/generate-description', {
      body: { title: '' }
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('required'));
  });

  test('5. AI Priority Suggestion (POST /api/ai/suggest-priority) analyzes task urgency', async () => {
    const highRes = await request('post', '/api/ai/suggest-priority', {
      body: { title: 'Fix critical production database outage ASAP' }
    });
    assert.strictEqual(highRes.statusCode, 200);
    assert.strictEqual(highRes.body.data.suggestedPriority, 'high');

    const lowRes = await request('post', '/api/ai/suggest-priority', {
      body: { title: 'Fix typo in documentation header' }
    });
    assert.strictEqual(lowRes.statusCode, 200);
    assert.strictEqual(lowRes.body.data.suggestedPriority, 'low');
  });

  test('6. Graceful Degradation on Failure (POST /api/ai/simulate-failure) recovers cleanly without crashing', async () => {
    const res = await request('post', '/api/ai/simulate-failure', {
      body: { title: 'Deploy Kubernetes cluster' }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.fallback, true);
    assert.ok(res.body.data.description.length > 0);
    assert.ok(res.body.data.disclaimer.includes('caught cleanly'));
  });

  test('7. Supplementary Problem 2: Rate Limiter returns HTTP 429 when called twice within 60s', async () => {
    resetRateLimits();
    // First call succeeds
    const firstRes = await request('post', '/api/ai/generate-description', {
      body: { title: 'First Task Request' }
    });
    assert.strictEqual(firstRes.statusCode, 200);

    // Immediate second call should be throttled
    const secondRes = await request('post', '/api/ai/generate-description', {
      body: { title: 'Second Immediate Request' }
    });
    assert.strictEqual(secondRes.statusCode, 429, 'Expected HTTP 429 Too Many Requests');
    assert.strictEqual(secondRes.body.success, false);
    assert.ok(secondRes.body.message.includes('Rate limit reached'));
    assert.ok(secondRes.body.retryAfterSeconds > 0);
  });
});
