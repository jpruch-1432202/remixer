import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tweetsFromPost from './api/remix.js';

console.log('Starting server...');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Add a test route
app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Server is running!' });
});

// API route for remixing text
app.post('/api/remix', tweetsFromPost);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Test route available at http://localhost:3000/test');
}); 