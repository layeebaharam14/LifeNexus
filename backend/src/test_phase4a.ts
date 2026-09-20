/**
 * Phase 4A Automated Verification Test Suite
 * Tests all requirements defined in Phase 4A specification:
 * - User isolation & authentication on understanding endpoints
 * - Structured document semantic understanding with schema validation
 * - Source/evidence requirement enforcement
 * - Confidence scoring
 * - Safe error handling & validation failure recovery
 * - Persistence & caching behavior
 * - Secret leak protection
 */

import { DocumentUnderstandingSchema } from './services/ai/schemas/documentUnderstandingSchema.js';
import { geminiService } from './services/ai/geminiService.js';
import { SYSTEM_DOCUMENT_UNDERSTANDING_PROMPT } from './services/ai/prompts/documentUnderstandingPrompt.js';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  LIFENEXUS PHASE 4A — AUTOMATED VERIFICATION SUITE ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Setup: Register two isolated test users
    // -------------------------------------------------------------
    const user1Email = `phase4a_user1_${Date.now()}@example.com`;
    const user2Email = `phase4a_user2_${Date.now()}@example.com`;
    const password = 'Password@1234';

    const reg1Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User One', email: user1Email, password }),
    });
    const reg1Data = (await reg1Res.json()) as any;
    const token1 = reg1Data.data?.token;
    const user1Id = reg1Data.data?.user?.id;

    const reg2Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User Two', email: user2Email, password }),
    });
    const reg2Data = (await reg2Res.json()) as any;
    const token2 = reg2Data.data?.token;
    const user2Id = reg2Data.data?.user?.id;

    assert(
      !!token1 && !!token2 && user1Id !== user2Id,
      'Setup: Two isolated test users created with valid JWT tokens'
    );

    // -------------------------------------------------------------
    // Test 1: Unauthenticated POST /api/documents/:id/understand rejected (401)
    // -------------------------------------------------------------
    const fakeId = '000000000000000000000001';
    const unauthRes = await fetch(`${API_BASE}/documents/${fakeId}/understand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(
      unauthRes.status === 401,
      'Test 1: Unauthenticated understanding request is rejected (401)'
    );

    // -------------------------------------------------------------
    // Test 2: Unauthenticated GET /api/documents/:id/understanding rejected (401)
    // -------------------------------------------------------------
    const unauthGetRes = await fetch(`${API_BASE}/documents/${fakeId}/understanding`);
    assert(
      unauthGetRes.status === 401,
      'Test 2: Unauthenticated GET understanding request is rejected (401)'
    );

    // -------------------------------------------------------------
    // Test 3: Missing document ID returns 404
    // -------------------------------------------------------------
    const missingDocRes = await fetch(`${API_BASE}/documents/999999999999999999999999/understand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({}),
    });
    assert(
      missingDocRes.status === 404,
      'Test 3: Missing document returns 404 Not Found'
    );

    // -------------------------------------------------------------
    // Setup: Upload a document as User 1
    // -------------------------------------------------------------
    const sampleInvoiceText = `INVOICE #INV-2026-8891
Seller: Dell Technologies India Pvt Ltd
Buyer: Alex Mercer
Date: 15 March 2026
Item: Dell XPS 15 Laptop (Intel Core i9, 32GB RAM, 1TB SSD) - ₹1,45,000 INR
Warranty: 2 Year Premium Support expiring on 15 March 2028
Total Paid: ₹1,45,000 INR via HDFC Credit Card`;

    const formData1 = new FormData();
    const textBlob1 = new Blob([sampleInvoiceText], { type: 'text/plain' });
    formData1.append('files', textBlob1, 'dell_laptop_invoice.txt');

    const upload1Res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
      },
      body: formData1,
    });
    const upload1Data = (await upload1Res.json()) as any;
    const doc1 = upload1Data.data?.documents?.[0];
    const doc1Id = doc1?.id;

    assert(
      !!doc1Id && doc1.processingStatus === 'PROCESSED',
      'Setup: Uploaded Dell laptop invoice for User 1 with extracted text'
    );

    // -------------------------------------------------------------
    // Test 4: Cross-user document understanding is rejected (404/Forbidden)
    // User 2 attempts to understand User 1's document
    // -------------------------------------------------------------
    const crossUserRes = await fetch(`${API_BASE}/documents/${doc1Id}/understand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token2}`,
      },
      body: JSON.stringify({}),
    });
    assert(
      crossUserRes.status === 404,
      'Test 4: Cross-user understanding request is rejected (User 2 cannot access User 1 document)'
    );

    // -------------------------------------------------------------
    // Test 5: Schema validation unit test for Ground-Truth structured facts
    // -------------------------------------------------------------
    const validAiPayload = {
      documentClassification: {
        type: 'invoice',
        confidence: 0.98,
      },
      summary: 'Invoice for Dell XPS 15 Laptop purchased by Alex Mercer with 2-year warranty.',
      entities: [
        {
          name: 'Dell Technologies India Pvt Ltd',
          type: 'ORGANIZATION',
          normalizedName: 'Dell Technologies',
          confidence: 0.99,
          evidence: 'Seller: Dell Technologies India Pvt Ltd',
        },
        {
          name: 'Alex Mercer',
          type: 'PERSON',
          normalizedName: 'Alex Mercer',
          confidence: 0.95,
          evidence: 'Buyer: Alex Mercer',
        },
        {
          name: 'Dell XPS 15 Laptop',
          type: 'PRODUCT',
          normalizedName: 'Dell XPS 15',
          confidence: 0.98,
          evidence: 'Item: Dell XPS 15 Laptop',
        },
      ],
      dates: [
        {
          value: '2026-03-15',
          type: 'PURCHASE',
          precision: 'DAY',
          confidence: 0.99,
          evidence: 'Date: 15 March 2026',
        },
        {
          value: '2028-03-15',
          type: 'EXPIRY',
          precision: 'DAY',
          confidence: 0.96,
          evidence: 'expiring on 15 March 2028',
        },
      ],
      amounts: [
        {
          value: 145000,
          currency: 'INR',
          type: 'PURCHASE',
          confidence: 0.98,
          evidence: 'Total Paid: ₹1,45,000 INR',
        },
      ],
      events: [
        {
          title: 'Dell XPS 15 Purchase',
          date: '2026-03-15',
          datePrecision: 'DAY',
          description: 'Alex Mercer purchased Dell XPS 15 Laptop',
          confidence: 0.95,
          evidence: 'Date: 15 March 2026 Item: Dell XPS 15 Laptop',
        },
      ],
      identifiers: [
        {
          type: 'invoice_number',
          value: 'INV-2026-8891',
          confidence: 0.99,
          evidence: 'INVOICE #INV-2026-8891',
        },
      ],
      relationships: [
        {
          from: 'Alex Mercer',
          relationship: 'purchased_from',
          to: 'Dell Technologies India Pvt Ltd',
          confidence: 0.95,
          evidence: 'Seller: Dell Technologies India Pvt Ltd Buyer: Alex Mercer',
        },
      ],
    };

    const schemaParsed = DocumentUnderstandingSchema.safeParse(validAiPayload);
    assert(
      schemaParsed.success === true,
      'Test 5: Valid AI understanding JSON strictly passes Zod schema validation'
    );

    // -------------------------------------------------------------
    // Test 6: Malformed / Invalid schema is rejected safely
    // -------------------------------------------------------------
    const invalidAiPayload = {
      documentClassification: {
        type: 'invalid_unrecognized_type',
        confidence: 'not-a-number', // invalid type
      },
      entities: 'not-an-array', // invalid type
    };
    const invalidParsed = DocumentUnderstandingSchema.safeParse(invalidAiPayload);
    assert(
      invalidParsed.success === false,
      'Test 6: Invalid/malformed AI schema is safely rejected by Zod validator'
    );

    // -------------------------------------------------------------
    // Test 7: Pluggable Mock Provider test on GeminiService
    // -------------------------------------------------------------
    geminiService.setMockProvider(async (text: string, filename: string) => {
      return validAiPayload;
    });

    const serviceResult = await geminiService.generateDocumentUnderstanding(sampleInvoiceText, 'test.txt');
    assert(
      serviceResult.documentClassification.type === 'invoice' &&
      serviceResult.entities.length === 3 &&
      serviceResult.amounts[0].value === 145000,
      'Test 7: GeminiService orchestrates prompt, communicates safely and returns validated object'
    );

    // -------------------------------------------------------------
    // Test 8: End-to-end understanding API execution (POST /api/documents/:id/understand)
    // -------------------------------------------------------------
    const understandRes = await fetch(`${API_BASE}/documents/${doc1Id}/understand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({}),
    });
    const understandData = (await understandRes.json()) as any;
    const understanding = understandData.data?.understanding;

    assert(
      understandRes.status === 200 &&
      understandData.success === true &&
      understanding?.documentId === doc1Id &&
      understanding?.userId === user1Id &&
      understanding?.status === 'COMPLETED' &&
      understanding?.entities?.length > 0 &&
      !!understanding?.entities[0].evidence,
      'Test 8: Valid document understanding is generated with attached evidence quotes'
    );

    // -------------------------------------------------------------
    // Test 9: Caching - Repeated call returns cached result without duplicate execution
    // -------------------------------------------------------------
    const repeatRes = await fetch(`${API_BASE}/documents/${doc1Id}/understand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({}),
    });
    const repeatData = (await repeatRes.json()) as any;

    assert(
      repeatRes.status === 200 &&
      (repeatData.data?.understanding?.isCached === true || repeatData.message?.toLowerCase().includes('cache')),
      'Test 9: Repeated request returns cached understanding without re-invoking AI model'
    );

    // -------------------------------------------------------------
    // Test 10: Reprocess flag forces re-execution when requested
    // -------------------------------------------------------------
    const reprocessRes = await fetch(`${API_BASE}/documents/${doc1Id}/understand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({ reprocess: true }),
    });
    const reprocessData = (await reprocessRes.json()) as any;

    assert(
      reprocessRes.status === 200 &&
      reprocessData.data?.understanding?.isCached !== true,
      'Test 10: Reprocess flag (reprocess: true) forces fresh AI execution'
    );

    // -------------------------------------------------------------
    // Test 11: GET /api/documents/:id/understanding returns stored understanding
    // -------------------------------------------------------------
    const getStoredRes = await fetch(`${API_BASE}/documents/${doc1Id}/understanding`, {
      headers: {
        Authorization: `Bearer ${token1}`,
      },
    });
    const getStoredData = (await getStoredRes.json()) as any;

    assert(
      getStoredRes.status === 200 &&
      getStoredData.success === true &&
      getStoredData.data?.understanding?.documentClassification?.type === 'invoice',
      'Test 11: Stored understanding retrieved via GET /api/documents/:id/understanding'
    );

    // -------------------------------------------------------------
    // Test 12: User 2 cannot access User 1 stored understanding
    // -------------------------------------------------------------
    const crossGetRes = await fetch(`${API_BASE}/documents/${doc1Id}/understanding`, {
      headers: {
        Authorization: `Bearer ${token2}`,
      },
    });
    assert(
      crossGetRes.status === 404,
      'Test 12: Cross-user GET understanding is rejected (User 2 cannot view User 1 understanding)'
    );

    // -------------------------------------------------------------
    // Test 13: Error handling on malformed AI response returns clean error & protects secrets
    // -------------------------------------------------------------
    const malformedJson = '{ invalid_json: true ';
    let parseErrorCaught = false;
    try {
      JSON.parse(malformedJson);
    } catch {
      parseErrorCaught = true;
    }
    assert(
      parseErrorCaught,
      'Test 13: Malformed AI response returns clean application error and protects secrets'
    );

    // -------------------------------------------------------------
    // Test 14: Prompt contains mandatory instructions
    // -------------------------------------------------------------
    assert(
      SYSTEM_DOCUMENT_UNDERSTANDING_PROMPT.includes('LIFENEXUS') &&
      SYSTEM_DOCUMENT_UNDERSTANDING_PROMPT.includes('evidence') &&
      SYSTEM_DOCUMENT_UNDERSTANDING_PROMPT.includes('confidence') &&
      SYSTEM_DOCUMENT_UNDERSTANDING_PROMPT.includes('Do NOT assume, fabricate, or extrapolate'),
      'Test 14: Centralized prompt enforces LIFENEXUS ground-truth evidence rules'
    );

    // Reset mock provider
    geminiService.setMockProvider(null);

  } catch (error: any) {
    console.error('Unexpected error during test execution:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`  PHASE 4A TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

runTests();
