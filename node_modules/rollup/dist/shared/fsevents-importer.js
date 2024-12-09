/*
  @license
	Rollup.js v4.24.2
	Sun, 27 Oct 2024 15:39:37 GMT - commit 32d0e7dae85121ac0850ec28576a10a6302f84a9

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

let fsEvents;
let fsEventsImportError;
async function loadFsEvents() {
    try {
        ({ default: fsEvents } = await import('fsevents'));
    }
    catch (error) {
        fsEventsImportError = error;
    }
}
// A call to this function will be injected into the chokidar code
function getFsEvents() {
    if (fsEventsImportError)
        throw fsEventsImportError;
    return fsEvents;
}

const fseventsImporter = /*#__PURE__*/Object.defineProperty({
    __proto__: null,
    getFsEvents,
    loadFsEvents
}, Symbol.toStringTag, { value: 'Module' });

exports.fseventsImporter = fseventsImporter;
exports.loadFsEvents = loadFsEvents;
//# sourceMappingURL=fsevents-importer.js.map
