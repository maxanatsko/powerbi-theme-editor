import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import schemaPreprocessor from './src/vite-plugin-schema-preprocessor';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    schemaPreprocessor()
  ],
});