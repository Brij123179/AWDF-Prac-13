# Practical 13: AI API Integration into a Web Application

[![AI Service: Active](https://img.shields.io/badge/AI%20Integration-Active-brightgreen.svg)](https://github.com/Brij123179/AWDF-Prac-13)
[![Tests: 7 Passed](https://img.shields.io/badge/tests-7%20passed-brightgreen.svg)](https://github.com/Brij123179/AWDF-Prac-13)
[![Security: Server--Side Only](https://img.shields.io/badge/API%20Key-Server--Side%20Quarantined-blue.svg)](https://github.com/Brij123179/AWDF-Prac-13)
[![Graceful Degradation: Enabled](https://img.shields.io/badge/fallback-graceful%20degradation-orange.svg)](https://github.com/Brij123179/AWDF-Prac-13)
[![Course: ITUE301](https://img.shields.io/badge/course-ITUE301-orange.svg)](https://charusat.ac.in)

> **Charotar University of Science and Technology (CHARUSAT)**  
> **Faculty of Technology and Engineering (FTE)**  
> **Department of Information Technology / Computer Engineering**  
> **Course:** Advanced Web Development Frameworks (`ITUE301`)  
> **Student Name:** Brij Patel  
> **Repository:** [https://github.com/Brij123179/AWDF-Prac-13](https://github.com/Brij123179/AWDF-Prac-13)

---

## 🎯 Course Outcomes & Program Outcomes Mapping

| Parameter | Details |
| :--- | :--- |
| **Course Outcome (CO)** | **CO6**: Integrate an external AI service into an existing web application and understand responsible AI usage. |
| **Program Outcomes (PO)** | **PO3** (Design/development of solutions), **PO5** (Modern tool usage), **PO12** (Life-long learning and ethical engineering practice). |
| **Cognitive Level** | Applying (Level 3), Evaluating (Level 5). |

---

## 📋 Table of Contents
1. [Objective & Problem Statement](#-objective--problem-statement)
2. [AI System Architecture](#-ai-system-architecture)
3. [Key Questions & Analysis](#-key-questions--analysis)
4. [Supplementary Problems Implemented](#-supplementary-problems-implemented)
5. [Implementation Walkthrough](#-implementation-walkthrough)
   - [Backend AI Service & Security Isolation](#1-backend-ai-service--security-isolation)
   - [Rate Limiting Middleware](#2-rate-limiting-middleware)
   - [Frontend UI Integration & Loading State](#3-frontend-ui-integration--loading-state)
   - [Graceful Degradation & Failure Verification](#4-graceful-degradation--failure-verification)
6. [Visual Evidence & Screenshots](#-visual-evidence--screenshots)
7. [Troubleshooting Guide](#-troubleshooting-guide)
8. [Viva Voce Questions & Answers](#-viva-voce-questions--answers)
9. [How to Run Locally](#-how-to-run-locally)

---

## 🎯 Objective & Problem Statement

### Objective
To integrate a third-party Generative AI service (OpenAI API / Google Gemini API) into the full-stack Task Management application, ensure server-side API key isolation, implement graceful degradation upon upstream failure, and enforce responsible AI governance.

### Problem Statement
1. Add an AI-powered capability to the Task Management application that generates a structured technical description, acceptance criteria, and suggested priority based on the task title.
2. The AI API key must be quarantined **strictly on the backend** inside `.env`, never exposed to the frontend browser bundle or network traffic.
3. Handle upstream API errors and network disruptions gracefully: if the AI call times out, returns HTTP 401, or exhausts its quota, the core application must continue to function normally without crashing.
4. Display the AI response meaningfully in the React UI as an **editable proposal** that the user can accept, alter, or reject, accompanied by a prominent AI disclaimer.
5. Fulfill all supplementary problems: frontend loading state, per-task rate limiting (max 1 AI request per minute), and responsible data governance.

---

## 🏗️ AI System Architecture

```
                    React 18 Frontend
             ┌─────────────────────────────┐
             │ User enters Task Title      │
             │ Clicks "✨ Generate with AI" │
             └──────────────┬──────────────┘
                            │ POST /api/ai/generate-description
                            │ (No API key on frontend)
                            ▼
                   Express.js Backend
             ┌─────────────────────────────┐
             │ 1. Rate Limiter Middleware   │ ──> (If < 60s: HTTP 429 Retry-After)
             │ 2. Read Server-Side .env     │
             │    (OPENAI_API_KEY / GEMINI) │
             └──────────────┬──────────────┘
                            │ HTTPS Outbound Request (Backend to AI Provider)
                            ▼
         ┌─────────────────────────────────────┐
         │ External AI Provider                │
         │ (OpenAI gpt-4o-mini / Gemini Flash) │
         └──────────────────┬──────────────────┘
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
       [API Error / Offline]          [API Success 200 OK]
  ┌─────────────────────────────┐┌─────────────────────────────┐
  │ Graceful Degradation Engine ││ Parse Model Completion JSON │
  │ Contextual Local Fallback   ││ (Structured Action Items)   │
  └──────────────┬──────────────┘└──────────────┬──────────────┘
                 │                              │
                 └──────────────┬───────────────┘
                                │ JSON Response: { description, fallback, disclaimer }
                                ▼
                    React 18 Frontend Form
             ┌─────────────────────────────────────────────────┐
             │ 1. Populates Editable Description Textarea       │
             │ 2. Updates Suggested Priority Dropdown          │
             │ 3. Displays Visible Disclaimer Banner           │
             │ 4. Allows Student/User to Freely Edit & Save    │
             └─────────────────────────────────────────────────┘
```

---

## 💡 Key Questions & Analysis

### Q1: Why must the AI API key be called from the backend rather than directly from the React frontend?
1. **Client-Side Asset Exposure**: React code runs inside the user's web browser. Any environment variable prefixed with `VITE_` or embedded into frontend JavaScript bundles is bundled into plain-text static assets (`dist/assets/index-*.js`). Anyone can open Chrome DevTools, inspect the source, or inspect the Network tab to extract the raw secret key.
2. **Financial Theft and Quota Depletion**: Publicly exposed OpenAI or Gemini API keys are scraped by automated botnets within minutes of being pushed or served. Malicious actors use stolen keys to run expensive high-throughput completions, exhausting credit balances or generating thousands of dollars in unauthorized charges.
3. **Absence of Rate Limiting and Abuse Controls**: If the browser directly contacts the AI provider, the application owner cannot enforce authentication checks, per-user rate limits, prompt moderation, or usage auditing. Routing all AI calls through our Express backend ensures that requests are strictly authenticated, rate-limited, and sanitized.

### Q2: What does 'graceful degradation' mean in this context, and why does it matter for a feature that depends on a third-party service outside your control?
* **Definition of Graceful Degradation**: Graceful degradation is a software design philosophy where a system maintains core functionality and continues to operate smoothly when non-critical components or external dependencies fail, rather than suffering a catastrophic crash.
* **Why It Matters for Third-Party AI Services**:
  - **Uncontrollable Upstream Dependencies**: External AI APIs can experience network latency spikes, rate limiting (HTTP 429), server outages (HTTP 500/503), authentication invalidations (HTTP 401), or institutional quota exhaustion.
  - **Preserving Core Business Workflows**: The primary purpose of a Task Management application is to let users create and track tasks. If the AI suggestion endpoint fails, the user must **still be able to manually type a task description and click "Add Task"**.
  - **Implementation in This Application**: In `Practical-13/backend/services/aiService.js`, the AI call is wrapped in a strict `try/catch` block. If an error occurs, it catches the exception and immediately invokes `generateContextualFallback(title)`. The frontend displays the fallback breakdown with an amber badge (`🛡️ Graceful Fallback Active`), allowing the user to continue without a hitch.

### Q3: What are the privacy and governance implications of sending task data to an external AI API, and what kind of data should never be sent this way?
* **Privacy & Governance Implications**:
  1. **Model Training & Data Ingestion**: Standard free-tier consumer AI APIs may use submitted prompts to train or fine-tune future model iterations unless explicitly opted out via enterprise zero-data-retention agreements.
  2. **Regulatory Compliance (GDPR, HIPAA, FERPA)**: Transmitting user information to third-party cloud servers constitutes an international data transfer under GDPR, requiring explicit user consent, Data Protection Agreements (DPAs), and strict data residency compliance.
  3. **Multi-Tenant Leakage**: Unsanitized internal company data sent to public LLMs could potentially leak into model outputs served to other users.
* **Data That Must NEVER Be Sent to External AI APIs**:
  - **Credentials & Secrets**: Passwords, API tokens, JWT secrets, private SSH keys, and cryptographic certificates.
  - **Personally Identifiable Information (PII)**: Social security numbers, national identity numbers, home addresses, phone numbers, and full dates of birth.
  - **Protected Health & Financial Data**: Credit card numbers, bank account numbers, medical records, and diagnostic notes (HIPAA violations).
  - **Proprietary Intellectual Property**: Trade secrets, unreleased source code, proprietary algorithms, and confidential corporate communications.

---

## 🚀 Supplementary Problems Implemented

### 1. Frontend Animated Loading State
- Integrated an animated pulsing spinner (`RefreshCw` / `Loader2`) and visual indicator inside `Practical-13/frontend/src/components/TaskForm.jsx`:
  `🧠 Analyzing task title and generating technical breakdown...`
- The "Generate" and "Add Task" buttons are disabled while awaiting completion to prevent double-dispatch and user confusion.

### 2. Backend Rate Limiting Protection (HTTP 429)
- Implemented `Practical-13/backend/middleware/aiRateLimiter.js`:
  - Enforces a strict maximum of **1 AI generation request per 60 seconds** per client IP / user.
  - Returns HTTP status `429 Too Many Requests` with a standard `Retry-After` header.
  - Displays a clean amber alert toast in the React UI with the exact remaining cooldown seconds.

### 3. Clear Visible UI Disclaimer & Editable Agency
- Prominently displays an amber disclaimer banner under the description field:
  `⚠️ AI-generated suggestion: Please review and verify accuracy before saving.`
- Populates the generated content directly into a standard `<textarea>` so that the user retains 100% control to edit, supplement, or delete any suggested item.

---

## 🛠️ Implementation Walkthrough

### 1. Backend AI Service & Security Isolation
Located at `Practical-13/backend/services/aiService.js`:
- Supports both OpenAI API (`gpt-4o-mini`) and Google Gemini API (`gemini-1.5-flash`).
- Secrets stored strictly in `backend/.env` (excluded via `.gitignore`):
  ```env
  OPENAI_API_KEY=your_key_here
  OPENAI_MODEL=gpt-4o-mini
  GEMINI_API_KEY=your_gemini_key_here
  ```
- Implements `generateTaskDescription(title)`:
  - First attempts configured external model using native `fetch` with an 8-second `AbortController` timeout.
  - In the event of network failure or invalid credentials, smoothly routes to the contextual fallback engine.

### 2. Rate Limiting Middleware
Located at `Practical-13/backend/middleware/aiRateLimiter.js`:
```javascript
export function aiRateLimiter(req, res, next) {
  const clientIdentifier = req.user?.id || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();
  const lastRequestTime = requestTimestamps.get(clientIdentifier);

  if (lastRequestTime && (now - lastRequestTime < 60000)) {
    const waitSeconds = Math.ceil((60000 - (now - lastRequestTime)) / 1000);
    res.setHeader('Retry-After', waitSeconds);
    return res.status(429).json({
      success: false,
      message: `Rate limit reached: Maximum 1 AI request per minute. Please wait ${waitSeconds} seconds.`,
      retryAfterSeconds: waitSeconds
    });
  }

  requestTimestamps.set(clientIdentifier, now);
  next();
}
```

### 3. Frontend UI Integration & Loading State
Located at `Practical-13/frontend/src/components/TaskForm.jsx`:
- Added "✨ Generate with AI" button with gradient styling.
- Dynamically receives structured suggestions from `/api/ai/generate-description`.
- Implemented `AIAssistantModal.jsx` accessible from the top navigation bar for evaluating model status, rate limits, and governance policies in real time.

### 4. Graceful Degradation & Failure Verification
Located at `Practical-13/backend/controllers/aiController.js`:
- Fulfills Step 6 of the syllabus:
  `POST /api/ai/simulate-failure` simulates an upstream 401 Unauthorized or disconnected AI service.
- The backend catches the failure, logs the issue, and returns a reliable fallback description without a 500 error or application crash.

---

## 📸 Visual Evidence & Screenshots

| Screenshot | Description | File Link |
| :--- | :--- | :--- |
| **01. AI Generate Button** | Task form displaying "✨ Generate with AI" button integrated alongside title and priority fields. | [View Screenshot](file:///E:/AWDF/Practical-13/ss/01_ai_generate_button.png) |
| **02. Frontend Loading State** | Responsive loading spinner and status banner informing user of AI generation progress. | [View Screenshot](file:///E:/AWDF/Practical-13/ss/02_ai_loading_state.png) |
| **03. AI Generated Suggestion** | Structured technical criteria populated into editable textarea with visible AI disclaimer. | [View Screenshot](file:///E:/AWDF/Practical-13/ss/03_ai_generated_suggestion.png) |
| **04. Graceful Degradation** | Application continuing to function smoothly under simulated API failure / offline fallback mode. | [View Screenshot](file:///E:/AWDF/Practical-13/ss/04_graceful_degradation_fallback.png) |
| **05. Rate Limit Protection** | Backend rate limiter intercepting repeated requests within 60s with HTTP 429 and countdown timer. | [View Screenshot](file:///E:/AWDF/Practical-13/ss/05_ai_rate_limit_protection.png) |
| **06. Test Suite Terminal** | Local Node.js test runner verifying all 7 automated unit and integration tests passing. | [View Screenshot](file:///E:/AWDF/Practical-13/ss/06_ai_backend_endpoint_test.png) |

---

## 🔧 Troubleshooting Guide

| Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| **401 Unauthorized from OpenAI / Gemini** | Invalid, expired, or missing API key in `backend/.env`. | Verify that `OPENAI_API_KEY` or `GEMINI_API_KEY` is correctly defined in `.env` without surrounding quotes or whitespace. |
| **API key visible in browser DevTools Network tab** | AI API was requested directly from frontend code instead of proxying through Express. | Ensure frontend only calls `http://localhost:5000/api/ai/generate-description`. The backend performs the outbound HTTPS call to the AI provider. |
| **Application crashes when AI call fails** | Missing `try/catch` block around asynchronous `fetch()` or SDK call. | Wrap the AI request in a `try/catch` block inside `aiService.js` and return a fallback object. |
| **Rate limit / quota exceeded error (HTTP 429)** | Too many requests dispatched in a short window across lab stations. | Respect the 60-second cooldown window enforced by `aiRateLimiter.js`. |

---

## 🎓 Viva Voce Questions & Answers

### 1. What is the role of an API proxy pattern in AI integration?
**Answer:** The Express backend acts as a secure reverse API proxy. The React frontend interacts solely with our controlled `/api/ai` endpoints. The backend attaches sensitive authentication headers (`Authorization: Bearer <KEY>`), filters the prompt to sanitize private data, executes rate limiting, logs audit telemetry, and handles upstream errors before sending a sanitized JSON response to the browser.

### 2. How does temperature affect AI responses in a task management context?
**Answer:** Temperature controls the randomness/creativity of the model's token sampling:
- **Low temperature (0.0 to 0.3)**: Highly deterministic, focused, and repeatable. Best for strict classification (e.g. priority assignment).
- **Medium temperature (0.6 to 0.7)**: Balanced creativity and precision. Ideal for synthesizing structured task descriptions and acceptance criteria.
- **High temperature (0.9 to 1.2)**: Highly creative but prone to hallucination. Unsuitable for technical task tracking.

### 3. Why should AI output be treated as an "editable proposal" rather than authoritative truth?
**Answer:** Large Language Models are probabilistic and prone to hallucinations, generating plausible-sounding but technically inaccurate dependencies or out-of-scope tasks. Treating AI generation as an *editable suggestion* preserves human-in-the-loop oversight, ensuring the software engineer remains responsible for their code's architecture.

### 4. How does the rate limiter protect both the application and the third-party account?
**Answer:** Third-party AI providers charge on a per-token basis and enforce strict tier-based rate limits (Requests Per Minute / Tokens Per Minute). Without a rate limiter, a malicious user or infinite loop in the frontend could exhaust the entire project budget or trigger an account suspension. Our middleware limits clients to 1 request per 60 seconds, buffering the upstream API.

---

## 💻 How to Run Locally

### 1. Configure Environment Variables
Inside `Practical-13/backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskdb_p13
JWT_SECRET=supersecret_jwt_key_practical13_awdf_2026
OPENAI_API_KEY=your_key_here
```
*(If no API key is provided, the application automatically runs in Graceful Degradation Mode).*

### 2. Start Backend Server
```bash
cd backend
npm start
```

### 3. Start Frontend Client
```bash
cd frontend
npm run dev
```

### 4. Run Automated AI Test Suite
```bash
cd backend
npm test
```

---
*Developed for CHARUSAT B.Tech ITUE301 Advanced Web Development Frameworks Course.*
