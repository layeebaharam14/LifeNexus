import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../../config/environment.js';
import { logger } from '../../utils/logger.js';
import {
  SYSTEM_DOCUMENT_UNDERSTANDING_PROMPT,
  buildDocumentUnderstandingPrompt,
} from './prompts/documentUnderstandingPrompt.js';
import { DocumentUnderstandingResult } from './schemas/documentUnderstandingSchema.js';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;
  private mockProvider: ((text: string, filename: string) => Promise<any>) | null = null;

  constructor() {
    this.modelName = ENV.GEMINI_MODEL || 'gemini-1.5-flash';
    if (ENV.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    }
  }

  /**
   * For automated testing: Allows setting a mock provider to test AI pipelines without live API charges.
   */
  public setMockProvider(mock: ((text: string, filename: string) => Promise<any>) | null): void {
    this.mockProvider = mock;
  }

  /**
   * Analyze document text using Google Gemini (or deterministic offline parser when key is unset) and return parsed JSON.
   */
  public async generateDocumentUnderstanding(
    extractedText: string,
    filename: string
  ): Promise<any> {
    // 1. Check if mock provider is set (e.g. during unit tests)
    if (this.mockProvider) {
      const result = await this.mockProvider(extractedText, filename);
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
      return result;
    }

    // 2. Safe length truncation for very large documents
    let textToProcess = extractedText;
    if (textToProcess.length > ENV.MAX_DOCUMENT_TEXT_CHARS) {
      logger.warn(
        `Document text exceeds max char limit (${textToProcess.length} > ${ENV.MAX_DOCUMENT_TEXT_CHARS}). Truncating for AI prompt.`
      );
      textToProcess = textToProcess.substring(0, ENV.MAX_DOCUMENT_TEXT_CHARS) + '\n\n[...TEXT TRUNCATED DUE TO SIZE LIMIT...]';
    }

    // 3. If GEMINI_API_KEY is not configured in development, use deterministic semantic extractor
    if (!ENV.GEMINI_API_KEY) {
      logger.info(`GEMINI_API_KEY not set. Using local deterministic semantic extractor for ${filename}`);
      return this.generateDeterministicUnderstanding(textToProcess, filename);
    }

    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    }

    try {
      logger.info(`Invoking Gemini (${this.modelName}) for document understanding: ${filename} (${textToProcess.length} chars)`);

      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: SYSTEM_DOCUMENT_UNDERSTANDING_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temperature for deterministic factual extraction
        },
      });

      const userPrompt = buildDocumentUnderstandingPrompt(textToProcess, filename);
      const result = await model.generateContent(userPrompt);
      const response = await result.response;
      const rawJson = response.text();

      if (!rawJson || rawJson.trim().length === 0) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsed = JSON.parse(rawJson);
      return parsed;
    } catch (error: any) {
      logger.error(`Gemini Document Understanding failed for ${filename}:`, error?.message || error);
      throw new Error(`AI Document Understanding failed: ${error?.message || 'Gemini processing error'}`);
    }
  }

  /**
   * Deterministic semantic heuristic fallback when running in development/test without an API key
   */
  public generateDeterministicUnderstanding(text: string, filename: string): any {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const lowerText = text.toLowerCase();

    // 1. Classification
    let docType = 'other';
    let conf = 0.85;
    if (lowerText.includes('invoice') || lowerText.includes('bill to') || lowerText.includes('tax invoice')) {
      docType = 'invoice';
      conf = 0.95;
    } else if (lowerText.includes('warranty') || lowerText.includes('guarantee')) {
      docType = 'warranty';
      conf = 0.95;
    } else if (lowerText.includes('receipt') || lowerText.includes('payment receipt')) {
      docType = 'receipt';
      conf = 0.95;
    } else if (lowerText.includes('certificate') || lowerText.includes('certified that')) {
      docType = 'certificate';
      conf = 0.95;
    } else if (lowerText.includes('ticket') || lowerText.includes('flight') || lowerText.includes('boarding pass')) {
      docType = 'travel';
      conf = 0.92;
    } else if (lowerText.includes('policy') || lowerText.includes('insurance')) {
      docType = 'insurance';
      conf = 0.95;
    } else if (lowerText.includes('resume') || lowerText.includes('curriculum vitae')) {
      docType = 'resume';
      conf = 0.95;
    }

    const entities: any[] = [];
    const dates: any[] = [];
    const amounts: any[] = [];
    const events: any[] = [];
    const identifiers: any[] = [];
    const relationships: any[] = [];

    // Extract Entities from common patterns
    for (const line of lines) {
      if (/^(?:Seller|Vendor|Merchant|Company|Store):\s*(.+)/i.test(line)) {
        const match = line.match(/^(?:Seller|Vendor|Merchant|Company|Store):\s*(.+)/i);
        if (match && match[1]) {
          entities.push({
            name: match[1].trim(),
            type: 'ORGANIZATION',
            normalizedName: match[1].trim(),
            confidence: 0.95,
            evidence: line,
          });
        }
      } else if (/^(?:Buyer|Customer|Patient|Name|Employee|Passenger):\s*(.+)/i.test(line)) {
        const match = line.match(/^(?:Buyer|Customer|Patient|Name|Employee|Passenger):\s*(.+)/i);
        if (match && match[1]) {
          entities.push({
            name: match[1].trim(),
            type: 'PERSON',
            normalizedName: match[1].trim(),
            confidence: 0.95,
            evidence: line,
          });
        }
      } else if (/^(?:Item|Product|Model|Device|Asset):\s*(.+)/i.test(line)) {
        const match = line.match(/^(?:Item|Product|Model|Device|Asset):\s*(.+)/i);
        if (match && match[1]) {
          entities.push({
            name: match[1].trim(),
            type: 'PRODUCT',
            normalizedName: match[1].trim(),
            confidence: 0.95,
            evidence: line,
          });
        }
      }

      // Dates
      const dateMatch = line.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}-\d{2}-\d{2})/i);
      if (dateMatch) {
        let type = 'OTHER';
        if (line.toLowerCase().includes('expir') || line.toLowerCase().includes('valid until') || line.toLowerCase().includes('due')) {
          type = 'EXPIRY';
        } else if (line.toLowerCase().includes('invoice') || line.toLowerCase().includes('purchase') || line.toLowerCase().includes('order') || line.toLowerCase().includes('date')) {
          type = 'PURCHASE';
        }
        dates.push({
          value: dateMatch[1],
          type,
          precision: 'DAY',
          confidence: 0.95,
          evidence: line,
        });
      }

      // Amounts
      const amountMatch = line.match(/(?:[₹$€£]\s*([\d,]+(?:\.\d{2})?)|([\d,]+(?:\.\d{2})?)\s*(?:INR|USD|EUR|GBP))/i);
      if (amountMatch) {
        const rawNum = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
        const val = parseFloat(rawNum);
        if (!isNaN(val)) {
          let currency = 'INR';
          if (line.includes('$') || line.includes('USD')) currency = 'USD';
          else if (line.includes('€') || line.includes('EUR')) currency = 'EUR';
          else if (line.includes('£') || line.includes('GBP')) currency = 'GBP';

          amounts.push({
            value: val,
            currency,
            type: 'PURCHASE',
            confidence: 0.95,
            evidence: line,
          });
        }
      }

      // Identifiers
      const idMatch = line.match(/(?:Invoice|Policy|Order|Serial|ID|Booking|Certificate)\s*(?:#|No|Number)?[:\s]+([A-Z0-9\-_]{4,})/i);
      if (idMatch) {
        let idType = 'other';
        if (line.toLowerCase().includes('invoice')) idType = 'invoice_number';
        else if (line.toLowerCase().includes('policy')) idType = 'policy_number';
        else if (line.toLowerCase().includes('order')) idType = 'order_id';
        else if (line.toLowerCase().includes('serial')) idType = 'serial_number';

        identifiers.push({
          type: idType,
          value: idMatch[1],
          confidence: 0.95,
          evidence: line,
        });
      }
    }

    // Default entity if none parsed
    if (entities.length === 0) {
      entities.push({
        name: filename.replace(/\.[^/.]+$/, ''),
        type: 'DOCUMENT',
        normalizedName: filename.replace(/\.[^/.]+$/, ''),
        confidence: 0.8,
        evidence: `Source document filename: ${filename}`,
      });
    }

    // Relationships
    if (entities.length >= 2) {
      relationships.push({
        from: entities[0].name,
        relationship: 'related_to',
        to: entities[1].name,
        confidence: 0.9,
        evidence: `Extracted co-occurrence in ${filename}`,
      });
    }

    // Events
    if (dates.length > 0) {
      events.push({
        title: `${docType.toUpperCase()} Record`,
        date: dates[0].value,
        datePrecision: 'DAY',
        description: `Document processed with dated anchor ${dates[0].value}`,
        confidence: 0.9,
        evidence: dates[0].evidence,
      });
    }

    return {
      documentClassification: {
        type: docType,
        confidence: conf,
      },
      summary: `Analyzed ${docType} document "${filename}" containing ${entities.length} entities and ${amounts.length} financial records.`,
      entities,
      dates,
      amounts,
      events,
      identifiers,
      relationships,
    };
  }
}

export const geminiService = new GeminiService();
