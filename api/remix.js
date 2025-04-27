import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

// Debug logging
console.log('Environment variables loaded:', {
  apiKeyExists: !!apiKey,
  apiKeyLength: apiKey?.length,
  apiKeyStart: apiKey?.substring(0, 10) + '...'
});

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: apiKey,
});

export default async function handler(req, res) {
  console.log('Received remix request:', { 
    method: req.method,
    bodyExists: !!req.body,
    textLength: req.body?.text?.length
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    console.log('Making request to Claude API...');
    const completion = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Please remix the following text in a creative and interesting way. Make it engaging while keeping the core message intact: "${text}"`
      }]
    });

    console.log('Received response from Claude API:', completion);
    
    if (completion && completion.content && completion.content[0]) {
      return res.status(200).json({ 
        remixedText: completion.content[0].text 
      });
    } else {
      console.error('Unexpected API response structure:', completion);
      return res.status(500).json({ 
        error: 'Unexpected API response structure',
        details: 'The API response did not contain the expected content'
      });
    }
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Failed to remix text',
      details: error.message
    });
  }
} 