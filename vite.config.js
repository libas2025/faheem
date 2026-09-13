import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        collections: resolve(__dirname, 'collections.html'),
        measurements: resolve(__dirname, 'measurements.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        contact: resolve(__dirname, 'contact.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        terms: resolve(__dirname, 'terms.html'),
        measurementPolicy: resolve(__dirname, 'measurement-policy.html'),
        refundCancellation: resolve(__dirname, 'refund-cancellation.html'),
        shipping: resolve(__dirname, 'shipping.html'),
      },
    },
  },
});
