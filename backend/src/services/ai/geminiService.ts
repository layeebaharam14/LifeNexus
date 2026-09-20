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
      conf = 0.98;
    } else if (lowerText.includes('warranty') || lowerText.includes('guarantee')) {
      docType = 'warranty';
      conf = 0.96;
    } else if (lowerText.includes('receipt') || lowerText.includes('payment receipt')) {
      docType = 'receipt';
      conf = 0.97;
    } else if (lowerText.includes('certificate') || lowerText.includes('certified that')) {
      docType = 'certificate';
      conf = 0.96;
    } else if (lowerText.includes('ticket') || lowerText.includes('flight') || lowerText.includes('boarding pass')) {
      docType = 'travel';
      conf = 0.94;
    } else if (lowerText.includes('policy') || lowerText.includes('insurance')) {
      docType = 'insurance';
      conf = 0.96;
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

    // Track typed entities for relationship generation
    let personEntity: string | null = null;
    let orgEntity: string | null = null;
    let placeEntity: string | null = null;
    let productEntity: string | null = null;

    for (const line of lines) {
      // ORGANIZATION (Companies, Retailers, Issuers, Merchants)
      if (/^(?:RETAILER|Seller|Vendor|Merchant|Company|Employer|Issuer|Insurer|Bank):\s*(.+)/i.test(line)) {
        const match = line.match(/^(?:RETAILER|Seller|Vendor|Merchant|Company|Employer|Issuer|Insurer|Bank):\s*(.+)/i);
        if (match && match[1]) {
          const val = match[1].trim();
          orgEntity = val;
          entities.push({
            name: val,
            type: 'ORGANIZATION',
            normalizedName: val,
            confidence: 0.98,
            evidence: line,
          });
        }
      }
      // PLACE (Physical store branches, addresses, locations, cities, venues)
      else if (/^(?:Store|Location|Address|Place|Branch|Venue|City|Airport):\s*(.+)/i.test(line)) {
        const match = line.match(/^(?:Store|Location|Address|Place|Branch|Venue|City|Airport):\s*(.+)/i);
        if (match && match[1]) {
          const val = match[1].trim();
          placeEntity = val;
          entities.push({
            name: val,
            type: 'PLACE',
            normalizedName: val,
            confidence: 0.96,
            evidence: line,
          });
        }
      }
      // PERSON (Customer, Buyer, Name, Passenger, Employee)
      else if (/^(?:Customer|Buyer|Name|Patient|Employee|Passenger|Recipient):\s*(.+)/i.test(line)) {
        const match = line.match(/^(?:Customer|Buyer|Name|Patient|Employee|Passenger|Recipient):\s*(.+)/i);
        if (match && match[1]) {
          const val = match[1].trim();
          personEntity = val;
          entities.push({
            name: val,
            type: 'PERSON',
            normalizedName: val,
            confidence: 0.97,
            evidence: line,
          });
        }
      }
      // PRODUCT (Item, Device, Model, Asset, Vehicle, Subscription)
      else if (/^(?:Item|Product|Model|Device|Asset|Vehicle|Subscription):\s*(.+)/i.test(line)) {
        const match = line.match(/^(?:Item|Product|Model|Device|Asset|Vehicle|Subscription):\s*(.+)/i);
        if (match && match[1]) {
          const val = match[1].trim();
          productEntity = val;
          entities.push({
            name: val,
            type: 'PRODUCT',
            normalizedName: val,
            confidence: 0.98,
            evidence: line,
          });
        }
      }

      // DATES (Explicit dates and regex date patterns)
      const dateHeaderMatch = line.match(/^(?:Date|Invoice Date|Purchase Date|Issue Date|Order Date|Issued|Expiry Date|Due Date):\s*(.+)/i);
      if (dateHeaderMatch && dateHeaderMatch[1]) {
        let type = 'PURCHASE';
        if (line.toLowerCase().includes('expir') || line.toLowerCase().includes('due')) type = 'EXPIRY';
        dates.push({
          value: dateHeaderMatch[1].trim(),
          type,
          precision: 'DAY',
          confidence: 0.99,
          evidence: line,
        });
      } else {
        const dateMatch = line.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s*\d{4})/i);
        if (dateMatch && !dates.some((d) => d.evidence === line)) {
          let type = 'OTHER';
          if (line.toLowerCase().includes('expir') || line.toLowerCase().includes('valid until') || line.toLowerCase().includes('due')) {
            type = 'EXPIRY';
          } else if (line.toLowerCase().includes('invoice') || line.toLowerCase().includes('purchase') || line.toLowerCase().includes('order')) {
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
      }

      // AMOUNTS
      const amountMatch = line.match(/(?:[₹$€£]\s*([\d,]+(?:\.\d{2})?)|([\d,]+(?:\.\d{2})?)\s*(?:INR|USD|EUR|GBP))/i);
      if (amountMatch) {
        const rawNum = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
        const val = parseFloat(rawNum);
        if (!isNaN(val)) {
          let currency = 'INR';
          if (line.includes('$') || line.includes('USD')) currency = 'USD';
          else if (line.includes('€') || line.includes('EUR')) currency = 'EUR';
          else if (line.includes('£') || line.includes('GBP')) currency = 'GBP';

          let type = 'PURCHASE';
          if (line.toLowerCase().includes('paid') || line.toLowerCase().includes('total')) {
            type = 'PAYMENT';
          } else if (line.toLowerCase().includes('gst') || line.toLowerCase().includes('tax')) {
            type = 'OTHER';
          }

          amounts.push({
            value: val,
            currency,
            type,
            confidence: 0.98,
            evidence: line,
          });
        }
      }

      // IDENTIFIERS
      const idMatch = line.match(/(?:Invoice\s*No|Invoice|Policy\s*No|Policy|Order\s*ID|Order|Serial\s*Number|Serial|GSTIN|ID|Booking|Certificate)\s*(?:#|No|Number)?[:\s]+([A-Z0-9\-_]{4,})/i);
      if (idMatch) {
        let idType = 'other';
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes('invoice')) idType = 'invoice_number';
        else if (lowerLine.includes('policy')) idType = 'policy_number';
        else if (lowerLine.includes('order')) idType = 'order_id';
        else if (lowerLine.includes('serial')) idType = 'serial_number';
        else if (lowerLine.includes('gstin')) idType = 'tax_id';

        identifiers.push({
          type: idType,
          value: idMatch[1].trim(),
          confidence: 0.98,
          evidence: line,
        });
      }
    }

    // Default entity fallback if none parsed
    if (entities.length === 0) {
      entities.push({
        name: filename.replace(/\.[^/.]+$/, ''),
        type: 'OTHER',
        normalizedName: filename.replace(/\.[^/.]+$/, ''),
        confidence: 0.8,
        evidence: `Source document filename: ${filename}`,
      });
    }

    // Grounded Relationships
    if (personEntity && orgEntity) {
      relationships.push({
        from: personEntity,
        relationship: 'purchased_from',
        to: orgEntity,
        confidence: 0.96,
        evidence: `Customer ${personEntity} transaction with ${orgEntity}`,
      });
    }
    if (productEntity && orgEntity) {
      relationships.push({
        from: productEntity,
        relationship: 'purchased_from',
        to: orgEntity,
        confidence: 0.95,
        evidence: `Item ${productEntity} purchased at ${orgEntity}`,
      });
    }
    if (orgEntity && placeEntity) {
      relationships.push({
        from: orgEntity,
        relationship: 'occurred_at',
        to: placeEntity,
        confidence: 0.96,
        evidence: `Store location ${placeEntity} for ${orgEntity}`,
      });
    }

    // Grounded Events
    if (dates.length > 0) {
      const primaryDate = dates[0].value;
      const primaryAmount = amounts.find((a) => a.type === 'PAYMENT' || a.type === 'PURCHASE');
      const amountStr = primaryAmount ? ` for ${primaryAmount.currency} ${primaryAmount.value.toLocaleString()}` : '';
      const subject = productEntity || `${docType.toUpperCase()}`;

      events.push({
        title: `${docType === 'invoice' ? 'Purchase' : docType.toUpperCase()} of ${subject}`,
        date: primaryDate,
        datePrecision: 'DAY',
        description: `${personEntity || 'User'} recorded ${docType} for ${subject}${amountStr} on ${primaryDate}.`,
        confidence: 0.95,
        evidence: dates[0].evidence,
      });
    }

    const summaryParts: string[] = [];
    summaryParts.push(`Analyzed ${docType} document "${filename}".`);
    if (productEntity && orgEntity) {
      summaryParts.push(`Details purchase of ${productEntity} from ${orgEntity}.`);
    } else if (entities.length > 0) {
      summaryParts.push(`Identified ${entities.length} entities and ${amounts.length} financial records.`);
    }

    return {
      documentClassification: {
        type: docType,
        confidence: conf,
      },
      summary: summaryParts.join(' '),
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
