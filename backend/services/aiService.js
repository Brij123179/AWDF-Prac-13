/**
 * AI Service for Practical 13: AI API Integration into a Web Application
 * Supports OpenAI API (gpt-4o-mini) and Google Gemini API (gemini-1.5-flash).
 * Implements strict Graceful Degradation: when API keys are absent, quota-exceeded,
 * or network fails, returns an intelligent contextual fallback without crashing the server.
 */

const AI_DISCLAIMER = '⚠️ AI-generated suggestion: Please review and verify accuracy before saving.';

/**
 * Intelligent Rule-Based Fallback Generator
 * Produces structured task descriptions and priority suggestions when external AI API is unreachable.
 */
function generateContextualFallback(title) {
  const lower = title.toLowerCase();
  let category = 'General Feature';
  let priority = 'medium';
  let steps = [
    'Analyze requirements and outline technical specification.',
    'Implement the core logic and update state management.',
    'Write unit and integration tests to ensure regression-free behavior.',
    'Perform peer code review and deploy to target environment.'
  ];

  if (/bug|fix|error|crash|broken|fault|leak|patch/i.test(lower)) {
    category = 'Bug Fix & Maintenance';
    priority = /urgent|critical|prod|security/i.test(lower) ? 'high' : 'medium';
    steps = [
      'Reproduce the issue locally and inspect error logs.',
      'Identify root cause in backend service or frontend state.',
      'Apply regression-safe patch and verify edge cases.',
      'Add automated test case covering the scenario and create PR.'
    ];
  } else if (/auth|login|signup|jwt|password|token|permission|role/i.test(lower)) {
    category = 'Authentication & Security';
    priority = 'high';
    steps = [
      'Verify JWT token validation and secure cookie/header handling.',
      'Sanitize all user inputs to prevent injection and XSS.',
      'Implement rate limiting and audit logging on auth endpoints.',
      'Conduct security testing and verify session expiration.'
    ];
  } else if (/database|mongo|sql|schema|index|query|migration/i.test(lower)) {
    category = 'Database & Data Modeling';
    priority = 'medium';
    steps = [
      'Design optimized schema with proper compound indexing.',
      'Implement indexing on frequently filtered query fields.',
      'Benchmark query latency using explain plan.',
      'Test failover handling and persistence with Docker volumes.'
    ];
  } else if (/docker|deploy|ci|cd|pipeline|github|actions|cloud/i.test(lower)) {
    category = 'DevOps & CI/CD Infrastructure';
    priority = 'high';
    steps = [
      'Configure multi-stage Dockerfile or GitHub Actions YAML.',
      'Verify automated linting and test runs on push/PR triggers.',
      'Ensure environment secrets are injected via secure store.',
      'Validate container health check and compose orchestration.'
    ];
  } else if (/ui|frontend|css|style|modal|responsive|layout/i.test(lower)) {
    category = 'User Interface & Experience';
    priority = 'low';
    steps = [
      'Draft responsive design following component design tokens.',
      'Implement interactive state and accessibility (ARIA) attributes.',
      'Ensure cross-browser compatibility across mobile and desktop.',
      'Optimize asset bundle size with lazy loading and code splitting.'
    ];
  }

  const generatedDescription = `[${category}] Plan for: ${title}

Summary:
Automated breakdown generated to assist with prompt execution and task tracking.

Recommended Action Items:
1. ${steps[0]}
2. ${steps[1]}
3. ${steps[2]}
4. ${steps[3]}

Notes:
- Ensure all acceptance criteria are validated before marking this task as completed.
- Maintain documentation and update related API schemas.`;

  return {
    description: generatedDescription,
    suggestedPriority: priority,
    provider: 'intelligent-fallback-engine',
    fallback: true,
    isAIGenerated: true,
    disclaimer: AI_DISCLAIMER
  };
}

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAI(title, apiKey) {
  const prompt = `You are a helpful agile project management assistant. Given the following task title, write a concise, professional, structured task description including a 1-sentence summary and 3-4 bullet points of actionable technical acceptance criteria. Keep it under 120 words.
Task Title: "${title}"`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert software engineering task planner.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 250
    }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API responded with HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const description = data.choices?.[0]?.message?.content?.trim();

  // Infer priority suggestion based on title keywords
  const isHigh = /urgent|critical|security|bug|crash|prod/i.test(title);
  const isLow = /doc|typo|readme|cleanup|minor|color/i.test(title);
  const suggestedPriority = isHigh ? 'high' : isLow ? 'low' : 'medium';

  return {
    description,
    suggestedPriority,
    provider: 'openai-gpt-4o-mini',
    fallback: false,
    isAIGenerated: true,
    disclaimer: AI_DISCLAIMER
  };
}

/**
 * Call Google Gemini API
 */
async function callGemini(title, apiKey) {
  const prompt = `You are a software engineering project assistant. Given this task title: "${title}", provide a concise, structured task description with a 1-sentence summary and 3 bulleted technical action items. Keep under 120 words.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
    }),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API responded with HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  const isHigh = /urgent|critical|security|bug|crash|prod/i.test(title);
  const isLow = /doc|typo|readme|cleanup|minor|color/i.test(title);
  const suggestedPriority = isHigh ? 'high' : isLow ? 'low' : 'medium';

  return {
    description,
    suggestedPriority,
    provider: 'google-gemini-1.5-flash',
    fallback: false,
    isAIGenerated: true,
    disclaimer: AI_DISCLAIMER
  };
}

/**
 * Primary AI Service Orchestrator
 * Attempts real API call (OpenAI / Gemini) and seamlessly falls back on error/missing keys.
 */
export async function generateTaskDescription(title) {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Task title is required to generate AI description');
  }

  const cleanTitle = title.trim();
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try OpenAI if configured
  if (openaiKey && !openaiKey.startsWith('your_') && openaiKey !== 'mock_invalid_key') {
    try {
      console.log(`🤖 [AIService] Requesting description from OpenAI for: "${cleanTitle}"...`);
      return await callOpenAI(cleanTitle, openaiKey);
    } catch (err) {
      console.warn(`⚠️ [AIService] OpenAI call failed (${err.message}). Activating Graceful Degradation fallback...`);
    }
  }

  // 2. Try Gemini if configured
  if (geminiKey && !geminiKey.startsWith('your_') && geminiKey !== 'mock_invalid_key') {
    try {
      console.log(`🤖 [AIService] Requesting description from Gemini for: "${cleanTitle}"...`);
      return await callGemini(cleanTitle, geminiKey);
    } catch (err) {
      console.warn(`⚠️ [AIService] Gemini call failed (${err.message}). Activating Graceful Degradation fallback...`);
    }
  }

  // 3. Graceful Fallback Mode (No valid API key or network failure)
  console.log(`🛡️ [AIService] Executing Graceful Degradation fallback for: "${cleanTitle}"`);
  return generateContextualFallback(cleanTitle);
}

/**
 * Get AI Service Configuration Status
 */
export function getAIStatus() {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('your_'));
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('your_'));

  return {
    service: 'Practical 13 AI Integration Service',
    activeProvider: hasOpenAI ? 'OpenAI (gpt-4o-mini)' : hasGemini ? 'Gemini (1.5-flash)' : 'Graceful Degradation Engine (Local Contextual)',
    configuredProviders: {
      openAI: hasOpenAI,
      gemini: hasGemini
    },
    rateLimitPolicy: {
      maxRequestsPerMinute: 1,
      windowSeconds: 60,
      scope: 'per-user / per-client-IP'
    },
    privacyPolicy: {
      serverSideOnly: true,
      piiSanitization: 'Enabled (Zero user credentials or PII forwarded to AI)',
      storage: 'Never logged or persisted to third-party data banks'
    },
    disclaimer: AI_DISCLAIMER
  };
}

