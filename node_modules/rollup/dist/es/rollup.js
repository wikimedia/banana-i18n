/*
  @license
	Rollup.js v4.24.2
	Sun, 27 Oct 2024 15:39:37 GMT - commit 32d0e7dae85121ac0850ec28576a10a6302f84a9

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
export { version as VERSION, defineConfig, rollup, watch } from './shared/node-entry.js';
import './shared/parseAst.js';
import '../native.js';
import 'node:path';
import 'path';
import 'node:process';
import 'node:perf_hooks';
import 'node:fs/promises';
import 'tty';
