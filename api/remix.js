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

const tweetsFromPostPrompt = `You are a social media expert and ghostwriter. 

You work for a popular blogger, and your job is to take their blog post and come up with a variety of tweets to share ideas from the post. 

Since you are a ghostwriter, you need to make sure to match the style, tone, and voice of the blog post as closely as possible. 

Remember, tweets cannot be longer than 280 characters. 

Please create at least 7 different tweets but no more than 10. 

Important formatting rules:
- Put each tweet on its own line
- Separate each tweet with exactly this text: "---TWEET_SEPARATOR---"
- Do not use any hashtags or emojis
- ***IMPORTANT: Output ONLY the tweets, with NO introduction, summary, or explanation. Do NOT say how many tweets you are providing.***


Here is the blog post:`;

export default async function tweetsFromPost(req, res) {
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
    console.log('Making request to Claude API with text:', text.substring(0, 100) + '...');
    console.log('API Key exists:', !!apiKey);
    console.log('Full prompt being sent:', `${tweetsFromPostPrompt} "${text}"`);
    
    const completion = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${tweetsFromPostPrompt} "${text}"`
      }]
    });

    console.log('Full Claude API response:', JSON.stringify(completion, null, 2));
    
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