import fs from 'fs';
import pdf from 'pdf-parse';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GazetteEntrySchema = z.object({
  entries: z.array(z.object({
    notice_number: z.string(),
    category: z.enum(['Land Deregistration', 'Succession', 'Insolvency', 'Constitutional', 'General']),
    parties: z.array(z.string()),
    description: z.string(),
    date: z.string(),
    land_reference_numbers: z.array(z.string()).optional()
  }))
});

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

async function parseWithLLM(text: string) {
  const response = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: 'You are a legal data extractor specializing in the Kenya Gazette. Extract notices into structured JSON. Focus heavily on Land Deregistration notices and provide the LR numbers if available.'
      },
      {
        role: 'user',
        content: `Extract information from the following Gazette text: ${text.substring(0, 15000)}` // Chunking for context window
      }
    ],
    response_format: zodResponseFormat(GazetteEntrySchema, 'gazette_index'),
  });

  return response.choices[0].message.parsed;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Please provide a path to a Gazette PDF.');
    process.exit(1);
  }

  try {
    console.log('--- Extracting Text ---');
    const fullText = await extractTextFromPDF(filePath);
    
    console.log('--- Analyzing with LLM ---');
    const structuredData = await parseWithLLM(fullText);

    console.log(JSON.stringify(structuredData, null, 2));
    
    fs.writeFileSync('output.json', JSON.stringify(structuredData, null, 2));
    console.log('--- Extraction Complete. Saved to output.json ---');
  } catch (error) {
    console.error('Error processing PDF:', error);
  }
}

main();