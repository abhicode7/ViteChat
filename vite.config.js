import path from 'path';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

export default {
  plugins: [react()],
  base: '/ViteChat/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Pass environment variables to Vite
    'import.meta.env': JSON.stringify(process.env),
  },
};
