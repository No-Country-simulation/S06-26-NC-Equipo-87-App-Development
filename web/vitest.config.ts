import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      passWithNoTests: true,
      projects: [
        {
          test: {
            name: 'unit',
            include: ['src/**/*.unit.test.tsx', 'src/**/*.unit.test.ts'],
            environment: 'jsdom',
            globals: true,
            setupFiles: './src/setup.ts',
          },
        },
        {
          test: {
            name: 'integration',
            include: ['src/**/*.integration.test.tsx', 'src/**/*.integration.test.ts'],
            environment: 'jsdom',
            globals: true,
            setupFiles: './src/setup.ts',
          },
        },
      ],
    },
  })
)
