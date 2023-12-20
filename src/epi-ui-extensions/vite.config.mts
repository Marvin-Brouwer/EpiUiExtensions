import packageConfig from './package.json';
import tsConfig from './tsconfig.json';
import path from 'path';
import { defineConfig } from 'vite';
import amd from 'rollup-plugin-amd';

const isDev = process.argv.join(' ').includes('--mode development');

export default defineConfig({
	plugins: [
		amd(),
	],
	assetsInclude: [
		'**/*-template.html'
	],
	build: {
		minify: !isDev,
		target: [tsConfig.compilerOptions.target],
		rollupOptions: {
			external: [
				/^dijit\//s,
				/^dojo\//s,
				/^epi\//s,
				/^epi\-cms\//s,
				/^xstyle\//s
			],
			output: {
				format: "amd",
				strict: false,
				chunkFileNames: `[name].amd.js`,
				entryFileNames: "[name].js",
				dir: "dist",
				compact: !isDev,
				indent: isDev,

				dynamicImportInCjs: false,
				externalImportAssertions: false,
				inlineDynamicImports: false,
				preserveModules: false,

				interop: 'default'
			}
		},
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: packageConfig.name,
			fileName: (format) => `${packageConfig.name}.${format}.js`
		}
	}
});