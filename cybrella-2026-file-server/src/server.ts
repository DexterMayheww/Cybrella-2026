import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

const app = express();

// 1. DYNAMIC CONFIGURATION
// On Linux, you will set these in a .env file or via terminal
const PORT = process.env.PORT || 5000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

// 2. ROBUST CORS
// In production, you'll want to restrict this to your actual domain
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*', 
  methods: ['GET', 'POST']
}));

// 3. ABSOLUTE PATHING
// This prevents "folder not found" errors when running via PM2 on Linux
const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_ROOT)) {
  fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(UPLOADS_ROOT));

const ALLOWED_FOLDERS = ['posters', 'qr_codes', 'payment_proofs', 'misc', 'videos', 'identification'];

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const requestedFolder = String(req.query.folder || 'misc').toLowerCase().trim();
    const folderName = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'misc';
    
    const targetPath = path.join(UPLOADS_ROOT, folderName);

    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    cb(null, targetPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB Global Limit
});

// 4. DYNAMIC URL GENERATION
app.post('/upload', upload.single('photo'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const requestedFolder = String(req.query.folder || 'misc').toLowerCase().trim();
  const folderName = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'misc';

  // Uses PUBLIC_URL so it returns https://uploads.example.com on Linux
  const fileUrl = `${PUBLIC_URL}/uploads/${folderName}/${req.file.filename}`;
  
  // console.log(`[FILE_SERVER] Saved: ${folderName}/${req.file.filename}`);
  return res.json({ url: fileUrl });
});

app.get('/files', (req: Request, res: Response) => {
  const requestedFolder = String(req.query.folder || 'misc').toLowerCase().trim();
  const folderName = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'misc';
  const targetPath = path.join(UPLOADS_ROOT, folderName);
  
  if (!fs.existsSync(targetPath)) return res.json({ files: [] });

  try {
    const files = fs.readdirSync(targetPath);
    // Maps to the Public URL
    const fileUrls = files.map(file => `${PUBLIC_URL}/uploads/${folderName}/${file}`);
    return res.json({ files: fileUrls });
  } catch (err) {
    return res.status(500).json({ error: 'Read error' });
  }
});

app.listen(PORT, () => {
  console.log(`
  🌐 FILE SERVER ONLINE
  Mode: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  Public URL: ${PUBLIC_URL}
  Upload Path: ${UPLOADS_ROOT}
  `);
});