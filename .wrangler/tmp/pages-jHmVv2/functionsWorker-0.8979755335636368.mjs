var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// api/_lib/types.ts
var STATUS_BY_CODE = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  method_not_allowed: 405,
  payload_too_large: 413,
  unprocessable: 422,
  rate_limited: 429,
  server_error: 500
};
function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}
__name(json, "json");
function dataResponse(data, version2, init = {}) {
  return json({ data, version: version2 }, init);
}
__name(dataResponse, "dataResponse");
function error3(code, message, options = {}) {
  const body = { error: { code, message } };
  if (options.fields && options.fields.length > 0) body.error.fields = options.fields;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status: STATUS_BY_CODE[code], headers });
}
__name(error3, "error");
var VERSION_KEY = "content_version";
async function contentVersion(env2) {
  try {
    const raw = await env2.CACHE.get(VERSION_KEY, { cacheTtl: 30 });
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  } catch (cause) {
    console.error("[cache] contentVersion read failed", cause);
  }
  try {
    const row = await env2.DB.prepare("SELECT value FROM meta WHERE key = ?").bind(VERSION_KEY).first();
    const parsed = Number(row?.value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  } catch (cause) {
    console.error("[cache] contentVersion db read failed", cause);
  }
  return 1;
}
__name(contentVersion, "contentVersion");
function edgeCache() {
  const candidate = caches.default;
  return candidate ?? null;
}
__name(edgeCache, "edgeCache");
function cacheKey(request, version2) {
  const url = new URL(request.url);
  url.searchParams.set("__v", String(version2));
  return new Request(url.toString(), { method: "GET" });
}
__name(cacheKey, "cacheKey");
async function withEdgeCache(request, ctx, version2, produce) {
  const cache = edgeCache();
  const key = cacheKey(request, version2);
  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch (cause) {
      console.error("[cache] match failed", cause);
    }
  }
  const response = await produce();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
  headers.set("X-Content-Version", String(version2));
  const out = new Response(response.body, { status: response.status, headers });
  if (cache && response.status === 200) {
    try {
      const snapshot = new Response(out.clone().body, out);
      ctx.waitUntil(cache.put(key, snapshot));
    } catch (cause) {
      console.error("[cache] put failed", cause);
    }
  }
  return out;
}
__name(withEdgeCache, "withEdgeCache");
async function underRateLimit(env2, key, limit, windowSeconds) {
  const bucket = `rl:${key}:${Math.floor(Date.now() / (windowSeconds * 1e3))}`;
  try {
    const raw = await env2.CACHE.get(bucket);
    const count3 = Number(raw ?? "0");
    if (count3 >= limit) return false;
    await env2.CACHE.put(bucket, String(count3 + 1), {
      expirationTtl: Math.max(60, windowSeconds + 10)
    });
    return true;
  } catch (cause) {
    console.error("[cache] rate limit failed", cause);
    return true;
  }
}
__name(underRateLimit, "underRateLimit");

// api/_lib/media.ts
var SELECT_COLUMNS = "id, r2_key, kind, mime, width, height, alt, focus_x, focus_y, poster_media_id";
async function resolveMedia(value, env2) {
  const ids = collectMediaIds(value);
  if (ids.size === 0) return value;
  const rows = await loadRows(env2, [...ids]);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const posterIds = rows.map((row) => row.poster_media_id).filter((id) => typeof id === "string" && !byId.has(id));
  const posterRows = posterIds.length > 0 ? await loadRows(env2, [...new Set(posterIds)]) : [];
  for (const row of posterRows) byId.set(row.id, row);
  return replaceRefs(value, byId, env2);
}
__name(resolveMedia, "resolveMedia");
async function loadRows(env2, ids) {
  const placeholders = ids.map(() => "?").join(",");
  const statement = env2.DB.prepare(
    `SELECT ${SELECT_COLUMNS} FROM media WHERE id IN (${placeholders}) AND deleted_at IS NULL`
  );
  const { results } = await statement.bind(...ids).all();
  return results ?? [];
}
__name(loadRows, "loadRows");
function collectMediaIds(value, found = /* @__PURE__ */ new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectMediaIds(item, found);
    return found;
  }
  if (typeof value === "object" && value !== null) {
    const record = value;
    const id = record.mediaId;
    if (typeof id === "string") found.add(id);
    for (const child of Object.values(record)) collectMediaIds(child, found);
  }
  return found;
}
__name(collectMediaIds, "collectMediaIds");
function replaceRefs(value, byId, env2, seen = /* @__PURE__ */ new Set()) {
  if (Array.isArray(value)) {
    return value.map((item) => replaceRefs(item, byId, env2, seen));
  }
  if (typeof value === "object" && value !== null) {
    const record = value;
    if (typeof record.mediaId === "string") {
      const row = byId.get(record.mediaId);
      if (!row) return null;
      return resolveRow(row, byId, env2, seen);
    }
    const out = {};
    for (const [key, child] of Object.entries(record)) {
      out[key] = replaceRefs(child, byId, env2, seen);
    }
    return out;
  }
  return value;
}
__name(replaceRefs, "replaceRefs");
function resolveRow(row, byId, env2, seen) {
  seen.add(row.id);
  const posterRow = row.poster_media_id ? byId.get(row.poster_media_id) : void 0;
  const poster = posterRow && !seen.has(posterRow.id) ? resolveRow(posterRow, byId, env2, seen) : null;
  return {
    url: joinUrl(env2.MEDIA_PUBLIC_BASE, row.r2_key),
    kind: row.kind,
    mime: row.mime,
    width: row.width,
    height: row.height,
    alt: row.alt,
    focus: row.focus_x !== null && row.focus_y !== null ? { x: row.focus_x, y: row.focus_y } : null,
    poster
  };
}
__name(resolveRow, "resolveRow");
function joinUrl(base, key) {
  return `${base.replace(/\/+$/, "")}/${key.replace(/^\/+/, "")}`;
}
__name(joinUrl, "joinUrl");

// api/public/pages/[slug].ts
var DOCUMENT_TYPES = /* @__PURE__ */ new Set(["service_page", "page"]);
var onRequestGet = /* @__PURE__ */ __name(async (context2) => {
  const raw = context2.params.slug;
  const slug = typeof raw === "string" ? raw : "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return error3("not_found", "No such page");
  }
  const version2 = await contentVersion(context2.env);
  return withEdgeCache(context2.request, context2, version2, async () => {
    const row = await context2.env.DB.prepare(
      `SELECT slug, type, status, data, published_data, published_at
         FROM documents
        WHERE slug = ? AND status = 'published' AND published_data IS NOT NULL`
    ).bind(slug).first();
    if (!row || !DOCUMENT_TYPES.has(row.type)) {
      return error3("not_found", "No such page");
    }
    const page = JSON.parse(row.published_data);
    const resolved = await resolveMedia(page, context2.env);
    return dataResponse({ slug: row.slug, type: row.type, ...resolved }, version2);
  });
}, "onRequestGet");

// api/_lib/content.ts
var PUBLISHED = "status = 'published' AND published_data IS NOT NULL";
function snapshotOf(row) {
  if (!row.published_data) return null;
  return JSON.parse(row.published_data);
}
__name(snapshotOf, "snapshotOf");
async function getDocument(env2, slug) {
  const row = await env2.DB.prepare(
    `SELECT slug, type, status, data, published_data, published_at
       FROM documents WHERE slug = ? AND ${PUBLISHED}`
  ).bind(slug).first();
  return { data: row ? snapshotOf(row) : null };
}
__name(getDocument, "getDocument");
async function listEntries(env2, collection, options = {}) {
  const limit = Math.min(Math.max(options.limit ?? 500, 1), 500);
  const { results } = await env2.DB.prepare(
    `SELECT id, collection, slug, status, sort, data, published_data, published_at
       FROM entries
      WHERE collection = ? AND ${PUBLISHED}
      ORDER BY sort ASC, slug ASC
      LIMIT ?`
  ).bind(collection, limit).all();
  const rows = results ?? [];
  const items = rows.map((row) => snapshotOf(row)).filter((item) => item !== null);
  if (options.resolveMediaRefs === false) return items;
  return resolveMedia(items, env2);
}
__name(listEntries, "listEntries");
async function listDocumentsByType(env2, type) {
  const { results } = await env2.DB.prepare(
    `SELECT slug, type, status, data, published_data, published_at
       FROM documents
      WHERE type = ? AND ${PUBLISHED}
      ORDER BY slug ASC`
  ).bind(type).all();
  const out = [];
  for (const row of results ?? []) {
    const snapshot = snapshotOf(row);
    if (snapshot !== null) out.push({ slug: row.slug, data: snapshot });
  }
  return out;
}
__name(listDocumentsByType, "listDocumentsByType");

// api/public/collections/index.ts
var COLLECTIONS = /* @__PURE__ */ new Set(["services", "projects", "testimonials", "clients", "articles"]);
var onRequestGet2 = /* @__PURE__ */ __name(async (context2) => {
  const raw = context2.params.name;
  const name = typeof raw === "string" ? raw : "";
  if (!COLLECTIONS.has(name)) {
    return error3("not_found", `Unknown collection '${name}'`);
  }
  const version2 = await contentVersion(context2.env);
  return withEdgeCache(context2.request, context2, version2, async () => {
    const orderNewest = name === "articles";
    const items = orderNewest ? await listEntriesSortedByDate(context2.env, name) : await listEntries(context2.env, name);
    const resolved = await resolveMedia(items, context2.env);
    return dataResponse(resolved, version2);
  });
}, "onRequestGet");
async function listEntriesSortedByDate(env2, collection) {
  const items = await listEntries(env2, collection);
  return [...items].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
__name(listEntriesSortedByDate, "listEntriesSortedByDate");

// api/public/home.ts
var onRequestGet3 = /* @__PURE__ */ __name(async (context2) => {
  const version2 = await contentVersion(context2.env);
  return withEdgeCache(context2.request, context2, version2, async () => {
    const [home, services, projects, testimonials, clients, articles] = await Promise.all([
      getDocument(context2.env, "_home"),
      listEntries(context2.env, "services"),
      listEntries(context2.env, "projects", { limit: 50 }),
      listEntries(context2.env, "testimonials"),
      listEntries(context2.env, "clients"),
      listEntries(context2.env, "articles", { limit: 4 })
    ]);
    if (!home.data) {
      return error3("not_found", "No published home content yet");
    }
    const data = {
      home: home.data,
      services,
      projects,
      testimonials,
      clients,
      articles
    };
    const resolved = await resolveMedia(data, context2.env);
    return dataResponse(resolved, version2);
  });
}, "onRequestGet");

// api/public/services-page.ts
var onRequestGet4 = /* @__PURE__ */ __name(async (context2) => {
  const version2 = await contentVersion(context2.env);
  return withEdgeCache(context2.request, context2, version2, async () => {
    const [index, services, projects, clients, testimonials] = await Promise.all([
      getDocument(context2.env, "_services"),
      listEntries(context2.env, "services"),
      listEntries(context2.env, "projects", { limit: 50 }),
      listEntries(context2.env, "clients"),
      listEntries(context2.env, "testimonials")
    ]);
    if (!index.data) {
      return error3("not_found", "No published services page yet");
    }
    const data = {
      index: index.data,
      services,
      projects,
      clients,
      testimonials
    };
    const resolved = await resolveMedia(data, context2.env);
    return dataResponse(resolved, version2);
  });
}, "onRequestGet");

// api/public/site.ts
var onRequestGet5 = /* @__PURE__ */ __name(async (context2) => {
  const version2 = await contentVersion(context2.env);
  return withEdgeCache(context2.request, context2, version2, async () => {
    const [site, navigation, footer] = await Promise.all([
      getDocument(context2.env, "_site"),
      getDocument(context2.env, "_navigation"),
      getDocument(context2.env, "_footer")
    ]);
    if (!site.data && !navigation.data && !footer.data) {
      return error3("not_found", "No published settings yet");
    }
    const data = {
      settings: site.data ?? null,
      navigation: navigation.data ?? null,
      footer: footer.data ?? null
    };
    const resolved = await resolveMedia(data, context2.env);
    return dataResponse(resolved, version2);
  });
}, "onRequestGet");

// api/public/sitemap.xml.ts
var onRequestGet6 = /* @__PURE__ */ __name(async (context2) => {
  const version2 = await contentVersion(context2.env);
  const [servicePages, pages] = await Promise.all([
    listDocumentsByType(context2.env, "service_page"),
    listDocumentsByType(context2.env, "page")
  ]);
  const paths = ["/", "/services", "/work", "/blog", ...servicePages.map((page) => `/${page.slug}`), ...pages.map((page) => `/${page.slug}`)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${escapeXml(context2.env.SITE_ORIGIN)}${path}</loc></url>`).join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
      "X-Content-Version": String(version2)
    }
  });
}, "onRequestGet");
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
__name(escapeXml, "escapeXml");

// api/public/work-page.ts
var onRequestGet7 = /* @__PURE__ */ __name(async (context2) => {
  const version2 = await contentVersion(context2.env);
  return withEdgeCache(context2.request, context2, version2, async () => {
    const [index, projects] = await Promise.all([
      getDocument(context2.env, "_work"),
      listEntries(context2.env, "projects", { limit: 200 })
    ]);
    if (!index.data) {
      return error3("not_found", "No published work page yet");
    }
    const data = { index: index.data, projects };
    const resolved = await resolveMedia(data, context2.env);
    return dataResponse(resolved, version2);
  });
}, "onRequestGet");

// api/_lib/forms.ts
var HONEYPOT_FIELD = "_gotcha";
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validatePayload(payload) {
  const errors = [];
  if (payload.email && !EMAIL_RE.test(payload.email)) {
    errors.push({ path: "email", message: "Enter a valid email address" });
  }
  const fields = payload.fields ?? {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "string" && value.length > 3e3) {
      errors.push({ path: `fields.${key}`, message: "Too long" });
    }
  }
  if (!payload.email && !payload.phone) {
    errors.push({ path: "phone", message: "Add an email or a phone number so we can reply" });
  }
  return errors;
}
__name(validatePayload, "validatePayload");
function isSameOrigin(request, env2) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  let selfOrigin;
  try {
    selfOrigin = new URL(request.url).origin;
  } catch {
    return false;
  }
  const expected = env2.SITE_ORIGIN.replace(/\/+$/, "");
  const candidates = [selfOrigin.toLowerCase(), expected.toLowerCase()].filter(Boolean);
  return candidates.includes(origin.trim().replace(/\/+$/, "").toLowerCase());
}
__name(isSameOrigin, "isSameOrigin");
async function verifyTurnstile(token, request, env2) {
  if (env2.TURNSTILE_BYPASS) return true;
  if (!env2.TURNSTILE_SECRET) return false;
  if (!token) return false;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env2.TURNSTILE_SECRET,
        response: token,
        // Optional but recommended: binds the token to this request's IP.
        remoteip: clientIp(request) ?? ""
      }),
      signal: AbortSignal.timeout(5e3)
    });
    const result = await response.json();
    return result.success === true;
  } catch (cause) {
    console.error("[forms] turnstile verification failed", cause);
    return false;
  }
}
__name(verifyTurnstile, "verifyTurnstile");
function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? null;
}
__name(clientIp, "clientIp");
async function hashIp(ip, env2) {
  if (!ip) return null;
  const salt = env2.IP_HASH_SALT;
  if (!salt) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashIp, "hashIp");
async function underFormRateLimit(env2, ip, source) {
  if (!ip) return true;
  return underRateLimit(env2, `form:${source}:${await hashIpShort(ip, env2)}`, 5, 60);
  async function hashIpShort(ip2, env3) {
    const digestIp = await hashIp(ip2, env3);
    return digestIp ? digestIp.slice(0, 16) : "unknown";
  }
  __name(hashIpShort, "hashIpShort");
}
__name(underFormRateLimit, "underFormRateLimit");
async function getForm(env2, source) {
  return env2.DB.prepare(
    "SELECT source, label, enabled, notify_emails, success_message FROM forms WHERE source = ?"
  ).bind(source).first();
}
__name(getForm, "getForm");
function submissionId() {
  let time3 = "";
  let remaining = Date.now();
  for (let i = 9; i >= 0; i -= 1) {
    time3 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[remaining % 32] + time3;
    remaining = Math.floor(remaining / 32);
  }
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[byte % 32];
  return `sub_${time3}${out}`;
}
__name(submissionId, "submissionId");
async function insertSubmission(env2, source, payload, meta) {
  const id = submissionId();
  try {
    await env2.DB.prepare(
      `INSERT INTO submissions
         (id, source, status, name, email, phone, message, fields, page_path, referrer, utm, user_agent, ip_hash, turnstile_ok)
       VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      source,
      payload.name ?? null,
      payload.email ?? null,
      payload.phone ?? null,
      payload.message ?? null,
      JSON.stringify(payload.fields ?? {}),
      payload.pagePath ?? null,
      payload.referrer ?? null,
      JSON.stringify(payload.utm ?? {}),
      meta.userAgent,
      meta.ipHash,
      meta.turnstileOk ? 1 : 0
    ).run();
  } catch (cause) {
    console.error("[forms] insert failed", cause);
    return { ok: false, response: error3("server_error", "Could not save your submission") };
  }
  return { ok: true, id };
}
__name(insertSubmission, "insertSubmission");

// api/forms/[source].ts
var onRequest = /* @__PURE__ */ __name(async (context2) => {
  const { request, params } = context2;
  if (request.method === "OPTIONS") return corsPreflight();
  if (request.method === "POST") return handlePost(context2, asString(params.source));
  return error3("method_not_allowed", "Use POST or OPTIONS on this route", {
    headers: { Allow: "POST, OPTIONS" }
  });
}, "onRequest");
async function handlePost(context2, source) {
  const { request, env: env2 } = context2;
  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;
  if (body && typeof body === "object" && HONEYPOT_FIELD in body) {
    return json({ ok: true, received: true });
  }
  if (!isSameOrigin(request, env2)) {
    return error3("forbidden", "Request must come from the site");
  }
  if (!body) {
    return error3("bad_request", "Body is required");
  }
  const fieldErrors = validatePayload(body);
  if (fieldErrors.length > 0) {
    return error3("unprocessable", "Some fields need attention", { fields: fieldErrors });
  }
  const form = await getForm(env2, source);
  if (!form) {
    return error3("not_found", "This form is not configured");
  }
  if (form.enabled !== 1) {
    return error3("unprocessable", "This form is not accepting submissions right now");
  }
  const ip = clientIpOf(request);
  if (!await underFormRateLimit(env2, ip, source)) {
    return error3("rate_limited", "Too many submissions; try again shortly");
  }
  const turnstileOk = await verifyTurnstile(body.turnstileToken, request, env2);
  if (!turnstileOk) {
    return error3("forbidden", "Captcha check failed; retry the widget");
  }
  const ipHash = await hashIp(ip, env2);
  const result = await insertSubmission(env2, source, body, {
    turnstileOk,
    ipHash,
    userAgent: request.headers.get("User-Agent")
  });
  if (!result.ok) return result.response;
  return json({
    ok: true,
    id: result.id,
    successMessage: form.success_message || "Thanks \u2014 your message has been received."
  });
}
__name(handlePost, "handlePost");
function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(corsPreflight, "corsPreflight");
function asString(value) {
  return typeof value === "string" ? value : "";
}
__name(asString, "asString");
var MAX_FORM_BODY_BYTES = 100 * 1024;
async function readJson(request) {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, response: error3("bad_request", "Send the body as application/json") };
  }
  const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BODY_BYTES) {
    return { ok: false, response: error3("payload_too_large", "Body is too large") };
  }
  let raw;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: error3("bad_request", "Body is not valid JSON") };
  }
  return { ok: true, body: raw };
}
__name(readJson, "readJson");
function clientIpOf(request) {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? null;
}
__name(clientIpOf, "clientIpOf");

// robots.txt.ts
var onRequestGet8 = /* @__PURE__ */ __name(async (context2) => {
  const origin = context2.env.SITE_ORIGIN.replace(/\/+$/, "");
  const body = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" }
  });
}, "onRequestGet");

// ../../.wrangler/tmp/pages-jHmVv2/functionsRoutes-0.8939752610418612.mjs
var routes = [
  {
    routePath: "/api/public/pages/:slug",
    mountPath: "/api/public/pages",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/public/collections",
    mountPath: "/api/public/collections",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/public/home",
    mountPath: "/api/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/public/services-page",
    mountPath: "/api/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/public/site",
    mountPath: "/api/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/api/public/sitemap.xml",
    mountPath: "/api/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/api/public/work-page",
    mountPath: "/api/public",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/api/forms/:source",
    mountPath: "/api/forms",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/robots.txt",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  }
];

// ../../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error4) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error4;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error4 = reduceError(e);
    const body = JSON.stringify(error4);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../../.wrangler/tmp/bundle-n4ULbN/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../../.wrangler/tmp/bundle-n4ULbN/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.8979755335636368.mjs.map
