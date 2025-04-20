# Work Verification Assistant

A web application that uses OpenAI's Vision API to verify completed work by comparing "before" and "after" images. This tool is particularly useful for industries such as construction, maintenance, and insurance, where visual verification of work completion is essential.

## Features

- Upload "before" and "after" images for comparison
- AI-powered analysis of the changes between images
- Detailed assessment of work completion status
- Clean, modern UI built with React and Bootstrap
- Node.js backend with Express

## Installation

1. Clone the repository (or navigate to the project directory)
2. Install backend dependencies:
   ```
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd client
   npm install
   ```
4. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

## Usage

1. Start the development server (both backend and frontend):
   ```
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`
3. Upload a "before" image (showing the area before work was done)
4. Upload an "after" image (showing the area after work was supposedly completed)
5. Click "Verify Work" to get an AI-powered analysis

## How It Works

The application sends both images to OpenAI's Vision API, which analyzes the differences and provides an assessment of the work completion. The API is prompted to focus on structural modifications, repairs, or installations visible in the images.

## Security Notes

- Store your OpenAI API key securely in the `.env` file, which should not be committed to version control
- Temporary uploaded images are automatically deleted from the server after processing

## Technologies Used

- **Frontend**: React, Bootstrap, Axios
- **Backend**: Node.js, Express
- **API**: OpenAI Vision API (GPT-4 Vision)
