# Kenya Gazette Index 2025

An LLM-powered parser designed to automate the extraction of legal notices and land deregistration updates from the weekly Kenya Gazette PDF publications.

## Features
- PDF text extraction using `pdf-parse`.
- Structured data extraction using OpenAI's GPT-4o with Zod schema validation.
- Categorization of notices (Land, Succession, Insolvency, etc.).
- Specifically targets Land Reference (LR) numbers for deregistration monitoring.

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your OpenAI API Key:
   ```env
   OPENAI_API_KEY=your_key_here
   ```

## Usage
Run the parser on a downloaded Gazette PDF:
```bash
npx ts-node parser.ts path/to/gazette.pdf
```