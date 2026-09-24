import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            root: fileURLToPath(new URL('./', import.meta.url)),
            setupFiles: ['./test-utils/vitest/setup.ts'],
            watch: true,
        },
        resolve: { alias: { '@': '/src', '@test-utils': '/test-utils' } },
        server: {
            watch: {
                usePolling: true,
                interval: 500,
            },
        },
    }),
);
