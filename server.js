const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

console.log('Starting server with configuration:', {
  port: PORT,
  nodeEnv: process.env.NODE_ENV,
  apiKey: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Debug endpoint to verify server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API endpoint to verify work
app.post('/api/verify', upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]), async (req, res) => {
  // Log the received files for debugging
  console.log('Request received at /api/verify');
  console.log('Request files:', req.files);
  
  try {
    // Check if we received the required files
    if (!req.files || !req.files['beforeImage'] || !req.files['afterImage']) {
      console.error('Missing required files');
      return res.status(400).json({
        success: false,
        error: 'Missing required files (beforeImage and/or afterImage)'
      });
    }
    
    // Check if we received verification instructions
    if (!req.body.verificationInstructions) {
      console.error('Missing verification instructions');
      return res.status(400).json({
        success: false,
        error: 'Missing verification instructions'
      });
    }
    
    // Get the verification instructions from the request
    const verificationInstructions = req.body.verificationInstructions;
    
    const beforeImagePath = req.files['beforeImage'][0].path;
    const afterImagePath = req.files['afterImage'][0].path;
    
    // Convert images to base64
    const beforeImageBase64 = fs.readFileSync(beforeImagePath, { encoding: 'base64' });
    const afterImageBase64 = fs.readFileSync(afterImagePath, { encoding: 'base64' });
    
    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `I'm providing a 'before' and 'after' image for work verification. Please analyze these images based on the following specific instructions: ${verificationInstructions}

Please describe what changes have been made between the images and verify if the requested work appears to be completed based on visible changes. Focus on the specific elements mentioned in the instructions above. Provide a detailed assessment of the changes and conclude whether the work seems to be completed or not. Write a detailed report in bullet points about the relevant changes you notice.` },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${beforeImageBase64}`,
                detail: "high"
              }
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${afterImageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    // Clean up temporary files
    fs.unlinkSync(beforeImagePath);
    fs.unlinkSync(afterImagePath);

    res.json({
      success: true,
      analysis: response.choices[0].message.content
    });
  } catch (error) {
    console.error('Error verifying work:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
