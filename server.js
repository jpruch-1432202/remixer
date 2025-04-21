import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import remixHandler from './api/remix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// API route for remixing text
app.post('/api/remix', remixHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 