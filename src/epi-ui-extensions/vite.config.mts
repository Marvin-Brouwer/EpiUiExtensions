import packageConfig from './package.json';
import tsConfig from './tsconfig.json';
import path from 'path';
import { defineConfig } from 'vite';
import amd from 'rollup-plugin-amd';
import copy from 'rollup-plugin-copy'
import dts from 'vite-plugin-dts';

const entry = path.resolve(__dirname, 'lib/index.ts');
const packageName = packageConfig.name;
const isDev = process.argv.join(' ').includes('--mode development');
const outputDir = 'dist';

export default defineConfig({
	plugins: [
		amd(),
		copy({
			targets: [
				{ src: './dojofix.d.ts', dest: 'dist' },
				{ src: './epifix.d.ts', dest: 'dist' },
			],
			hook: 'writeBundle',
		}),
		dts()
	],
	build: {
		minify: !isDev,
		target: [tsConfig.compilerOptions.target],
		outDir: outputDir,
		rollupOptions: {
			external: [
				/^dijit\//s,
				/^dojo\//s,
				/^epi\//s,
				/^epi\-cms\//s,
				/^xstyle\//s
			],
			output: {
				compact: !isDev,
				indent: isDev,
				sourcemap: isDev,
			}
		},
		lib: {
			entry,
			name: packageName,
			fileName: (format) => `index.${format}.js`,
			formats: ['cjs', 'es', "umd"]
		}
	}
});