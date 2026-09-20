/**
 * Phase 3 Automated Verification Test Suite
 * Tests all 18 requirements defined in Phase 3 specification
 */

import fs from 'fs';
import path from 'path';

import { PDFDocument, StandardFonts } from 'pdf-lib';

const API_BASE = 'http://localhost:5000/api';

async function createValidPdfBuffer(textContent: string): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 400]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText(textContent, {
    x: 50,
    y: 350,
    size: 14,
    font,
  });
  const bytes = await doc.save();
  return Buffer.from(bytes);
}


async function runTests() {

  console.log('====================================================');
  console.log('  LIFENEXUS PHASE 3 — AUTOMATED VERIFICATION SUITE  ');
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
    // Test 17: Health endpoint still works

    // -------------------------------------------------------------
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = (await healthRes.json()) as any;
    assert(
      healthRes.ok && healthData.success && healthData.data?.status === 'healthy',
      'Test 17: Health endpoint still works (/api/health)'
    );

    // -------------------------------------------------------------
    // Test 18: Authentication registration and token issuance works for multiple users
    // -------------------------------------------------------------
    const user1Email = `test_user1_${Date.now()}@example.com`;
    const user2Email = `test_user2_${Date.now()}@example.com`;
    const password = 'Password@1234';

    const reg1Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User One',
        email: user1Email,
        password,
      }),
    });
    const reg1Data = (await reg1Res.json()) as any;
    const token1 = reg1Data.data?.token;
    const user1Id = reg1Data.data?.user?.id;

    const reg2Res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User Two',
        email: user2Email,
        password,
      }),
    });
    const reg2Data = (await reg2Res.json()) as any;
    const token2 = reg2Data.data?.token;
    const user2Id = reg2Data.data?.user?.id;

    assert(
      !!token1 && !!token2 && user1Id !== user2Id,
      'Test 18: Authentication registration and token issuance works for multiple users'
    );

    // -------------------------------------------------------------
    // Test 1: Unauthenticated upload is rejected (401)
    // -------------------------------------------------------------
    const formDataUnauth = new FormData();
    formDataUnauth.append('files', new Blob(['Sample text content']), 'test.txt');

    const unauthUploadRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formDataUnauth,
    });
    assert(
      unauthUploadRes.status === 401,
      'Test 1: Unauthenticated upload is rejected (401 Unauthorized)'
    );

    // -------------------------------------------------------------
    // Test 5: Empty (0-byte) file is rejected
    // -------------------------------------------------------------
    const formDataEmpty = new FormData();
    formDataEmpty.append('files', new Blob([]), 'empty.txt');

    const emptyRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataEmpty,
    });
    const emptyData = (await emptyRes.json()) as any;
    assert(
      !emptyData.success && (emptyRes.status === 400 || emptyData.error?.includes('empty')),
      'Test 5: Empty (0-byte) file is rejected with clear error'
    );

    // -------------------------------------------------------------
    // Test 3: Unsupported file type is rejected (.exe / binary)
    // -------------------------------------------------------------
    const formDataExe = new FormData();
    formDataExe.append('files', new Blob(['MZ\x90\x00\x03\x00\x00\x00']), 'malicious.exe');

    const exeRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataExe,
    });
    const exeData = (await exeRes.json()) as any;
    assert(
      !exeData.success && (exeRes.status === 400 || exeData.error?.includes('Unsupported')),
      'Test 3: Unsupported file type (.exe) is rejected with clear error'
    );

    // -------------------------------------------------------------
    // Test 4: Oversized file (>15MB limit) is rejected
    // -------------------------------------------------------------
    const oversizedBuffer = Buffer.alloc(16 * 1024 * 1024, 0x41); // 16MB buffer
    const formDataOversized = new FormData();
    formDataOversized.append('files', new Blob([oversizedBuffer], { type: 'text/plain' }), 'huge_document.txt');

    const oversizedRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataOversized,
    });
    const oversizedData = (await oversizedRes.json()) as any;
    assert(
      oversizedRes.status === 400 && !oversizedData.success,
      'Test 4: Oversized file (>15MB) is rejected with 400 Bad Request'
    );

    // -------------------------------------------------------------
    // Test 6 & 2: Authenticated TXT upload and deterministic text extraction works
    // -------------------------------------------------------------
    const sampleTxtContent = 'TAX INVOICE INV-2026-CR8921\nCustomer: Alex Morgan\nItem: ASUS Vivobook OLED\nAmount: Rs 68000';
    const formDataTxt = new FormData();
    formDataTxt.append('files', new Blob([sampleTxtContent], { type: 'text/plain' }), 'laptop_invoice.txt');

    const uploadTxtRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataTxt,
    });
    const uploadTxtData = (await uploadTxtRes.json()) as any;
    const doc1 = uploadTxtData.data?.documents?.[0];

    assert(
      uploadTxtRes.status === 201 &&
        doc1?.processingStatus === 'PROCESSED' &&
        doc1?.extractedText?.includes('INV-2026-CR8921') &&
        doc1?.extractionMethod === 'text',
      'Test 6 & 2: Authenticated TXT upload and deterministic text extraction works',
      `status: ${doc1?.processingStatus}, extracted: ${doc1?.extractedText}`
    );

    // -------------------------------------------------------------
    // Test 9 & 10: Document record schema integrity (id, originalName, mimeType, fileHash, PROCESSED status)
    // -------------------------------------------------------------
    assert(
      !!doc1?.id &&
        doc1?.originalName === 'laptop_invoice.txt' &&
        doc1?.mimeType === 'text/plain' &&
        doc1?.processingStatus === 'PROCESSED' &&
        doc1?.fileHash?.length === 64,
      'Test 9 & 10: Document record schema integrity (id, originalName, mimeType, fileHash, PROCESSED status)'
    );

    // -------------------------------------------------------------
    // Test 7: Native PDF text extraction works without external LLM
    // -------------------------------------------------------------
    const pdfText = 'FLIGHT TICKET BOARDING PASS AI-2026 Passenger Alex Morgan BOM to BLR';
    const pdfBuffer = await createValidPdfBuffer(pdfText);
    const formDataPdf = new FormData();
    formDataPdf.append('files', new Blob([pdfBuffer], { type: 'application/pdf' }), 'flight_ticket.pdf');

    const uploadPdfRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataPdf,
    });
    const uploadPdfData = (await uploadPdfRes.json()) as any;
    const docPdf = uploadPdfData.data?.documents?.[0];

    assert(
      uploadPdfRes.status === 201 &&
        docPdf?.processingStatus === 'PROCESSED' &&
        docPdf?.extractedText?.includes('FLIGHT TICKET') &&
        docPdf?.extractionMethod === 'pdf',
      'Test 7: Native PDF text extraction works without external LLM',
      `extractedText: ${docPdf?.extractedText}`
    );

    // -------------------------------------------------------------
    // Test 8: Image OCR pipeline routes and processes image file deterministically
    // -------------------------------------------------------------
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const formDataImg = new FormData();
    formDataImg.append('files', new Blob([pngBuffer], { type: 'image/png' }), 'receipt_screenshot.png');

    const uploadImgRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataImg,
    });
    const uploadImgData = (await uploadImgRes.json()) as any;
    const docImg = uploadImgData.data?.documents?.[0];

    assert(
      uploadImgRes.status === 201 &&
        docImg?.mimeType === 'image/png' &&
        (docImg?.processingStatus === 'PROCESSED' || docImg?.processingStatus === 'FAILED') &&
        docImg?.extractionMethod === 'ocr',
      'Test 8: Local image OCR pipeline routes and processes image file deterministically',
      `status: ${docImg?.processingStatus}, method: ${docImg?.extractionMethod}`
    );

    // -------------------------------------------------------------
    // Test 11: Document list returns only current user's documents
    // -------------------------------------------------------------
    const listRes1 = await fetch(`${API_BASE}/documents`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const listData1 = (await listRes1.json()) as any;
    const user1Docs = listData1.data?.documents || [];

    const listRes2 = await fetch(`${API_BASE}/documents`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    const listData2 = (await listRes2.json()) as any;
    const user2Docs = listData2.data?.documents || [];

    assert(
      user1Docs.length === 3 && user2Docs.length === 0,
      `Test 11: Document list strictly returns only authenticated user documents (User 1 has 3, User 2 has ${user2Docs.length})`
    );

    // -------------------------------------------------------------
    // Test 12: Document detail rejects another user's document ID (Isolation)
    // -------------------------------------------------------------
    const foreignDocDetailRes = await fetch(`${API_BASE}/documents/${doc1.id}`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      foreignDocDetailRes.status === 404,
      'Test 12: Document detail rejects cross-user access (returns 404 Not Found)'
    );

    // -------------------------------------------------------------
    // Test 13: Document content endpoint rejects another user's document ID
    // -------------------------------------------------------------
    const foreignDocContentRes = await fetch(`${API_BASE}/documents/${doc1.id}/content`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    assert(
      foreignDocContentRes.status === 404,
      'Test 13: Document content endpoint rejects cross-user access (returns 404 Not Found)'
    );

    // -------------------------------------------------------------
    // Test 15: Duplicate upload is detected per user
    // -------------------------------------------------------------
    const formDataDup = new FormData();
    formDataDup.append('files', new Blob([sampleTxtContent], { type: 'text/plain' }), 'laptop_invoice_copy.txt');

    const dupRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataDup,
    });
    const dupData = (await dupRes.json()) as any;
    const dupDoc = dupData.data?.documents?.[0];

    assert(
      dupRes.status === 201 && dupDoc?.isDuplicate === true && dupDoc?.id === doc1.id,
      'Test 15: User-scoped duplicate detection identifies matching SHA-256 hash and preserves original'
    );

    // -------------------------------------------------------------
    // Test 16: Same file can exist for two different users
    // -------------------------------------------------------------
    const formDataUser2 = new FormData();
    formDataUser2.append('files', new Blob([sampleTxtContent], { type: 'text/plain' }), 'laptop_invoice.txt');

    const user2UploadRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
      body: formDataUser2,
    });
    const user2UploadData = (await user2UploadRes.json()) as any;
    const docUser2 = user2UploadData.data?.documents?.[0];

    assert(
      user2UploadRes.status === 201 &&
        docUser2?.id !== doc1.id &&
        docUser2?.isDuplicate !== true,
      'Test 16: Two different users can upload the same file without collision or duplicate rejection across tenants'
    );

    // -------------------------------------------------------------
    // Test 14: Delete removes the user's document
    // -------------------------------------------------------------
    const deleteRes = await fetch(`${API_BASE}/documents/${docPdf.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token1}` },
    });
    const deleteData = (await deleteRes.json()) as any;

    const checkDeletedRes = await fetch(`${API_BASE}/documents/${docPdf.id}`, {
      headers: { Authorization: `Bearer ${token1}` },
    });


    assert(
      deleteRes.ok && deleteData.success && checkDeletedRes.status === 404,
      'Test 14: Delete removes the document record and denies subsequent access'
    );

    // Final summary
    console.log('\n====================================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runTests();
