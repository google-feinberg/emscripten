// Copyright 2010 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

#if SIDE_MODULE == 0
#if USE_CLOSURE_COMPILER
// if (!Module)` is crucial for Closure Compiler here as it will otherwise replace every `Module` occurrence with a string
var Module;
if (!Module) Module = "__EMSCRIPTEN_PRIVATE_MODULE_EXPORT_NAME_SUBSTITUTION__";
#else
var Module = {{{ EXPORT_NAME }}};
#endif // USE_CLOSURE_COMPILER
#endif // SIDE_MODULE

#if ENVIRONMENT_MAY_BE_NODE
var ENVIRONMENT_IS_NODE = typeof process === 'object';
#endif

#if ENVIRONMENT_MAY_BE_SHELL
var ENVIRONMENT_IS_SHELL = typeof read === 'function';
#endif

#if ASSERTIONS && ENVIRONMENT_MAY_BE_NODE && ENVIRONMENT_MAY_BE_SHELL
if (ENVIRONMENT_IS_NODE && ENVIRONMENT_IS_SHELL) {
  throw 'unclear environment';
}
#endif

#if !SINGLE_FILE
// Wasm or Wasm2JS loading:
#if ENVIRONMENT_MAY_BE_NODE && ((WASM == 1 && (!WASM2JS || !MEM_INIT_IN_WASM)) || WASM == 2)
if (ENVIRONMENT_IS_NODE) {
  var fs = require('fs');
#if WASM
#if WASM == 2
  if (typeof WebAssembly !== 'undefined') Module['wasm'] = fs.readFileSync(__dirname + '/{{{ TARGET_BASENAME }}}.wasm');
  else eval(fs.readFileSync(__dirname + '/{{{ TARGET_BASENAME }}}.wasm.js')+'');
#else
#if !WASM2JS
  Module['wasm'] = fs.readFileSync(__dirname + '/{{{ TARGET_BASENAME }}}.wasm');
#endif
#endif
#else
#if SEPARATE_ASM
  eval(fs.readFileSync(__dirname + '/{{{ TARGET_BASENAME }}}.asm.js')+'');
#endif
#endif
#if MEM_INIT_METHOD == 1 && !MEM_INIT_IN_WASM
  Module['mem'] = fs.readFileSync(__dirname + '/{{{ TARGET_BASENAME }}}.mem');
#endif
}
#endif

#if ENVIRONMENT_MAY_BE_SHELL && ((WASM == 1 && (!WASM2JS || !MEM_INIT_IN_WASM)) || WASM == 2)
if (ENVIRONMENT_IS_SHELL) {
#if WASM
#if WASM == 2
  if (typeof WebAssembly !== 'undefined') Module['wasm'] = read('{{{ TARGET_BASENAME }}}.wasm', 'binary');
  else eval(read('{{{ TARGET_BASENAME }}}.wasm.js')+'');
#else
#if !WASM2JS
  Module['wasm'] = read('{{{ TARGET_BASENAME }}}.wasm', 'binary');
#endif
#endif
#else
  eval(read('{{{ TARGET_BASENAME }}}.asm.js')+'');
#endif
#if MEM_INIT_METHOD == 1 && !MEM_INIT_IN_WASM
  Module['mem'] = read('{{{ TARGET_BASENAME }}}.mem', 'binary');
#endif
}
#endif

// asm.js loading in fastcomp backend:
#if !WASM && !WASM_BACKEND

#if ENVIRONMENT_MAY_BE_NODE
if (ENVIRONMENT_IS_NODE) {
  var fs = require('fs');
#if SEPARATE_ASM
  eval(fs.readFileSync(__dirname + '/{{{ TARGET_BASENAME }}}.asm.js')+'');
#endif
#if MEM_INIT_METHOD == 1 && !MEM_INIT_IN_WASM
  Module['mem'] = fs.readFileSync(__dirname + '/{{{ TARGET_BASENAME }}}.mem');
#endif
}
#endif

#if ENVIRONMENT_MAY_BE_SHELL
if (ENVIRONMENT_IS_SHELL) {
  eval(read('{{{ TARGET_BASENAME }}}.asm.js')+'');
#if MEM_INIT_METHOD == 1 && !MEM_INIT_IN_WASM
  Module['mem'] = read('{{{ TARGET_BASENAME }}}.mem', 'binary');
#endif
}
#endif

#endif

#endif // !SINGLE_FILE

// Redefine these in a --pre-js to override behavior. If you would like to
// remove out() or err() altogether, you can no-op it out to function() {},
// and build with --closure 1 to get Closure optimize out all the uses
// altogether.

function out(text) {
  console.log(text);
}

function err(text) {
  console.error(text);
}

// Override this function in a --pre-js file to get a signal for when
// compilation is ready. In that callback, call the function run() to start
// the program.
function ready() {
  run();
}

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)

// {{PRE_JSES}}

#if USE_PTHREADS

#if !MODULARIZE
// In MODULARIZE mode _scriptDir needs to be captured already at the very top of the page immediately when the page is parsed, so it is generated there
// before the page load. In non-MODULARIZE modes generate it here.
var _scriptDir = (typeof document !== 'undefined' && document.currentScript) ? document.currentScript.src : undefined;
#endif

var ENVIRONMENT_IS_PTHREAD;
if (!ENVIRONMENT_IS_PTHREAD) ENVIRONMENT_IS_PTHREAD = false; // ENVIRONMENT_IS_PTHREAD=true will have been preset in pthread-main.js. Make it false in the main runtime thread.

if (typeof ENVIRONMENT_IS_PTHREAD === 'undefined') {
  // ENVIRONMENT_IS_PTHREAD=true will have been preset in pthread-main.js. Make it false in the main runtime thread. 
  // N.B. this line needs to appear without 'var' keyword to avoid 'var hoisting' from occurring. (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
  ENVIRONMENT_IS_PTHREAD = false;
}
#if MODULARIZE
else {
  var buffer = {{{EXPORT_NAME}}}.buffer;
  var STATICTOP = {{{EXPORT_NAME}}}.STATICTOP;
  var DYNAMICTOP_PTR = {{{EXPORT_NAME}}}.DYNAMICTOP_PTR;
  var STACK_BASE = {{{EXPORT_NAME}}}.STACK_BASE;
  var STACKTOP = {{{EXPORT_NAME}}}.STACKTOP;
  var STACK_MAX = {{{EXPORT_NAME}}}.STACK_MAX;
}
#endif

var currentScriptUrl = typeof _scriptDir !== 'undefined' ? _scriptDir : ((typeof document !== 'undefined' && document.currentScript) ? document.currentScript.src : undefined);
#endif // USE_PTHREADS

{{BODY}}

// {{MODULE_ADDITIONS}}
