import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    fs: {
      allow: [
        // Dev fallback: Allow direct filesystem access to original data folders via @fs
        '/home/youcef-bl/Documents/Prof_English/Adaptive-Blended-Assessment-/submission_journey_latest',
        '/home/youcef-bl/Documents/Prof_English/Adaptive-Blended-Assessment-/RUN_20260408_020438',
        // Allow public folder (main data source)
        '/home/youcef-bl/Documents/Prof_English/Adaptive-Blended-Assessment-/frontend/public',
      ],
    },
  },
});
