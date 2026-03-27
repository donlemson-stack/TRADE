<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DONLEMSONTRADE - Global Trade Expert

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1741ba91-945f-409c-b292-7c0c290d4a6d

## Run Locally

**Prerequisites:**  Node.js (v18 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

   You can get your API key from: https://aistudio.google.com/app/apikey

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser to: http://localhost:3000

## Features

- Chat Interface with document analysis
- Live Voice Consult (real-time audio conversation)
- Shipment Tracker
- Global Trade College with audio lessons
- News Feed
- Contact Management

## Troubleshooting

### Live Voice Consult Not Working

If the Live Voice Consult feature isn't working:

1. Ensure your `GEMINI_API_KEY` is set in `.env.local`
2. Grant microphone permissions when prompted by the browser
3. Check the browser console for detailed error messages
4. Verify you're using a supported browser (Chrome, Edge, or Safari)
5. Make sure you have a stable internet connection

The feature uses the Gemini 2.0 Flash Experimental model with native audio support.
