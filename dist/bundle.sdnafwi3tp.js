(function () {
    'use strict';

    const version = '1.0.0-rc.4';
    // do not use isUndefined
    const isBrowser = typeof window !== 'undefined';
    // do not use isUndefined
    const globalThis$1 = (typeof global !== 'undefined')
        ? global
        : ((typeof window !== 'undefined')
            ? window
            : ((typeof self !== 'undefined') ? self : Function('return this')()));
    const noopFalse = () => false;
    // Array.isArray
    const isArray$1 = Array.isArray;
    // Object.assign
    const assign = Object.assign;
    // Object prototype methods
    const rawDefineProperty = Object.defineProperty;
    const rawDefineProperties = Object.defineProperties;
    const rawToString = Object.prototype.toString;
    const rawHasOwnProperty = Object.prototype.hasOwnProperty;
    const toTypeString = (value) => rawToString.call(value);
    // is Undefined
    function isUndefined$1(target) {
        return target === undefined;
    }
    // is Null
    function isNull(target) {
        return target === null;
    }
    // is String
    function isString$1(target) {
        return typeof target === 'string';
    }
    // is Boolean
    function isBoolean$1(target) {
        return typeof target === 'boolean';
    }
    // is Number
    function isNumber$1(target) {
        return typeof target === 'number';
    }
    // is function
    function isFunction$1(target) {
        return typeof target === 'function';
    }
    // is PlainObject
    function isPlainObject$1(target) {
        return toTypeString(target) === '[object Object]';
    }
    // is Object
    function isObject$1(target) {
        return !isNull(target) && typeof target === 'object';
    }
    // is Promise
    function isPromise(target) {
        return toTypeString(target) === '[object Promise]';
    }
    // is bind function
    function isBoundFunction(target) {
        return isFunction$1(target) && target.name.indexOf('bound ') === 0 && !target.hasOwnProperty('prototype');
    }
    // is constructor function
    function isConstructor(target) {
        var _a;
        if (isFunction$1(target)) {
            const targetStr = target.toString();
            return (((_a = target.prototype) === null || _a === void 0 ? void 0 : _a.constructor) === target &&
                Object.getOwnPropertyNames(target.prototype).length > 1) ||
                /^function\s+[A-Z]/.test(targetStr) ||
                /^class\s+/.test(targetStr);
        }
        return false;
    }
    // is ShadowRoot
    function isShadowRoot(target) {
        return typeof ShadowRoot !== 'undefined' && target instanceof ShadowRoot;
    }
    function isURL(target) {
        var _a;
        return target instanceof URL || !!((_a = target) === null || _a === void 0 ? void 0 : _a.href);
    }
    // iframe element not instanceof base app Element, use tagName instead
    function isElement(target) {
        var _a;
        return target instanceof Element || isString$1((_a = target) === null || _a === void 0 ? void 0 : _a.tagName);
    }
    // iframe node not instanceof base app Node, use nodeType instead
    function isNode(target) {
        var _a;
        return target instanceof Node || isNumber$1((_a = target) === null || _a === void 0 ? void 0 : _a.nodeType);
    }
    function isLinkElement(target) {
        return toTypeString(target) === '[object HTMLLinkElement]';
    }
    function isStyleElement(target) {
        return toTypeString(target) === '[object HTMLStyleElement]';
    }
    function isScriptElement(target) {
        return toTypeString(target) === '[object HTMLScriptElement]';
    }
    function isIFrameElement(target) {
        return toTypeString(target) === '[object HTMLIFrameElement]';
    }
    function isDivElement(target) {
        return toTypeString(target) === '[object HTMLDivElement]';
    }
    function isImageElement(target) {
        return toTypeString(target) === '[object HTMLImageElement]';
    }
    function isBaseElement(target) {
        return toTypeString(target) === '[object HTMLBaseElement]';
    }
    function isMicroAppBody(target) {
        return isElement(target) && target.tagName.toUpperCase() === 'MICRO-APP-BODY';
    }
    // is ProxyDocument
    function isProxyDocument(target) {
        return toTypeString(target) === '[object ProxyDocument]';
    }
    function includes(target, searchElement, fromIndex) {
        if (target == null) {
            throw new TypeError('includes target is null or undefined');
        }
        const O = Object(target);
        const len = parseInt(O.length, 10) || 0;
        if (len === 0)
            return false;
        // @ts-ignore
        fromIndex = parseInt(fromIndex, 10) || 0;
        let i = Math.max(fromIndex >= 0 ? fromIndex : len + fromIndex, 0);
        while (i < len) {
            // NaN !== NaN
            if (searchElement === O[i] || (searchElement !== searchElement && O[i] !== O[i])) {
                return true;
            }
            i++;
        }
        return false;
    }
    /**
     * format error log
     * @param msg message
     * @param appName app name, default is null
     */
    function logError(msg, appName = null, ...rest) {
        const appNameTip = appName && isString$1(appName) ? ` app ${appName}:` : '';
        if (isString$1(msg)) {
            console.error(`[micro-app]${appNameTip} ${msg}`, ...rest);
        }
        else {
            console.error(`[micro-app]${appNameTip}`, msg, ...rest);
        }
    }
    /**
     * format warn log
     * @param msg message
     * @param appName app name, default is null
     */
    function logWarn(msg, appName = null, ...rest) {
        const appNameTip = appName && isString$1(appName) ? ` app ${appName}:` : '';
        if (isString$1(msg)) {
            console.warn(`[micro-app]${appNameTip} ${msg}`, ...rest);
        }
        else {
            console.warn(`[micro-app]${appNameTip}`, msg, ...rest);
        }
    }
    /**
     * async execution
     * @param fn callback
     * @param args params
     */
    function defer(fn, ...args) {
        Promise.resolve().then(fn.bind(null, ...args));
    }
    /**
     * create URL as MicroLocation
     */
    const createURL = (function () {
        class Location extends URL {
        }
        return (path, base) => {
            return (base ? new Location('' + path, base) : new Location('' + path));
        };
    })();
    /**
     * Add address protocol
     * @param url address
     */
    function addProtocol(url) {
        return url.startsWith('//') ? `${globalThis$1.location.protocol}${url}` : url;
    }
    /**
     * format URL address
     * note the scenes:
     * 1. micro-app -> attributeChangedCallback
     * 2. preFetch
     */
    function formatAppURL(url, appName = null) {
        if (!isString$1(url) || !url)
            return '';
        try {
            const { origin, pathname, search } = createURL(addProtocol(url), (window.rawWindow || window).location.href);
            // If it ends with .html/.node/.php/.net/.etc, don’t need to add /
            if (/\.(\w+)$/.test(pathname)) {
                return `${origin}${pathname}${search}`;
            }
            const fullPath = `${origin}${pathname}/`.replace(/\/\/$/, '/');
            return /^https?:\/\//.test(fullPath) ? `${fullPath}${search}` : '';
        }
        catch (e) {
            logError(e, appName);
            return '';
        }
    }
    /**
     * format name
     * note the scenes:
     * 1. micro-app -> attributeChangedCallback
     * 2. event_center -> EventCenterForMicroApp -> constructor
     * 3. event_center -> EventCenterForBaseApp -> all methods
     * 4. preFetch
     * 5. plugins
     * 6. router api (push, replace)
     */
    function formatAppName(name) {
        if (!isString$1(name) || !name)
            return '';
        return name.replace(/(^\d+)|([^\w\d-_])/gi, '');
    }
    /**
     * Get valid address, such as https://xxx/xx/xx.html to https://xxx/xx/
     * @param url app.url
     */
    function getEffectivePath(url) {
        const { origin, pathname } = createURL(url);
        if (/\.(\w+)$/.test(pathname)) {
            const fullPath = `${origin}${pathname}`;
            const pathArr = fullPath.split('/');
            pathArr.pop();
            return pathArr.join('/') + '/';
        }
        return `${origin}${pathname}/`.replace(/\/\/$/, '/');
    }
    /**
     * Complete address
     * @param path address
     * @param baseURI base url(app.url)
     */
    function CompletionPath(path, baseURI) {
        if (!path ||
            /^((((ht|f)tps?)|file):)?\/\//.test(path) ||
            /^(data|blob):/.test(path))
            return path;
        return createURL(path, getEffectivePath(addProtocol(baseURI))).toString();
    }
    /**
     * Get the folder where the link resource is located,
     * which is used to complete the relative address in the css
     * @param linkPath full link address
     */
    function getLinkFileDir(linkPath) {
        const pathArr = linkPath.split('/');
        pathArr.pop();
        return addProtocol(pathArr.join('/') + '/');
    }
    /**
     * promise stream
     * @param promiseList promise list
     * @param successCb success callback
     * @param errorCb failed callback
     * @param finallyCb finally callback
     */
    function promiseStream(promiseList, successCb, errorCb, finallyCb) {
        let finishedNum = 0;
        function isFinished() {
            if (++finishedNum === promiseList.length && finallyCb)
                finallyCb();
        }
        promiseList.forEach((p, i) => {
            if (isPromise(p)) {
                p.then((res) => {
                    successCb({ data: res, index: i });
                    isFinished();
                }).catch((err) => {
                    errorCb({ error: err, index: i });
                    isFinished();
                });
            }
            else {
                successCb({ data: p, index: i });
                isFinished();
            }
        });
    }
    // Check whether the browser supports module script
    function isSupportModuleScript() {
        const s = document.createElement('script');
        return 'noModule' in s;
    }
    // Create a random symbol string
    function createNonceSrc() {
        return 'inline-' + Math.random().toString(36).substr(2, 15);
    }
    // Array deduplication
    function unique(array) {
        return array.filter(function (item) {
            return item in this ? false : (this[item] = true);
        }, Object.create(null));
    }
    // requestIdleCallback polyfill
    const requestIdleCallback = globalThis$1.requestIdleCallback ||
        function (fn) {
            const lastTime = Date.now();
            return setTimeout(function () {
                fn({
                    didTimeout: false,
                    timeRemaining() {
                        return Math.max(0, 50 - (Date.now() - lastTime));
                    },
                });
            }, 1);
        };
    /**
     * Wrap requestIdleCallback with promise
     * Exec callback when browser idle
     */
    function promiseRequestIdle(callback) {
        return new Promise((resolve) => {
            requestIdleCallback(() => {
                callback(resolve);
            });
        });
    }
    /**
     * Record the currently running app.name
     */
    let currentMicroAppName = null;
    function setCurrentAppName(appName) {
        currentMicroAppName = appName;
    }
    // get the currently running app.name
    function getCurrentAppName() {
        return currentMicroAppName;
    }
    // Clear appName
    let preventSetAppName = false;
    function removeDomScope(force) {
        setCurrentAppName(null);
        if (force && !preventSetAppName) {
            preventSetAppName = true;
            defer(() => {
                preventSetAppName = false;
            });
        }
    }
    function throttleDeferForSetAppName(appName) {
        if (currentMicroAppName !== appName && !preventSetAppName) {
            setCurrentAppName(appName);
            defer(() => {
                setCurrentAppName(null);
            });
        }
    }
    /**
     * Create pure elements
     */
    function pureCreateElement(tagName, options) {
        const element = (window.rawDocument || document).createElement(tagName, options);
        if (element.__MICRO_APP_NAME__)
            delete element.__MICRO_APP_NAME__;
        element.__PURE_ELEMENT__ = true;
        return element;
    }
    // is invalid key of querySelector
    function isInvalidQuerySelectorKey(key) {
        return !key || /(^\d)|([^\w\d-_\u4e00-\u9fa5])/gi.test(key);
    }
    // unique element
    function isUniqueElement(key) {
        return (/^body$/i.test(key) ||
            /^head$/i.test(key) ||
            /^html$/i.test(key) ||
            /^title$/i.test(key) ||
            /^:root$/i.test(key));
    }
    /**
     * get micro-app element
     * @param target app container
     */
    function getRootContainer(target) {
        return (isShadowRoot(target) ? target.host : target);
    }
    /**
     * trim start & end
     */
    function trim$1(str) {
        return str ? str.replace(/^\s+|\s+$/g, '') : '';
    }
    function isFireFox() {
        return navigator.userAgent.indexOf('Firefox') > -1;
    }
    /**
     * Transforms a queryString into object.
     * @param search - search string to parse
     * @returns a query object
     */
    function parseQuery(search) {
        const result = {};
        const queryList = search.split('&');
        // we will not decode the key/value to ensure that the values are consistent when update URL
        for (const queryItem of queryList) {
            const eqPos = queryItem.indexOf('=');
            const key = eqPos < 0 ? queryItem : queryItem.slice(0, eqPos);
            const value = eqPos < 0 ? null : queryItem.slice(eqPos + 1);
            if (key in result) {
                let currentValue = result[key];
                if (!isArray$1(currentValue)) {
                    currentValue = result[key] = [currentValue];
                }
                currentValue.push(value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    /**
     * Transforms an object to query string
     * @param queryObject - query object to stringify
     * @returns query string without the leading `?`
     */
    function stringifyQuery(queryObject) {
        let result = '';
        for (const key in queryObject) {
            const value = queryObject[key];
            if (isNull(value)) {
                result += (result.length ? '&' : '') + key;
            }
            else {
                const valueList = isArray$1(value) ? value : [value];
                valueList.forEach(value => {
                    if (!isUndefined$1(value)) {
                        result += (result.length ? '&' : '') + key;
                        if (!isNull(value))
                            result += '=' + value;
                    }
                });
            }
        }
        return result;
    }
    /**
     * Register or unregister callback/guard with Set
     */
    function useSetRecord() {
        const handlers = new Set();
        function add(handler) {
            handlers.add(handler);
            return () => {
                if (handlers.has(handler))
                    return handlers.delete(handler);
                return false;
            };
        }
        return {
            add,
            list: () => handlers,
        };
    }
    /**
     * record data with Map
     */
    function useMapRecord() {
        const data = new Map();
        function add(key, value) {
            data.set(key, value);
            return () => {
                if (data.has(key))
                    return data.delete(key);
                return false;
            };
        }
        return {
            add,
            get: (key) => data.get(key),
            delete: (key) => {
                if (data.has(key))
                    return data.delete(key);
                return false;
            }
        };
    }
    function getAttributes(element) {
        const attr = element.attributes;
        const attrMap = new Map();
        for (let i = 0; i < attr.length; i++) {
            attrMap.set(attr[i].name, attr[i].value);
        }
        return attrMap;
    }
    /**
     * if fiberTasks exist, wrap callback with promiseRequestIdle
     * if not, execute callback
     * @param fiberTasks fiber task list
     * @param callback action callback
     */
    function injectFiberTask(fiberTasks, callback) {
        if (fiberTasks) {
            fiberTasks.push(() => promiseRequestIdle((resolve) => {
                callback();
                resolve();
            }));
        }
        else {
            callback();
        }
    }
    /**
     * serial exec fiber task of link, style, script
     * @param tasks task array or null
     */
    function serialExecFiberTasks(tasks) {
        return (tasks === null || tasks === void 0 ? void 0 : tasks.reduce((pre, next) => pre.then(next), Promise.resolve())) || null;
    }
    /**
     * inline script start with inline-xxx
     * @param address source address
     */
    function isInlineScript(address) {
        return address.startsWith('inline-');
    }
    /**
     * call function with try catch
     * @param fn target function
     * @param appName app.name
     * @param args arguments
     */
    function execMicroAppGlobalHook(fn, appName, hookName, ...args) {
        try {
            isFunction$1(fn) && fn(...args);
        }
        catch (e) {
            logError(`An error occurred in app ${appName} window.${hookName} \n`, null, e);
        }
    }
    /**
     * remove all childNode from target node
     * @param $dom target node
     */
    function clearDOM($dom) {
        while ($dom === null || $dom === void 0 ? void 0 : $dom.firstChild) {
            $dom.removeChild($dom.firstChild);
        }
    }
    /**
     * get HTMLElement from base app
     * @returns HTMLElement
     */
    function getBaseHTMLElement() {
        var _a;
        return (((_a = window.rawWindow) === null || _a === void 0 ? void 0 : _a.HTMLElement) || window.HTMLElement);
    }

    function formatEventInfo(event, element) {
        Object.defineProperties(event, {
            currentTarget: {
                get() {
                    return element;
                }
            },
            target: {
                get() {
                    return element;
                }
            },
        });
    }
    /**
     * dispatch lifeCycles event to base app
     * created, beforemount, mounted, unmount, error
     * @param element container
     * @param appName app.name
     * @param lifecycleName lifeCycle name
     * @param error param from error hook
     */
    function dispatchLifecyclesEvent(element, appName, lifecycleName, error) {
        var _a;
        if (!element) {
            return logError(`element does not exist in lifecycle ${lifecycleName}`, appName);
        }
        element = getRootContainer(element);
        // clear dom scope before dispatch lifeCycles event to base app, especially mounted & unmount
        removeDomScope();
        const detail = assign({
            name: appName,
            container: element,
        }, error && {
            error
        });
        const event = new CustomEvent(lifecycleName, {
            detail,
        });
        formatEventInfo(event, element);
        // global hooks
        if (isFunction$1((_a = microApp.options.lifeCycles) === null || _a === void 0 ? void 0 : _a[lifecycleName])) {
            microApp.options.lifeCycles[lifecycleName](event);
        }
        element.dispatchEvent(event);
    }
    /**
     * Dispatch custom event to micro app
     * @param app app
     * @param eventName event name ['unmount', 'appstate-change']
     * @param detail event detail
     */
    function dispatchCustomEventToMicroApp(app, eventName, detail = {}) {
        var _a;
        const event = new CustomEvent(eventName, {
            detail,
        });
        (_a = app.sandBox) === null || _a === void 0 ? void 0 : _a.microAppWindow.dispatchEvent(event);
    }

    /**
     * fetch source of html, js, css
     * @param url source path
     * @param appName app name
     * @param config fetch options
     */
    function fetchSource(url, appName = null, options = {}) {
        /**
         * When child navigate to new async page, click event will scope dom to child and then fetch new source
         * this may cause error when fetch rewrite by baseApp
         * e.g.
         * baseApp: <script crossorigin src="https://sgm-static.jd.com/sgm-2.8.0.js" name="SGMH5" sid="6f88a6e4ba4b4ae5acef2ec22c075085" appKey="jdb-adminb2b-pc"></script>
         */
        removeDomScope();
        if (isFunction$1(microApp.options.fetch)) {
            return microApp.options.fetch(url, options, appName);
        }
        // Don’t use globalEnv.rawWindow.fetch, will cause sgm-2.8.0.js throw error in nest app
        return window.fetch(url, options).then((res) => {
            return res.text();
        });
    }

    class HTMLLoader {
        static getInstance() {
            if (!this.instance) {
                this.instance = new HTMLLoader();
            }
            return this.instance;
        }
        /**
         * run logic of load and format html
         * @param successCb success callback
         * @param errorCb error callback, type: (err: Error, meetFetchErr: boolean) => void
         */
        run(app, successCb) {
            const appName = app.name;
            const htmlUrl = app.ssrUrl || app.url;
            const htmlPromise = htmlUrl.includes('.js')
                ? Promise.resolve(`<micro-app-head><script src='${htmlUrl}'></script></micro-app-head><micro-app-body></micro-app-body>`)
                : fetchSource(htmlUrl, appName, { cache: 'no-cache' });
            htmlPromise.then((htmlStr) => {
                if (!htmlStr) {
                    const msg = 'html is empty, please check in detail';
                    app.onerror(new Error(msg));
                    return logError(msg, appName);
                }
                htmlStr = this.formatHTML(htmlUrl, htmlStr, appName);
                successCb(htmlStr, app);
            }).catch((e) => {
                logError(`Failed to fetch data from ${app.url}, micro-app stop rendering`, appName, e);
                app.onLoadError(e);
            });
        }
        formatHTML(htmlUrl, htmlStr, appName) {
            return this.processHtml(htmlUrl, htmlStr, appName, microApp.options.plugins)
                .replace(/<head[^>]*>[\s\S]*?<\/head>/i, (match) => {
                return match
                    .replace(/<head/i, '<micro-app-head')
                    .replace(/<\/head>/i, '</micro-app-head>');
            })
                .replace(/<body[^>]*>[\s\S]*?<\/body>/i, (match) => {
                return match
                    .replace(/<body/i, '<micro-app-body')
                    .replace(/<\/body>/i, '</micro-app-body>');
            });
        }
        processHtml(url, code, appName, plugins) {
            var _a;
            if (!plugins)
                return code;
            const mergedPlugins = [];
            plugins.global && mergedPlugins.push(...plugins.global);
            ((_a = plugins.modules) === null || _a === void 0 ? void 0 : _a[appName]) && mergedPlugins.push(...plugins.modules[appName]);
            if (mergedPlugins.length > 0) {
                return mergedPlugins.reduce((preCode, plugin) => {
                    if (isPlainObject$1(plugin) && isFunction$1(plugin.processHtml)) {
                        return plugin.processHtml(preCode, url);
                    }
                    return preCode;
                }, code);
            }
            return code;
        }
    }

    // common reg
    const rootSelectorREG = /(^|\s+)(html|:root)(?=[\s>~[.#:]+|$)/;
    const bodySelectorREG = /(^|\s+)((html[\s>~]+body)|body)(?=[\s>~[.#:]+|$)/;
    function parseError(msg, linkPath) {
        msg = linkPath ? `${linkPath} ${msg}` : msg;
        const err = new Error(msg);
        err.reason = msg;
        if (linkPath) {
            err.filename = linkPath;
        }
        throw err;
    }
    /**
     * Reference https://github.com/reworkcss/css
     * CSSParser mainly deals with 3 scenes: styleRule, @, and comment
     * And scopecss deals with 2 scenes: selector & url
     * And can also disable scopecss with inline comments
     */
    class CSSParser {
        constructor() {
            this.cssText = ''; // css content
            this.prefix = ''; // prefix as micro-app[name=xxx]
            this.baseURI = ''; // domain name
            this.linkPath = ''; // link resource address, if it is the style converted from link, it will have linkPath
            this.result = ''; // parsed cssText
            this.scopecssDisable = false; // use block comments /* scopecss-disable */ to disable scopecss in your file, and use /* scopecss-enable */ to enable scopecss
            this.scopecssDisableSelectors = []; // disable or enable scopecss for specific selectors
            this.scopecssDisableNextLine = false; // use block comments /* scopecss-disable-next-line */ to disable scopecss on a specific line
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSMediaRule
            this.mediaRule = this.createMatcherForRuleWithChildRule(/^@media *([^{]+)/, '@media');
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSSupportsRule
            this.supportsRule = this.createMatcherForRuleWithChildRule(/^@supports *([^{]+)/, '@supports');
            this.documentRule = this.createMatcherForRuleWithChildRule(/^@([-\w]+)?document *([^{]+)/, '@document');
            this.hostRule = this.createMatcherForRuleWithChildRule(/^@host\s*/, '@host');
            // :global is CSS Modules rule, it will be converted to normal syntax
            // private globalRule = this.createMatcherForRuleWithChildRule(/^:global([^{]*)/, ':global')
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSImportRule
            this.importRule = this.createMatcherForNoneBraceAtRule('import');
            // Removed in most browsers
            this.charsetRule = this.createMatcherForNoneBraceAtRule('charset');
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSNamespaceRule
            this.namespaceRule = this.createMatcherForNoneBraceAtRule('namespace');
            // https://developer.mozilla.org/en-US/docs/Web/CSS/@container
            this.containerRule = this.createMatcherForRuleWithChildRule(/^@container *([^{]+)/, '@container');
        }
        exec(cssText, prefix, baseURI, linkPath) {
            this.cssText = cssText;
            this.prefix = prefix;
            this.baseURI = baseURI;
            this.linkPath = linkPath || '';
            this.matchRules();
            return isFireFox() ? decodeURIComponent(this.result) : this.result;
        }
        reset() {
            this.cssText = this.prefix = this.baseURI = this.linkPath = this.result = '';
            this.scopecssDisable = this.scopecssDisableNextLine = false;
            this.scopecssDisableSelectors = [];
        }
        // core action for match rules
        matchRules() {
            this.matchLeadingSpaces();
            this.matchComments();
            while (this.cssText.length &&
                this.cssText.charAt(0) !== '}' &&
                (this.matchAtRule() || this.matchStyleRule())) {
                this.matchComments();
            }
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleRule
        matchStyleRule() {
            const selectors = this.formatSelector(true);
            // reset scopecssDisableNextLine
            this.scopecssDisableNextLine = false;
            if (!selectors)
                return parseError('selector missing', this.linkPath);
            this.recordResult(selectors);
            this.matchComments();
            this.styleDeclarations();
            this.matchLeadingSpaces();
            return true;
        }
        formatSelector(skip) {
            const m = this.commonMatch(/^[^{]+/, skip);
            if (!m)
                return false;
            return m[0].replace(/(^|,[\n\s]*)([^,]+)/g, (_, separator, selector) => {
                selector = trim$1(selector);
                if (!(this.scopecssDisableNextLine ||
                    (this.scopecssDisable && (!this.scopecssDisableSelectors.length ||
                        this.scopecssDisableSelectors.includes(selector))) ||
                    rootSelectorREG.test(selector))) {
                    if (bodySelectorREG.test(selector)) {
                        selector = selector.replace(bodySelectorREG, this.prefix + ' micro-app-body');
                    }
                    else {
                        selector = this.prefix + ' ' + selector;
                    }
                }
                return separator + selector;
            });
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
        styleDeclarations() {
            if (!this.matchOpenBrace())
                return parseError("Declaration missing '{'", this.linkPath);
            this.matchAllDeclarations();
            if (!this.matchCloseBrace())
                return parseError("Declaration missing '}'", this.linkPath);
            return true;
        }
        matchAllDeclarations(nesting = 1) {
            let cssValue = this.commonMatch(/^(?:url\(["']?(?:[^)"'}]+)["']?\)|[^{}/])*/, true)[0];
            if (cssValue) {
                if (!this.scopecssDisableNextLine &&
                    (!this.scopecssDisable || this.scopecssDisableSelectors.length)) {
                    cssValue = cssValue.replace(/url\(["']?([^)"']+)["']?\)/gm, (all, $1) => {
                        if (/^((data|blob):|#)/.test($1) || /^(https?:)?\/\//.test($1)) {
                            return all;
                        }
                        // ./a/b.png  ../a/b.png  a/b.png
                        if (/^((\.\.?\/)|[^/])/.test($1) && this.linkPath) {
                            this.baseURI = getLinkFileDir(this.linkPath);
                        }
                        return `url("${CompletionPath($1, this.baseURI)}")`;
                    });
                }
                this.recordResult(cssValue);
            }
            // reset scopecssDisableNextLine
            this.scopecssDisableNextLine = false;
            if (!this.cssText)
                return;
            if (this.cssText.charAt(0) === '}') {
                if (!nesting)
                    return;
                if (nesting > 1) {
                    this.commonMatch(/}+/);
                }
                return this.matchAllDeclarations(nesting - 1);
            }
            // extract comments in declarations
            if (this.cssText.charAt(0) === '/') {
                if (this.cssText.charAt(1) === '*') {
                    this.matchComments();
                }
                else {
                    this.commonMatch(/\/+/);
                }
            }
            if (this.cssText.charAt(0) === '{') {
                this.commonMatch(/{+\s*/);
                nesting++;
            }
            return this.matchAllDeclarations(nesting);
        }
        matchAtRule() {
            if (this.cssText[0] !== '@')
                return false;
            // reset scopecssDisableNextLine
            this.scopecssDisableNextLine = false;
            return this.keyframesRule() ||
                this.mediaRule() ||
                this.customMediaRule() ||
                this.supportsRule() ||
                this.importRule() ||
                this.charsetRule() ||
                this.namespaceRule() ||
                this.containerRule() ||
                this.documentRule() ||
                this.pageRule() ||
                this.hostRule() ||
                this.fontFaceRule();
        }
        // :global is CSS Modules rule, it will be converted to normal syntax
        // private matchGlobalRule (): boolean | void {
        //   if (this.cssText[0] !== ':') return false
        //   // reset scopecssDisableNextLine
        //   this.scopecssDisableNextLine = false
        //   return this.globalRule()
        // }
        // https://developer.mozilla.org/en-US/docs/Web/API/CSSKeyframesRule
        keyframesRule() {
            if (!this.commonMatch(/^@([-\w]+)?keyframes\s*/))
                return false;
            if (!this.commonMatch(/^[^{]+/))
                return parseError('@keyframes missing name', this.linkPath);
            this.matchComments();
            if (!this.matchOpenBrace())
                return parseError("@keyframes missing '{'", this.linkPath);
            this.matchComments();
            while (this.keyframeRule()) {
                this.matchComments();
            }
            if (!this.matchCloseBrace())
                return parseError("@keyframes missing '}'", this.linkPath);
            this.matchLeadingSpaces();
            return true;
        }
        keyframeRule() {
            let r;
            const valList = [];
            while (r = this.commonMatch(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
                valList.push(r[1]);
                this.commonMatch(/^,\s*/);
            }
            if (!valList.length)
                return false;
            this.styleDeclarations();
            this.matchLeadingSpaces();
            return true;
        }
        // https://github.com/postcss/postcss-custom-media
        customMediaRule() {
            if (!this.commonMatch(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/))
                return false;
            this.matchLeadingSpaces();
            return true;
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/CSSPageRule
        pageRule() {
            if (!this.commonMatch(/^@page */))
                return false;
            this.formatSelector(false);
            // reset scopecssDisableNextLine
            this.scopecssDisableNextLine = false;
            return this.commonHandlerForAtRuleWithSelfRule('page');
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/CSSFontFaceRule
        fontFaceRule() {
            if (!this.commonMatch(/^@font-face\s*/))
                return false;
            return this.commonHandlerForAtRuleWithSelfRule('font-face');
        }
        // common matcher for @media, @supports, @document, @host, :global, @container
        createMatcherForRuleWithChildRule(reg, name) {
            return () => {
                if (!this.commonMatch(reg))
                    return false;
                if (!this.matchOpenBrace())
                    return parseError(`${name} missing '{'`, this.linkPath);
                this.matchComments();
                this.matchRules();
                if (!this.matchCloseBrace())
                    return parseError(`${name} missing '}'`, this.linkPath);
                this.matchLeadingSpaces();
                return true;
            };
        }
        // common matcher for @import, @charset, @namespace
        createMatcherForNoneBraceAtRule(name) {
            const reg = new RegExp('^@' + name + '\\s*([^;]+);');
            return () => {
                if (!this.commonMatch(reg))
                    return false;
                this.matchLeadingSpaces();
                return true;
            };
        }
        // common handler for @font-face, @page
        commonHandlerForAtRuleWithSelfRule(name) {
            if (!this.matchOpenBrace())
                return parseError(`@${name} missing '{'`, this.linkPath);
            this.matchAllDeclarations();
            if (!this.matchCloseBrace())
                return parseError(`@${name} missing '}'`, this.linkPath);
            this.matchLeadingSpaces();
            return true;
        }
        // match and slice comments
        matchComments() {
            while (this.matchComment())
                ;
        }
        // css comment
        matchComment() {
            if (this.cssText.charAt(0) !== '/' || this.cssText.charAt(1) !== '*')
                return false;
            // reset scopecssDisableNextLine
            this.scopecssDisableNextLine = false;
            let i = 2;
            while (this.cssText.charAt(i) !== '' && (this.cssText.charAt(i) !== '*' || this.cssText.charAt(i + 1) !== '/'))
                ++i;
            i += 2;
            if (this.cssText.charAt(i - 1) === '') {
                return parseError('End of comment missing', this.linkPath);
            }
            // get comment content
            let commentText = this.cssText.slice(2, i - 2);
            this.recordResult(`/*${commentText}*/`);
            commentText = trim$1(commentText.replace(/^\s*!/, ''));
            // set ignore config
            if (commentText === 'scopecss-disable-next-line') {
                this.scopecssDisableNextLine = true;
            }
            else if (/^scopecss-disable/.test(commentText)) {
                if (commentText === 'scopecss-disable') {
                    this.scopecssDisable = true;
                }
                else {
                    this.scopecssDisable = true;
                    const ignoreRules = commentText.replace('scopecss-disable', '').split(',');
                    ignoreRules.forEach((rule) => {
                        this.scopecssDisableSelectors.push(trim$1(rule));
                    });
                }
            }
            else if (commentText === 'scopecss-enable') {
                this.scopecssDisable = false;
                this.scopecssDisableSelectors = [];
            }
            this.cssText = this.cssText.slice(i);
            this.matchLeadingSpaces();
            return true;
        }
        commonMatch(reg, skip = false) {
            const matchArray = reg.exec(this.cssText);
            if (!matchArray)
                return;
            const matchStr = matchArray[0];
            this.cssText = this.cssText.slice(matchStr.length);
            if (!skip)
                this.recordResult(matchStr);
            return matchArray;
        }
        matchOpenBrace() {
            return this.commonMatch(/^{\s*/);
        }
        matchCloseBrace() {
            return this.commonMatch(/^}/);
        }
        // match and slice the leading spaces
        matchLeadingSpaces() {
            this.commonMatch(/^\s*/);
        }
        // splice string
        recordResult(strFragment) {
            // Firefox performance degradation when string contain special characters, see https://github.com/micro-zoe/micro-app/issues/256
            if (isFireFox()) {
                this.result += encodeURIComponent(strFragment);
            }
            else {
                this.result += strFragment;
            }
        }
    }
    /**
     * common method of bind CSS
     */
    function commonAction(styleElement, appName, prefix, baseURI, linkPath) {
        if (!styleElement.__MICRO_APP_HAS_SCOPED__) {
            styleElement.__MICRO_APP_HAS_SCOPED__ = true;
            let result = null;
            try {
                result = parser.exec(styleElement.textContent, prefix, baseURI, linkPath);
                parser.reset();
            }
            catch (e) {
                parser.reset();
                logError('An error occurred while parsing CSS:\n', appName, e);
            }
            if (result)
                styleElement.textContent = result;
        }
    }
    let parser;
    /**
     * scopedCSS
     * @param styleElement target style element
     * @param appName app name
     */
    function scopedCSS(styleElement, app, linkPath) {
        if (app.scopecss) {
            const prefix = createPrefix(app.name);
            if (!parser)
                parser = new CSSParser();
            if (styleElement.textContent) {
                commonAction(styleElement, app.name, prefix, app.url, linkPath);
            }
            else {
                const observer = new MutationObserver(function () {
                    observer.disconnect();
                    // styled-component will be ignore
                    if (styleElement.textContent && !styleElement.hasAttribute('data-styled')) {
                        commonAction(styleElement, app.name, prefix, app.url, linkPath);
                    }
                });
                observer.observe(styleElement, { childList: true });
            }
        }
        return styleElement;
    }
    function createPrefix(appName, reg = false) {
        const regCharacter = reg ? '\\' : '';
        return `${microApp.tagName}${regCharacter}[name=${appName}${regCharacter}]`;
    }

    function eventHandler(event, element) {
        Object.defineProperties(event, {
            currentTarget: {
                get() {
                    return element;
                }
            },
            srcElement: {
                get() {
                    return element;
                }
            },
            target: {
                get() {
                    return element;
                }
            },
        });
    }
    function dispatchOnLoadEvent(element) {
        const event = new CustomEvent('load');
        eventHandler(event, element);
        if (isFunction$1(element.onload)) {
            element.onload(event);
        }
        else {
            element.dispatchEvent(event);
        }
    }
    function dispatchOnErrorEvent(element) {
        const event = new CustomEvent('error');
        eventHandler(event, element);
        if (isFunction$1(element.onerror)) {
            element.onerror(event);
        }
        else {
            element.dispatchEvent(event);
        }
    }

    /**
     * SourceCenter is a resource management center
     * All html, js, css will be recorded and processed here
     * NOTE:
     * 1. All resources are global and shared between apps
     * 2. Pay attention to the case of html with parameters
     * 3. The resource is first processed by the plugin
     */
    function createSourceCenter() {
        const linkList = new Map();
        const scriptList = new Map();
        function createSourceHandler(targetList) {
            return {
                setInfo(address, info) {
                    targetList.set(address, info);
                },
                getInfo(address) {
                    var _a;
                    return (_a = targetList.get(address)) !== null && _a !== void 0 ? _a : null;
                },
                hasInfo(address) {
                    return targetList.has(address);
                },
                deleteInfo(address) {
                    return targetList.delete(address);
                }
            };
        }
        return {
            link: createSourceHandler(linkList),
            script: Object.assign(Object.assign({}, createSourceHandler(scriptList)), { deleteInlineInfo(addressList) {
                    addressList.forEach((address) => {
                        if (isInlineScript(address)) {
                            scriptList.delete(address);
                        }
                    });
                } }),
        };
    }
    var sourceCenter = createSourceCenter();

    /**
     *
     * @param appName app.name
     * @param linkInfo linkInfo of current address
     */
    function getExistParseCode(appName, prefix, linkInfo) {
        const appSpace = linkInfo.appSpace;
        for (const item in appSpace) {
            if (item !== appName) {
                const appSpaceData = appSpace[item];
                if (appSpaceData.parsedCode) {
                    return appSpaceData.parsedCode.replace(new RegExp(createPrefix(item, true), 'g'), prefix);
                }
            }
        }
    }
    // transfer the attributes on the link to convertStyle
    function setConvertStyleAttr(convertStyle, attrs) {
        attrs.forEach((value, key) => {
            if (key === 'rel')
                return;
            if (key === 'href')
                key = 'data-origin-href';
            globalEnv.rawSetAttribute.call(convertStyle, key, value);
        });
    }
    /**
     * Extract link elements
     * @param link link element
     * @param parent parent element of link
     * @param app app
     * @param microAppHead micro-app-head element
     * @param isDynamic dynamic insert
     */
    function extractLinkFromHtml(link, parent, app, isDynamic = false) {
        const rel = link.getAttribute('rel');
        let href = link.getAttribute('href');
        let replaceComment = null;
        if (rel === 'stylesheet' && href) {
            href = CompletionPath(href, app.url);
            let linkInfo = sourceCenter.link.getInfo(href);
            const appSpaceData = {
                attrs: getAttributes(link),
            };
            if (!linkInfo) {
                linkInfo = {
                    code: '',
                    appSpace: {
                        [app.name]: appSpaceData,
                    }
                };
            }
            else {
                linkInfo.appSpace[app.name] = linkInfo.appSpace[app.name] || appSpaceData;
            }
            sourceCenter.link.setInfo(href, linkInfo);
            if (!isDynamic) {
                app.source.links.add(href);
                replaceComment = document.createComment(`link element with href=${href} move to micro-app-head as style element`);
                linkInfo.appSpace[app.name].placeholder = replaceComment;
            }
            else {
                return { address: href, linkInfo };
            }
        }
        else if (rel && ['prefetch', 'preload', 'prerender'].includes(rel)) {
            // preload prefetch prerender ....
            if (isDynamic) {
                replaceComment = document.createComment(`link element with rel=${rel}${href ? ' & href=' + href : ''} removed by micro-app`);
            }
            else {
                parent === null || parent === void 0 ? void 0 : parent.removeChild(link);
            }
        }
        else if (href) {
            // dns-prefetch preconnect modulepreload search ....
            globalEnv.rawSetAttribute.call(link, 'href', CompletionPath(href, app.url));
        }
        if (isDynamic) {
            return { replaceComment };
        }
        else if (replaceComment) {
            return parent === null || parent === void 0 ? void 0 : parent.replaceChild(replaceComment, link);
        }
    }
    /**
     * Get link remote resources
     * @param wrapElement htmlDom
     * @param app app
     * @param microAppHead micro-app-head
     */
    function fetchLinksFromHtml(wrapElement, app, microAppHead, fiberStyleResult) {
        const styleList = Array.from(app.source.links);
        const fetchLinkPromise = styleList.map((address) => {
            const linkInfo = sourceCenter.link.getInfo(address);
            return linkInfo.code ? linkInfo.code : fetchSource(address, app.name);
        });
        const fiberLinkTasks = fiberStyleResult ? [] : null;
        promiseStream(fetchLinkPromise, (res) => {
            injectFiberTask(fiberLinkTasks, () => fetchLinkSuccess(styleList[res.index], res.data, microAppHead, app));
        }, (err) => {
            logError(err, app.name);
        }, () => {
            /**
             * 1. If fiberStyleResult exist, fiberLinkTasks must exist
             * 2. Download link source while processing style
             * 3. Process style first, and then process link
             */
            if (fiberStyleResult) {
                fiberStyleResult.then(() => {
                    fiberLinkTasks.push(() => Promise.resolve(app.onLoad({ html: wrapElement })));
                    serialExecFiberTasks(fiberLinkTasks);
                });
            }
            else {
                app.onLoad({ html: wrapElement });
            }
        });
    }
    /**
     * Fetch link succeeded, replace placeholder with style tag
     * NOTE:
     * 1. Only exec when init, no longer exec when remount
     * 2. Only handler html link element, not dynamic link or style
     * 3. The same prefix can reuse parsedCode
     * 4. Async exec with requestIdleCallback in prefetch or fiber
     * 5. appSpace[app.name].placeholder/attrs must exist
     * @param address resource address
     * @param code link source code
     * @param microAppHead micro-app-head
     * @param app app instance
     */
    function fetchLinkSuccess(address, code, microAppHead, app) {
        /**
         * linkInfo must exist, but linkInfo.code not
         * so we set code to linkInfo.code
         */
        const linkInfo = sourceCenter.link.getInfo(address);
        linkInfo.code = code;
        const appSpaceData = linkInfo.appSpace[app.name];
        const placeholder = appSpaceData.placeholder;
        /**
         * When prefetch app is replaced by a new app in the processing phase, since the linkInfo is common, when the linkInfo of the prefetch app is processed, it may have already been processed.
         * This causes placeholder to be possibly null
         * e.g.
         * 1. prefetch app.url different from <micro-app></micro-app>
         * 2. prefetch param different from <micro-app></micro-app>
         */
        if (placeholder) {
            const convertStyle = pureCreateElement('style');
            handleConvertStyle(app, address, convertStyle, linkInfo, appSpaceData.attrs);
            if (placeholder.parentNode) {
                placeholder.parentNode.replaceChild(convertStyle, placeholder);
            }
            else {
                microAppHead.appendChild(convertStyle);
            }
            // clear placeholder
            appSpaceData.placeholder = null;
        }
    }
    /**
     * Get parsedCode, update convertStyle
     * Actions:
     * 1. get scope css (through scopedCSS or oldData)
     * 2. record parsedCode
     * 3. set parsedCode to convertStyle if need
     * @param app app instance
     * @param address resource address
     * @param convertStyle converted style
     * @param linkInfo linkInfo in sourceCenter
     * @param attrs attrs of link
     */
    function handleConvertStyle(app, address, convertStyle, linkInfo, attrs) {
        if (app.scopecss) {
            const appSpaceData = linkInfo.appSpace[app.name];
            appSpaceData.prefix = appSpaceData.prefix || createPrefix(app.name);
            if (!appSpaceData.parsedCode) {
                const existParsedCode = getExistParseCode(app.name, appSpaceData.prefix, linkInfo);
                if (!existParsedCode) {
                    convertStyle.textContent = linkInfo.code;
                    scopedCSS(convertStyle, app, address);
                }
                else {
                    convertStyle.textContent = existParsedCode;
                }
                appSpaceData.parsedCode = convertStyle.textContent;
            }
            else {
                convertStyle.textContent = appSpaceData.parsedCode;
            }
        }
        else {
            convertStyle.textContent = linkInfo.code;
        }
        setConvertStyleAttr(convertStyle, attrs);
    }
    /**
     * Handle css of dynamic link
     * @param address link address
     * @param app app
     * @param linkInfo linkInfo
     * @param originLink origin link element
     */
    function formatDynamicLink(address, app, linkInfo, originLink) {
        const convertStyle = pureCreateElement('style');
        const handleDynamicLink = () => {
            handleConvertStyle(app, address, convertStyle, linkInfo, linkInfo.appSpace[app.name].attrs);
            dispatchOnLoadEvent(originLink);
        };
        if (linkInfo.code) {
            defer(handleDynamicLink);
        }
        else {
            fetchSource(address, app.name).then((data) => {
                linkInfo.code = data;
                handleDynamicLink();
            }).catch((err) => {
                logError(err, app.name);
                dispatchOnErrorEvent(originLink);
            });
        }
        return convertStyle;
    }

    var ObservedAttrName;
    (function (ObservedAttrName) {
        ObservedAttrName["NAME"] = "name";
        ObservedAttrName["URL"] = "url";
    })(ObservedAttrName || (ObservedAttrName = {}));
    // app status
    var appStates;
    (function (appStates) {
        appStates["CREATED"] = "created";
        appStates["LOADING"] = "loading";
        appStates["LOAD_FAILED"] = "load_failed";
        appStates["BEFORE_MOUNT"] = "before_mount";
        appStates["MOUNTING"] = "mounting";
        appStates["MOUNTED"] = "mounted";
        appStates["UNMOUNT"] = "unmount";
    })(appStates || (appStates = {}));
    // lifecycles
    var lifeCycles;
    (function (lifeCycles) {
        lifeCycles["CREATED"] = "created";
        lifeCycles["BEFOREMOUNT"] = "beforemount";
        lifeCycles["MOUNTED"] = "mounted";
        lifeCycles["UNMOUNT"] = "unmount";
        lifeCycles["ERROR"] = "error";
        // 👇 keep-alive only
        lifeCycles["BEFORESHOW"] = "beforeshow";
        lifeCycles["AFTERSHOW"] = "aftershow";
        lifeCycles["AFTERHIDDEN"] = "afterhidden";
    })(lifeCycles || (lifeCycles = {}));
    // global event of child app
    var microGlobalEvent;
    (function (microGlobalEvent) {
        microGlobalEvent["ONMOUNT"] = "onmount";
        microGlobalEvent["ONUNMOUNT"] = "onunmount";
    })(microGlobalEvent || (microGlobalEvent = {}));
    // keep-alive status
    var keepAliveStates;
    (function (keepAliveStates) {
        keepAliveStates["KEEP_ALIVE_SHOW"] = "keep_alive_show";
        keepAliveStates["KEEP_ALIVE_HIDDEN"] = "keep_alive_hidden";
    })(keepAliveStates || (keepAliveStates = {}));
    // micro-app config
    var MicroAppConfig;
    (function (MicroAppConfig) {
        MicroAppConfig["DESTROY"] = "destroy";
        MicroAppConfig["DESTORY"] = "destory";
        MicroAppConfig["INLINE"] = "inline";
        MicroAppConfig["DISABLESCOPECSS"] = "disableScopecss";
        MicroAppConfig["DISABLESANDBOX"] = "disableSandbox";
        MicroAppConfig["DISABLE_SCOPECSS"] = "disable-scopecss";
        MicroAppConfig["DISABLE_SANDBOX"] = "disable-sandbox";
        MicroAppConfig["DISABLE_MEMORY_ROUTER"] = "disable-memory-router";
        MicroAppConfig["DISABLE_PATCH_REQUEST"] = "disable-patch-request";
        MicroAppConfig["KEEP_ROUTER_STATE"] = "keep-router-state";
        MicroAppConfig["HIDDEN_ROUTER"] = "hidden-router";
        MicroAppConfig["KEEP_ALIVE"] = "keep-alive";
        MicroAppConfig["CLEAR_DATA"] = "clear-data";
        MicroAppConfig["SSR"] = "ssr";
        MicroAppConfig["FIBER"] = "fiber";
    })(MicroAppConfig || (MicroAppConfig = {}));
    // prefetch level
    const PREFETCH_LEVEL = [1, 2, 3];
    // memory router constants
    // default mode, child router info will sync to browser url
    const DEFAULT_ROUTER_MODE = 'search';
    /**
     * render base on browser url, and location.origin location.href point to base app
     * equal to disable-memory-router
     * NOTE:
     *  1. The only difference between native and native-scope is location.origin, in native-scope mode location.origin point to child app
    */
    const ROUTER_MODE_NATIVE = 'native';
    // render base on browser url, but location.origin location.href point to child app
    const ROUTER_MODE_NATIVE_SCOPE = 'native-scope';
    // search mode, but child router info will not sync to browser url
    const ROUTER_MODE_PURE = 'pure';
    const ROUTER_MODE_LIST = [
        DEFAULT_ROUTER_MODE,
        ROUTER_MODE_NATIVE,
        ROUTER_MODE_NATIVE_SCOPE,
        ROUTER_MODE_PURE,
    ];
    // event bound to child app window
    const SCOPE_WINDOW_EVENT = [
        'popstate',
        'hashchange',
        'load',
        'beforeunload',
        'unload',
        'unmount',
        'appstate-change',
        'statechange',
        'mounted',
    ];
    // on event bound to child app window
    // TODO: with和iframe处理方式不同，需修改
    const SCOPE_WINDOW_ON_EVENT = [
        'onpopstate',
        'onhashchange',
        'onload',
        'onbeforeunload',
        'onunload',
        'onerror'
    ];
    // event bound to child app document
    const SCOPE_DOCUMENT_EVENT = [
        'DOMContentLoaded',
        'readystatechange',
    ];
    // on event bound to child app document
    const SCOPE_DOCUMENT_ON_EVENT = [
        'onreadystatechange',
    ];
    // global key point to window
    const GLOBAL_KEY_TO_WINDOW = [
        'window',
        'self',
        'globalThis',
    ];
    const RAW_GLOBAL_TARGET = ['rawWindow', 'rawDocument'];
    /**
     * global key must be static key, they can not rewrite
     * e.g.
     * window.Promise = newValue
     * new Promise ==> still get old value, not newValue, because they are cached by top function
     * NOTE:
     * 1. Do not add fetch, XMLHttpRequest, EventSource
     */
    const GLOBAL_CACHED_KEY = 'window,self,globalThis,document,Document,Array,Object,String,Boolean,Math,Number,Symbol,Date,Function,Proxy,WeakMap,WeakSet,Set,Map,Reflect,Element,Node,RegExp,Error,TypeError,JSON,isNaN,parseFloat,parseInt,performance,console,decodeURI,encodeURI,decodeURIComponent,encodeURIComponent,navigator,undefined,location,history';

    const scriptTypes = ['text/javascript', 'text/ecmascript', 'application/javascript', 'application/ecmascript', 'module', 'systemjs-module', 'systemjs-importmap'];
    // whether use type='module' script
    function isTypeModule(app, scriptInfo) {
        return scriptInfo.appSpace[app.name].module && (!app.useSandbox || app.iframe);
    }
    // special script element
    function isSpecialScript(app, scriptInfo) {
        const attrs = scriptInfo.appSpace[app.name].attrs;
        return attrs.has('id');
    }
    /**
     * whether to run js in inline mode
     * scene:
     * 1. inline config for app
     * 2. inline attr in script element
     * 3. module script
     * 4. script with special attr
     */
    function isInlineMode(app, scriptInfo) {
        return (app.inline ||
            scriptInfo.appSpace[app.name].inline ||
            isTypeModule(app, scriptInfo) ||
            isSpecialScript(app, scriptInfo));
    }
    // TODO: iframe重新插入window前后不一致，通过iframe Function创建的函数无法复用
    function getEffectWindow(app) {
        return app.iframe ? app.sandBox.microAppWindow : globalEnv.rawWindow;
    }
    // Convert string code to function
    function code2Function(app, code) {
        const targetWindow = getEffectWindow(app);
        return new targetWindow.Function(code);
    }
    /**
     * If the appSpace of the current js address has other app, try to reuse parsedFunction of other app
     * @param appName app.name
     * @param scriptInfo scriptInfo of current address
     * @param currentCode pure code of current address
     */
    function getExistParseResult(app, scriptInfo, currentCode) {
        const appSpace = scriptInfo.appSpace;
        for (const item in appSpace) {
            if (item !== app.name) {
                const appSpaceData = appSpace[item];
                if (appSpaceData.parsedCode === currentCode && appSpaceData.parsedFunction) {
                    return appSpaceData.parsedFunction;
                }
            }
        }
    }
    /**
     * get parsedFunction from exist data or parsedCode
     * @returns parsedFunction
     */
    function getParsedFunction(app, scriptInfo, parsedCode) {
        return getExistParseResult(app, scriptInfo, parsedCode) || code2Function(app, parsedCode);
    }
    // Prevent randomly created strings from repeating
    function getUniqueNonceSrc() {
        const nonceStr = createNonceSrc();
        if (sourceCenter.script.hasInfo(nonceStr)) {
            return getUniqueNonceSrc();
        }
        return nonceStr;
    }
    // transfer the attributes on the script to convertScript
    function setConvertScriptAttr(convertScript, attrs) {
        attrs.forEach((value, key) => {
            if ((key === 'type' && value === 'module') || key === 'defer' || key === 'async')
                return;
            if (key === 'src')
                key = 'data-origin-src';
            globalEnv.rawSetAttribute.call(convertScript, key, value);
        });
    }
    // wrap code in sandbox
    function isWrapInSandBox(app, scriptInfo) {
        return app.useSandbox && !isTypeModule(app, scriptInfo);
    }
    function getSandboxType(app, scriptInfo) {
        return isWrapInSandBox(app, scriptInfo) ? app.iframe ? 'iframe' : 'with' : 'disable';
    }
    /**
     * Extract script elements
     * @param script script element
     * @param parent parent element of script
     * @param app app
     * @param isDynamic dynamic insert
     */
    function extractScriptElement(script, parent, app, isDynamic = false) {
        var _a;
        let replaceComment = null;
        let src = script.getAttribute('src');
        if (src)
            src = CompletionPath(src, app.url);
        if (script.hasAttribute('exclude') || checkExcludeUrl(src, app.name)) {
            replaceComment = document.createComment('script element with exclude attribute removed by micro-app');
        }
        else if ((script.type &&
            !scriptTypes.includes(script.type)) ||
            script.hasAttribute('ignore') ||
            checkIgnoreUrl(src, app.name)) {
            // 配置为忽略的脚本，清空 rawDocument.currentScript，避免被忽略的脚本内获取 currentScript 出错
            if ((_a = globalEnv.rawDocument) === null || _a === void 0 ? void 0 : _a.currentScript) {
                delete globalEnv.rawDocument.currentScript;
            }
            return null;
        }
        else if ((globalEnv.supportModuleScript && script.noModule) ||
            (!globalEnv.supportModuleScript && script.type === 'module')) {
            replaceComment = document.createComment(`${script.noModule ? 'noModule' : 'module'} script ignored by micro-app`);
        }
        else if (src) { // remote script
            let scriptInfo = sourceCenter.script.getInfo(src);
            const appSpaceData = {
                async: script.hasAttribute('async'),
                defer: script.defer || script.type === 'module',
                module: script.type === 'module',
                inline: script.hasAttribute('inline'),
                pure: script.hasAttribute('pure'),
                attrs: getAttributes(script),
            };
            if (!scriptInfo) {
                scriptInfo = {
                    code: '',
                    isExternal: true,
                    appSpace: {
                        [app.name]: appSpaceData,
                    }
                };
            }
            else {
                /**
                 * Reuse when appSpace exists
                 * NOTE:
                 * 1. The same static script, appSpace must be the same (in fact, it may be different when url change)
                 * 2. The same dynamic script, appSpace may be the same, but we still reuse appSpace, which should pay attention
                 */
                scriptInfo.appSpace[app.name] = scriptInfo.appSpace[app.name] || appSpaceData;
            }
            sourceCenter.script.setInfo(src, scriptInfo);
            if (!isDynamic) {
                app.source.scripts.add(src);
                replaceComment = document.createComment(`script with src='${src}' extract by micro-app`);
            }
            else {
                return { address: src, scriptInfo };
            }
        }
        else if (script.textContent) { // inline script
            /**
             * NOTE:
             * 1. Each inline script is unique
             * 2. Every dynamic created inline script will be re-executed
             * ACTION:
             * 1. Delete dynamic inline script info after exec
             * 2. Delete static inline script info when destroy
             */
            const nonceStr = getUniqueNonceSrc();
            const scriptInfo = {
                code: script.textContent,
                isExternal: false,
                appSpace: {
                    [app.name]: {
                        async: false,
                        defer: script.type === 'module',
                        module: script.type === 'module',
                        inline: script.hasAttribute('inline'),
                        pure: script.hasAttribute('pure'),
                        attrs: getAttributes(script),
                    }
                }
            };
            if (!isDynamic) {
                app.source.scripts.add(nonceStr);
                sourceCenter.script.setInfo(nonceStr, scriptInfo);
                replaceComment = document.createComment('inline script extract by micro-app');
            }
            else {
                // Because each dynamic script is unique, it is not put into sourceCenter
                return { address: nonceStr, scriptInfo };
            }
        }
        else if (!isDynamic) {
            /**
             * script with empty src or empty script.textContent remove in static html
             * & not removed if it created by dynamic
             */
            replaceComment = document.createComment('script element removed by micro-app');
        }
        if (isDynamic) {
            return { replaceComment };
        }
        else {
            return parent === null || parent === void 0 ? void 0 : parent.replaceChild(replaceComment, script);
        }
    }
    /**
     * get assets plugins
     * @param appName app name
     */
    function getAssetsPlugins(appName) {
        var _a, _b, _c;
        const globalPlugins = ((_a = microApp.options.plugins) === null || _a === void 0 ? void 0 : _a.global) || [];
        const modulePlugins = ((_c = (_b = microApp.options.plugins) === null || _b === void 0 ? void 0 : _b.modules) === null || _c === void 0 ? void 0 : _c[appName]) || [];
        return [...globalPlugins, ...modulePlugins];
    }
    /**
     * whether the address needs to be excluded
     * @param address css or js link
     * @param plugins microApp plugins
     */
    function checkExcludeUrl(address, appName) {
        if (!address)
            return false;
        const plugins = getAssetsPlugins(appName) || [];
        return plugins.some(plugin => {
            if (!plugin.excludeChecker)
                return false;
            return plugin.excludeChecker(address);
        });
    }
    /**
     * whether the address needs to be ignore
     * @param address css or js link
     * @param plugins microApp plugins
     */
    function checkIgnoreUrl(address, appName) {
        if (!address)
            return false;
        const plugins = getAssetsPlugins(appName) || [];
        return plugins.some(plugin => {
            if (!plugin.ignoreChecker)
                return false;
            return plugin.ignoreChecker(address);
        });
    }
    /**
     *  Get remote resources of script
     * @param wrapElement htmlDom
     * @param app app
     */
    function fetchScriptsFromHtml(wrapElement, app) {
        const scriptList = Array.from(app.source.scripts);
        const fetchScriptPromise = [];
        const fetchScriptPromiseInfo = [];
        for (const address of scriptList) {
            const scriptInfo = sourceCenter.script.getInfo(address);
            const appSpaceData = scriptInfo.appSpace[app.name];
            if ((!appSpaceData.defer && !appSpaceData.async) || (app.isPrefetch && !app.isPrerender)) {
                fetchScriptPromise.push(scriptInfo.code ? scriptInfo.code : fetchSource(address, app.name));
                fetchScriptPromiseInfo.push([address, scriptInfo]);
            }
        }
        const fiberScriptTasks = app.isPrefetch || app.fiber ? [] : null;
        if (fetchScriptPromise.length) {
            promiseStream(fetchScriptPromise, (res) => {
                injectFiberTask(fiberScriptTasks, () => fetchScriptSuccess(fetchScriptPromiseInfo[res.index][0], fetchScriptPromiseInfo[res.index][1], res.data, app));
            }, (err) => {
                logError(err, app.name);
            }, () => {
                if (fiberScriptTasks) {
                    fiberScriptTasks.push(() => Promise.resolve(app.onLoad({ html: wrapElement })));
                    serialExecFiberTasks(fiberScriptTasks);
                }
                else {
                    app.onLoad({ html: wrapElement });
                }
            });
        }
        else {
            app.onLoad({ html: wrapElement });
        }
    }
    /**
     * fetch js succeeded, record the code value
     * @param address script address
     * @param scriptInfo resource script info
     * @param data code
     */
    function fetchScriptSuccess(address, scriptInfo, code, app) {
        // reset scriptInfo.code
        scriptInfo.code = code;
        /**
         * Pre parse script for prefetch, improve rendering performance
         * NOTE:
         * 1. if global parseResult exist, skip this step
         * 2. if app is inline or script is esmodule, skip this step
         * 3. if global parseResult not exist, the current script occupies the position, when js is reused, parseResult is reference
         */
        if (app.isPrefetch && app.prefetchLevel === 2) {
            const appSpaceData = scriptInfo.appSpace[app.name];
            /**
             * When prefetch app is replaced by a new app in the processing phase, since the scriptInfo is common, when the scriptInfo of the prefetch app is processed, it may have already been processed.
             * This causes parsedCode to already exist when preloading ends
             * e.g.
             * 1. prefetch app.url different from <micro-app></micro-app>
             * 2. prefetch param different from <micro-app></micro-app>
             */
            if (!appSpaceData.parsedCode) {
                appSpaceData.parsedCode = bindScope(address, app, code, scriptInfo);
                appSpaceData.sandboxType = getSandboxType(app, scriptInfo);
                if (!isInlineMode(app, scriptInfo)) {
                    try {
                        appSpaceData.parsedFunction = getParsedFunction(app, scriptInfo, appSpaceData.parsedCode);
                    }
                    catch (err) {
                        logError('Something went wrong while handling preloaded resources', app.name, '\n', err);
                    }
                }
            }
        }
    }
    /**
     * Execute js in the mount lifecycle
     * @param app app
     * @param initHook callback for umd mode
     */
    function execScripts(app, initHook) {
        const fiberScriptTasks = app.fiber ? [] : null;
        const scriptList = Array.from(app.source.scripts);
        const deferScriptPromise = [];
        const deferScriptInfo = [];
        for (const address of scriptList) {
            const scriptInfo = sourceCenter.script.getInfo(address);
            const appSpaceData = scriptInfo.appSpace[app.name];
            // Notice the second render
            if (appSpaceData.defer || appSpaceData.async) {
                // TODO: defer和module彻底分开，不要混在一起
                if (scriptInfo.isExternal && !scriptInfo.code && !isTypeModule(app, scriptInfo)) {
                    deferScriptPromise.push(fetchSource(address, app.name));
                }
                else {
                    deferScriptPromise.push(scriptInfo.code);
                }
                deferScriptInfo.push([address, scriptInfo]);
                isTypeModule(app, scriptInfo) && (initHook.moduleCount = initHook.moduleCount ? ++initHook.moduleCount : 1);
            }
            else {
                injectFiberTask(fiberScriptTasks, () => {
                    runScript(address, app, scriptInfo);
                    initHook(false);
                });
            }
        }
        if (deferScriptPromise.length) {
            promiseStream(deferScriptPromise, (res) => {
                const scriptInfo = deferScriptInfo[res.index][1];
                scriptInfo.code = scriptInfo.code || res.data;
            }, (err) => {
                initHook.errorCount = initHook.errorCount ? ++initHook.errorCount : 1;
                logError(err, app.name);
            }, () => {
                deferScriptInfo.forEach(([address, scriptInfo]) => {
                    if (isString$1(scriptInfo.code)) {
                        injectFiberTask(fiberScriptTasks, () => {
                            runScript(address, app, scriptInfo, initHook);
                            !isTypeModule(app, scriptInfo) && initHook(false);
                        });
                    }
                });
                /**
                 * Fiber wraps js in requestIdleCallback and executes it in sequence
                 * NOTE:
                 * 1. In order to ensure the execution order, wait for all js loaded and then execute
                 * 2. If js create a dynamic script, it may be errors in the execution order, because the subsequent js is wrapped in requestIdleCallback, even putting dynamic script in requestIdleCallback doesn't solve it
                 *
                 * BUG: NOTE.2 - execution order problem
                 */
                if (fiberScriptTasks) {
                    fiberScriptTasks.push(() => Promise.resolve(initHook(isUndefined$1(initHook.moduleCount) ||
                        initHook.errorCount === deferScriptPromise.length)));
                    serialExecFiberTasks(fiberScriptTasks);
                }
                else {
                    initHook(isUndefined$1(initHook.moduleCount) ||
                        initHook.errorCount === deferScriptPromise.length);
                }
            });
        }
        else {
            if (fiberScriptTasks) {
                fiberScriptTasks.push(() => Promise.resolve(initHook(true)));
                serialExecFiberTasks(fiberScriptTasks);
            }
            else {
                initHook(true);
            }
        }
    }
    /**
     * run code
     * @param address script address
     * @param app app
     * @param scriptInfo script info
     * @param callback callback of module script
     */
    function runScript(address, app, scriptInfo, callback, replaceElement) {
        try {
            actionsBeforeRunScript(app);
            const appSpaceData = scriptInfo.appSpace[app.name];
            const sandboxType = getSandboxType(app, scriptInfo);
            /**
             * NOTE:
             * 1. plugins and wrapCode will only be executed once
             * 2. if parsedCode not exist, parsedFunction is not exist
             * 3. if parsedCode exist, parsedFunction does not necessarily exist
             */
            if (!appSpaceData.parsedCode || appSpaceData.sandboxType !== sandboxType) {
                appSpaceData.parsedCode = bindScope(address, app, scriptInfo.code, scriptInfo);
                appSpaceData.sandboxType = sandboxType;
                appSpaceData.parsedFunction = null;
            }
            /**
             * TODO: 优化逻辑
             * 是否是内联模式应该由外部传入，这样自外而内更加统一，逻辑更加清晰
             */
            if (isInlineMode(app, scriptInfo)) {
                const scriptElement = replaceElement || pureCreateElement('script');
                runCode2InlineScript(address, appSpaceData.parsedCode, isTypeModule(app, scriptInfo), scriptElement, appSpaceData.attrs, callback);
                /**
                 * TODO: 优化逻辑
                 * replaceElement不存在说明是初始化执行，需要主动插入script
                 * 但这里的逻辑不清晰，应该明确声明是什么环境下才需要主动插入，而不是用replaceElement间接判断
                 * replaceElement还有可能是注释类型(一定是在后台执行)，这里的判断都是间接判断，不够直观
                 */
                if (!replaceElement) {
                    // TEST IGNORE
                    const parent = app.iframe ? app.sandBox.microBody : app.querySelector('micro-app-body');
                    parent === null || parent === void 0 ? void 0 : parent.appendChild(scriptElement);
                }
            }
            else {
                runParsedFunction(app, scriptInfo);
            }
        }
        catch (e) {
            console.error(`[micro-app from ${replaceElement ? 'runDynamicScript' : 'runScript'}] app ${app.name}: `, e, address);
            // throw error in with sandbox to parent app
            throw e;
        }
    }
    /**
     * Get dynamically created remote script
     * @param address script address
     * @param app app instance
     * @param scriptInfo scriptInfo
     * @param originScript origin script element
     */
    function runDynamicRemoteScript(address, app, scriptInfo, originScript) {
        const replaceElement = isInlineMode(app, scriptInfo) ? pureCreateElement('script') : document.createComment('dynamic script extract by micro-app');
        const dispatchScriptOnLoadEvent = () => dispatchOnLoadEvent(originScript);
        const runDynamicScript = () => {
            const descriptor = Object.getOwnPropertyDescriptor(globalEnv.rawDocument, 'currentScript');
            if (!descriptor || descriptor.configurable) {
                Object.defineProperty(globalEnv.rawDocument, 'currentScript', {
                    value: originScript,
                    configurable: true,
                });
            }
            runScript(address, app, scriptInfo, dispatchScriptOnLoadEvent, replaceElement);
            !isTypeModule(app, scriptInfo) && dispatchScriptOnLoadEvent();
        };
        if (scriptInfo.code || isTypeModule(app, scriptInfo)) {
            defer(runDynamicScript);
        }
        else {
            fetchSource(address, app.name).then((code) => {
                scriptInfo.code = code;
                runDynamicScript();
            }).catch((err) => {
                logError(err, app.name);
                dispatchOnErrorEvent(originScript);
            });
        }
        return replaceElement;
    }
    /**
     * Get dynamically created inline script
     * @param address script address
     * @param app app instance
     * @param scriptInfo scriptInfo
     */
    function runDynamicInlineScript(address, app, scriptInfo) {
        const replaceElement = isInlineMode(app, scriptInfo) ? pureCreateElement('script') : document.createComment('dynamic script extract by micro-app');
        runScript(address, app, scriptInfo, void 0, replaceElement);
        return replaceElement;
    }
    /**
     * common handle for inline script
     * @param address script address
     * @param code bound code
     * @param module type='module' of script
     * @param scriptElement target script element
     * @param attrs attributes of script element
     * @param callback callback of module script
     */
    function runCode2InlineScript(address, code, module, scriptElement, attrs, callback) {
        if (module) {
            globalEnv.rawSetAttribute.call(scriptElement, 'type', 'module');
            if (isInlineScript(address)) {
                /**
                 * inline module script cannot convert to blob mode
                 * Issue: https://github.com/micro-zoe/micro-app/issues/805
                 */
                scriptElement.textContent = code;
            }
            else {
                scriptElement.src = address;
            }
            if (callback) {
                const onloadHandler = () => {
                    callback.moduleCount && callback.moduleCount--;
                    callback(callback.moduleCount === 0);
                };
                /**
                 * NOTE:
                 *  1. module script will execute onload method only after it insert to document/iframe
                 *  2. we can't know when the inline module script onload, and we use defer to simulate, this maybe cause some problems
                 */
                if (isInlineScript(address)) {
                    defer(onloadHandler);
                }
                else {
                    scriptElement.onload = onloadHandler;
                }
            }
        }
        else {
            scriptElement.textContent = code;
        }
        setConvertScriptAttr(scriptElement, attrs);
    }
    // init & run code2Function
    function runParsedFunction(app, scriptInfo) {
        const appSpaceData = scriptInfo.appSpace[app.name];
        if (!appSpaceData.parsedFunction) {
            appSpaceData.parsedFunction = getParsedFunction(app, scriptInfo, appSpaceData.parsedCode);
        }
        appSpaceData.parsedFunction.call(getEffectWindow(app));
    }
    /**
     * bind js scope
     * @param app app
     * @param code code
     * @param scriptInfo source script info
     */
    function bindScope(address, app, code, scriptInfo) {
        // TODO: 1、cache 2、esm code is null
        if (isPlainObject$1(microApp.options.plugins)) {
            code = usePlugins(address, code, app.name, microApp.options.plugins);
        }
        if (isWrapInSandBox(app, scriptInfo)) {
            return app.iframe ? `(function(window,self,global,location){;${code}\n${isInlineScript(address) ? '' : `//# sourceURL=${address}\n`}}).call(window.__MICRO_APP_SANDBOX__.proxyWindow,window.__MICRO_APP_SANDBOX__.proxyWindow,window.__MICRO_APP_SANDBOX__.proxyWindow,window.__MICRO_APP_SANDBOX__.proxyWindow,window.__MICRO_APP_SANDBOX__.proxyLocation);` : `;(function(proxyWindow){with(proxyWindow.__MICRO_APP_WINDOW__){(function(${GLOBAL_CACHED_KEY}){;${code}\n${isInlineScript(address) ? '' : `//# sourceURL=${address}\n`}}).call(proxyWindow,${GLOBAL_CACHED_KEY})}})(window.__MICRO_APP_PROXY_WINDOW__);`;
        }
        return code;
    }
    /**
     * actions before run script
     */
    function actionsBeforeRunScript(app) {
        setActiveProxyWindow(app);
    }
    /**
     * set active sandBox.proxyWindow to window.__MICRO_APP_PROXY_WINDOW__
     */
    function setActiveProxyWindow(app) {
        if (app.sandBox) {
            globalEnv.rawWindow.__MICRO_APP_PROXY_WINDOW__ = app.sandBox.proxyWindow;
        }
    }
    /**
     * Call the plugin to process the file
     * @param address script address
     * @param code code
     * @param appName app name
     * @param plugins plugin list
     */
    function usePlugins(address, code, appName, plugins) {
        var _a;
        const newCode = processCode(plugins.global, code, address);
        return processCode((_a = plugins.modules) === null || _a === void 0 ? void 0 : _a[appName], newCode, address);
    }
    function processCode(configs, code, address) {
        if (!isArray$1(configs)) {
            return code;
        }
        return configs.reduce((preCode, config) => {
            if (isPlainObject$1(config) && isFunction$1(config.loader)) {
                return config.loader(preCode, address);
            }
            return preCode;
        }, code);
    }

    /**
     * Recursively process each child element
     * @param parent parent element
     * @param app app
     * @param microAppHead micro-app-head element
     */
    function flatChildren(parent, app, microAppHead, fiberStyleTasks) {
        const children = Array.from(parent.children);
        children.length && children.forEach((child) => {
            flatChildren(child, app, microAppHead, fiberStyleTasks);
        });
        for (const dom of children) {
            if (isLinkElement(dom)) {
                if (dom.hasAttribute('exclude') || checkExcludeUrl(dom.getAttribute('href'), app.name)) {
                    parent.replaceChild(document.createComment('link element with exclude attribute ignored by micro-app'), dom);
                }
                else if (!(dom.hasAttribute('ignore') || checkIgnoreUrl(dom.getAttribute('href'), app.name))) {
                    extractLinkFromHtml(dom, parent, app);
                }
                else if (dom.hasAttribute('href')) {
                    globalEnv.rawSetAttribute.call(dom, 'href', CompletionPath(dom.getAttribute('href'), app.url));
                }
            }
            else if (isStyleElement(dom)) {
                if (dom.hasAttribute('exclude')) {
                    parent.replaceChild(document.createComment('style element with exclude attribute ignored by micro-app'), dom);
                }
                else if (app.scopecss && !dom.hasAttribute('ignore')) {
                    injectFiberTask(fiberStyleTasks, () => scopedCSS(dom, app));
                }
            }
            else if (isScriptElement(dom)) {
                extractScriptElement(dom, parent, app);
            }
            else if (isImageElement(dom) && dom.hasAttribute('src')) {
                globalEnv.rawSetAttribute.call(dom, 'src', CompletionPath(dom.getAttribute('src'), app.url));
            }
            /**
             * Don't remove meta and title, they have some special scenes
             * e.g.
             * document.querySelector('meta[name="viewport"]') // for flexible
             * document.querySelector('meta[name="baseurl"]').baseurl // for api request
             *
             * Title point to main app title, child app title used to be compatible with some special scenes
             */
            // else if (dom instanceof HTMLMetaElement || dom instanceof HTMLTitleElement) {
            //   parent.removeChild(dom)
            // }
        }
    }
    /**
     * Extract link and script, bind style scope
     * @param htmlStr html string
     * @param app app
     */
    function extractSourceDom(htmlStr, app) {
        const wrapElement = app.parseHtmlString(htmlStr);
        const microAppHead = globalEnv.rawElementQuerySelector.call(wrapElement, 'micro-app-head');
        const microAppBody = globalEnv.rawElementQuerySelector.call(wrapElement, 'micro-app-body');
        if (!microAppHead || !microAppBody) {
            const msg = `element ${microAppHead ? 'body' : 'head'} is missing`;
            app.onerror(new Error(msg));
            return logError(msg, app.name);
        }
        const fiberStyleTasks = app.isPrefetch || app.fiber ? [] : null;
        flatChildren(wrapElement, app, microAppHead, fiberStyleTasks);
        /**
         * Style and link are parallel, because it takes a lot of time for link to request resources. During this period, style processing can be performed to improve efficiency.
         */
        const fiberStyleResult = serialExecFiberTasks(fiberStyleTasks);
        if (app.source.links.size) {
            fetchLinksFromHtml(wrapElement, app, microAppHead, fiberStyleResult);
        }
        else if (fiberStyleResult) {
            fiberStyleResult.then(() => app.onLoad({ html: wrapElement }));
        }
        else {
            app.onLoad({ html: wrapElement });
        }
        if (app.source.scripts.size) {
            fetchScriptsFromHtml(wrapElement, app);
        }
        else {
            app.onLoad({ html: wrapElement });
        }
    }

    class EventCenter {
        constructor() {
            this.eventList = new Map();
            this.queue = [];
            this.recordStep = {};
            // run task
            this.process = () => {
                var _a, _b;
                let name;
                const temRecordStep = this.recordStep;
                const queue = this.queue;
                this.recordStep = {};
                this.queue = [];
                while (name = queue.shift()) {
                    const eventInfo = this.eventList.get(name);
                    // clear tempData, force before exec nextStep
                    const tempData = eventInfo.tempData;
                    const force = eventInfo.force;
                    eventInfo.tempData = null;
                    eventInfo.force = false;
                    let resArr;
                    if (force || !this.isEqual(eventInfo.data, tempData)) {
                        eventInfo.data = tempData || eventInfo.data;
                        for (const f of eventInfo.callbacks) {
                            const res = f(eventInfo.data);
                            res && (resArr !== null && resArr !== void 0 ? resArr : (resArr = [])).push(res);
                        }
                        (_b = (_a = temRecordStep[name]).dispatchDataEvent) === null || _b === void 0 ? void 0 : _b.call(_a);
                        /**
                         * WARING:
                         * If data of other app is sent in nextStep, it may cause confusion of tempData and force
                         */
                        temRecordStep[name].nextStepList.forEach((nextStep) => nextStep(resArr));
                    }
                }
            };
        }
        // whether the name is legal
        isLegalName(name) {
            if (!name) {
                logError('event-center: Invalid name');
                return false;
            }
            return true;
        }
        // add appName to queue
        enqueue(name, nextStep, dispatchDataEvent) {
            // this.nextStepList.push(nextStep)
            if (this.recordStep[name]) {
                this.recordStep[name].nextStepList.push(nextStep);
                dispatchDataEvent && (this.recordStep[name].dispatchDataEvent = dispatchDataEvent);
            }
            else {
                this.recordStep[name] = {
                    nextStepList: [nextStep],
                    dispatchDataEvent,
                };
            }
            /**
             * The micro task is executed async when the second render of child.
             * We should ensure that the data changes are executed before binding the listening function
             */
            (!this.queue.includes(name) && this.queue.push(name) === 1) && defer(this.process);
        }
        /**
         * In react, each setState will trigger setData, so we need a filter operation to avoid repeated trigger
         */
        isEqual(oldData, newData) {
            if (!newData || Object.keys(oldData).length !== Object.keys(newData).length)
                return false;
            for (const key in oldData) {
                if (Object.prototype.hasOwnProperty.call(oldData, key)) {
                    if (oldData[key] !== newData[key])
                        return false;
                }
            }
            return true;
        }
        /**
         * add listener
         * @param name event name
         * @param f listener
         * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
         */
        on(name, f, autoTrigger = false) {
            if (this.isLegalName(name)) {
                if (!isFunction$1(f)) {
                    return logError('event-center: Invalid callback function');
                }
                let eventInfo = this.eventList.get(name);
                if (!eventInfo) {
                    eventInfo = {
                        data: {},
                        callbacks: new Set(),
                    };
                    this.eventList.set(name, eventInfo);
                }
                else if (autoTrigger &&
                    Object.keys(eventInfo.data).length &&
                    (!this.queue.includes(name) ||
                        this.isEqual(eventInfo.data, eventInfo.tempData))) {
                    // auto trigger when data not null
                    f(eventInfo.data);
                }
                eventInfo.callbacks.add(f);
            }
        }
        // remove listener, but the data is not cleared
        off(name, f) {
            if (this.isLegalName(name)) {
                const eventInfo = this.eventList.get(name);
                if (eventInfo) {
                    if (isFunction$1(f)) {
                        eventInfo.callbacks.delete(f);
                    }
                    else {
                        eventInfo.callbacks.clear();
                    }
                }
            }
        }
        /**
         * clearData
         */
        clearData(name) {
            if (this.isLegalName(name)) {
                const eventInfo = this.eventList.get(name);
                if (eventInfo) {
                    eventInfo.data = {};
                }
            }
        }
        // dispatch data
        dispatch(name, data, nextStep, force, dispatchDataEvent) {
            if (this.isLegalName(name)) {
                if (!isPlainObject$1(data)) {
                    return logError('event-center: data must be object');
                }
                let eventInfo = this.eventList.get(name);
                if (eventInfo) {
                    eventInfo.tempData = assign({}, eventInfo.tempData || eventInfo.data, data);
                    !eventInfo.force && (eventInfo.force = !!force);
                }
                else {
                    eventInfo = {
                        data: data,
                        callbacks: new Set(),
                    };
                    this.eventList.set(name, eventInfo);
                    /**
                     * When sent data to parent, eventInfo probably does not exist, because parent may listen to datachange
                     */
                    eventInfo.force = true;
                }
                // add to queue, event eventInfo is null
                this.enqueue(name, nextStep, dispatchDataEvent);
            }
        }
        // get data
        getData(name) {
            var _a;
            const eventInfo = this.eventList.get(name);
            return (_a = eventInfo === null || eventInfo === void 0 ? void 0 : eventInfo.data) !== null && _a !== void 0 ? _a : null;
        }
    }

    const eventCenter = new EventCenter();
    /**
     * Format event name
     * @param appName app.name
     * @param fromBaseApp is from base app
     */
    function createEventName(appName, fromBaseApp) {
        if (!isString$1(appName) || !appName)
            return '';
        return fromBaseApp ? `__from_base_app_${appName}__` : `__from_micro_app_${appName}__`;
    }
    // Global data
    class EventCenterForGlobal {
        /**
         * add listener of global data
         * @param cb listener
         * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
         */
        addGlobalDataListener(cb, autoTrigger) {
            const appName = this.appName;
            // if appName exists, this is in sub app
            if (appName) {
                cb.__APP_NAME__ = appName;
                cb.__AUTO_TRIGGER__ = autoTrigger;
            }
            eventCenter.on('global', cb, autoTrigger);
        }
        /**
         * remove listener of global data
         * @param cb listener
         */
        removeGlobalDataListener(cb) {
            isFunction$1(cb) && eventCenter.off('global', cb);
        }
        /**
         * dispatch global data
         * @param data data
         */
        setGlobalData(data, nextStep, force) {
            // clear dom scope before dispatch global data, apply to micro app
            removeDomScope();
            eventCenter.dispatch('global', data, (resArr) => isFunction$1(nextStep) && nextStep(resArr), force);
        }
        forceSetGlobalData(data, nextStep) {
            this.setGlobalData(data, nextStep, true);
        }
        /**
         * get global data
         */
        getGlobalData() {
            return eventCenter.getData('global');
        }
        /**
         * clear global data
         */
        clearGlobalData() {
            eventCenter.clearData('global');
        }
        /**
         * clear all listener of global data
         * if appName exists, only the specified functions is cleared
         * if appName not exists, only clear the base app functions
         */
        clearGlobalDataListener() {
            const appName = this.appName;
            const eventInfo = eventCenter.eventList.get('global');
            if (eventInfo) {
                for (const cb of eventInfo.callbacks) {
                    if ((appName && appName === cb.__APP_NAME__) ||
                        !(appName || cb.__APP_NAME__)) {
                        eventInfo.callbacks.delete(cb);
                    }
                }
            }
        }
    }
    // Event center for base app
    class EventCenterForBaseApp extends EventCenterForGlobal {
        /**
         * add listener
         * @param appName app.name
         * @param cb listener
         * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
         */
        addDataListener(appName, cb, autoTrigger) {
            eventCenter.on(createEventName(formatAppName(appName), false), cb, autoTrigger);
        }
        /**
         * remove listener
         * @param appName app.name
         * @param cb listener
         */
        removeDataListener(appName, cb) {
            isFunction$1(cb) && eventCenter.off(createEventName(formatAppName(appName), false), cb);
        }
        /**
         * get data from micro app or base app
         * @param appName app.name
         * @param fromBaseApp whether get data from base app, default is false
         */
        getData(appName, fromBaseApp = false) {
            return eventCenter.getData(createEventName(formatAppName(appName), fromBaseApp));
        }
        /**
         * Dispatch data to the specified micro app
         * @param appName app.name
         * @param data data
         */
        setData(appName, data, nextStep, force) {
            eventCenter.dispatch(createEventName(formatAppName(appName), true), data, (resArr) => isFunction$1(nextStep) && nextStep(resArr), force);
        }
        forceSetData(appName, data, nextStep) {
            this.setData(appName, data, nextStep, true);
        }
        /**
         * clear data from base app
         * @param appName app.name
         * @param fromBaseApp whether clear data from child app, default is true
         */
        clearData(appName, fromBaseApp = true) {
            eventCenter.clearData(createEventName(formatAppName(appName), fromBaseApp));
        }
        /**
         * clear all listener for specified micro app
         * @param appName app.name
         */
        clearDataListener(appName) {
            eventCenter.off(createEventName(formatAppName(appName), false));
        }
    }
    // Event center for sub app
    class EventCenterForMicroApp extends EventCenterForGlobal {
        constructor(appName) {
            super();
            this.appName = formatAppName(appName);
            !this.appName && logError(`Invalid appName ${appName}`);
        }
        /**
         * add listener, monitor the data sent by the base app
         * @param cb listener
         * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
         */
        addDataListener(cb, autoTrigger) {
            cb.__AUTO_TRIGGER__ = autoTrigger;
            eventCenter.on(createEventName(this.appName, true), cb, autoTrigger);
        }
        /**
         * remove listener
         * @param cb listener
         */
        removeDataListener(cb) {
            isFunction$1(cb) && eventCenter.off(createEventName(this.appName, true), cb);
        }
        /**
         * get data from base app
         */
        getData(fromBaseApp = true) {
            return eventCenter.getData(createEventName(this.appName, fromBaseApp));
        }
        /**
         * dispatch data to base app
         * @param data data
         */
        dispatch(data, nextStep, force) {
            removeDomScope();
            eventCenter.dispatch(createEventName(this.appName, false), data, (resArr) => isFunction$1(nextStep) && nextStep(resArr), force, () => {
                const app = appInstanceMap.get(this.appName);
                if ((app === null || app === void 0 ? void 0 : app.container) && isPlainObject$1(data)) {
                    const event = new CustomEvent('datachange', {
                        detail: {
                            data: eventCenter.getData(createEventName(this.appName, false))
                        }
                    });
                    getRootContainer(app.container).dispatchEvent(event);
                }
            });
        }
        forceDispatch(data, nextStep) {
            this.dispatch(data, nextStep, true);
        }
        /**
         * clear data from child app
         * @param fromBaseApp whether clear data from base app, default is false
         */
        clearData(fromBaseApp = false) {
            eventCenter.clearData(createEventName(this.appName, fromBaseApp));
        }
        /**
         * clear all listeners
         */
        clearDataListener() {
            eventCenter.off(createEventName(this.appName, true));
        }
    }
    /**
     * Record UMD function before exec umdHookMount
     * NOTE: record maybe call twice when unmount prerender, keep-alive app manually with umd mode
     * @param microAppEventCenter instance of EventCenterForMicroApp
     */
    function recordDataCenterSnapshot(microAppEventCenter) {
        var _a, _b;
        if (microAppEventCenter) {
            microAppEventCenter.umdDataListeners = {
                global: new Set((_a = microAppEventCenter.umdDataListeners) === null || _a === void 0 ? void 0 : _a.global),
                normal: new Set((_b = microAppEventCenter.umdDataListeners) === null || _b === void 0 ? void 0 : _b.normal),
            };
            const globalEventInfo = eventCenter.eventList.get('global');
            if (globalEventInfo) {
                for (const cb of globalEventInfo.callbacks) {
                    if (microAppEventCenter.appName === cb.__APP_NAME__) {
                        microAppEventCenter.umdDataListeners.global.add(cb);
                    }
                }
            }
            const subAppEventInfo = eventCenter.eventList.get(createEventName(microAppEventCenter.appName, true));
            if (subAppEventInfo) {
                for (const cb of subAppEventInfo.callbacks) {
                    microAppEventCenter.umdDataListeners.normal.add(cb);
                }
            }
        }
    }
    /**
     * Rebind the UMD function of the record before remount
     * @param microAppEventCenter instance of EventCenterForMicroApp
     */
    function rebuildDataCenterSnapshot(microAppEventCenter) {
        // in withSandbox preRender mode with module script, umdDataListeners maybe undefined
        if (microAppEventCenter === null || microAppEventCenter === void 0 ? void 0 : microAppEventCenter.umdDataListeners) {
            for (const cb of microAppEventCenter.umdDataListeners.global) {
                microAppEventCenter.addGlobalDataListener(cb, cb.__AUTO_TRIGGER__);
            }
            for (const cb of microAppEventCenter.umdDataListeners.normal) {
                microAppEventCenter.addDataListener(cb, cb.__AUTO_TRIGGER__);
            }
            resetDataCenterSnapshot(microAppEventCenter);
        }
    }
    /**
     * delete umdDataListeners from microAppEventCenter
     * @param microAppEventCenter instance of EventCenterForMicroApp
     */
    function resetDataCenterSnapshot(microAppEventCenter) {
        microAppEventCenter === null || microAppEventCenter === void 0 ? true : delete microAppEventCenter.umdDataListeners;
    }

    // 管理 app 的单例
    class AppManager {
        constructor() {
            // TODO: appInstanceMap 由 AppManager 来创建，不再由 create_app 管理
            this.appInstanceMap = appInstanceMap;
        }
        static getInstance() {
            if (!this.instance) {
                this.instance = new AppManager();
            }
            return this.instance;
        }
        get(appName) {
            return this.appInstanceMap.get(appName);
        }
        set(appName, app) {
            this.appInstanceMap.set(appName, app);
        }
        getAll() {
            return Array.from(this.appInstanceMap.values());
        }
        clear() {
            this.appInstanceMap.clear();
        }
    }

    function unmountNestedApp() {
        releaseUnmountOfNestedApp();
        AppManager.getInstance().getAll().forEach(app => {
            // @ts-ignore
            app.container && getRootContainer(app.container).disconnectedCallback();
        });
        !window.__MICRO_APP_UMD_MODE__ && AppManager.getInstance().clear();
    }
    // release listener
    function releaseUnmountOfNestedApp() {
        if (window.__MICRO_APP_ENVIRONMENT__) {
            window.removeEventListener('unmount', unmountNestedApp, false);
        }
    }
    // if micro-app run in micro application, delete all next generation application when unmount event received
    // unmount event will auto release by sandbox
    function initEnvOfNestedApp() {
        if (window.__MICRO_APP_ENVIRONMENT__) {
            releaseUnmountOfNestedApp();
            window.addEventListener('unmount', unmountNestedApp, false);
        }
    }

    /* eslint-disable no-return-assign */
    function isBoundedFunction(value) {
        if (isBoolean$1(value.__MICRO_APP_IS_BOUND_FUNCTION__))
            return value.__MICRO_APP_IS_BOUND_FUNCTION__;
        return value.__MICRO_APP_IS_BOUND_FUNCTION__ = isBoundFunction(value);
    }
    function isConstructorFunction(value) {
        if (isBoolean$1(value.__MICRO_APP_IS_CONSTRUCTOR__))
            return value.__MICRO_APP_IS_CONSTRUCTOR__;
        return value.__MICRO_APP_IS_CONSTRUCTOR__ = isConstructor(value);
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function bindFunctionToRawTarget(value, rawTarget, key = 'WINDOW') {
        if (isFunction$1(value) && !isConstructorFunction(value) && !isBoundedFunction(value)) {
            const cacheKey = `__MICRO_APP_BOUND_${key}_FUNCTION__`;
            if (value[cacheKey])
                return value[cacheKey];
            const bindRawObjectValue = value.bind(rawTarget);
            for (const key in value) {
                bindRawObjectValue[key] = value[key];
            }
            if (value.hasOwnProperty('prototype')) {
                rawDefineProperty(bindRawObjectValue, 'prototype', {
                    value: value.prototype,
                    configurable: true,
                    enumerable: false,
                    writable: true,
                });
            }
            return value[cacheKey] = bindRawObjectValue;
        }
        return value;
    }

    /**
     * create proxyDocument and MicroDocument, rewrite document of child app
     * @param appName app name
     * @param microAppWindow Proxy target
     * @returns EffectHook
     */
    function patchDocument(appName, microAppWindow, sandbox) {
        const { proxyDocument, documentEffect } = createProxyDocument(appName, sandbox);
        const MicroDocument = createMicroDocument(appName, proxyDocument);
        rawDefineProperties(microAppWindow, {
            document: {
                configurable: false,
                enumerable: true,
                get() {
                    // return globalEnv.rawDocument
                    return proxyDocument;
                },
            },
            Document: {
                configurable: false,
                enumerable: false,
                get() {
                    // return globalEnv.rawRootDocument
                    return MicroDocument;
                },
            }
        });
        return documentEffect;
    }
    /**
     * Create new document and Document
     */
    function createProxyDocument(appName, sandbox) {
        const eventListenerMap = new Map();
        const sstEventListenerMap = new Map();
        let onClickHandler = null;
        let sstOnClickHandler = null;
        const { rawDocument, rawCreateElement, rawCreateElementNS, rawAddEventListener, rawRemoveEventListener, } = globalEnv;
        function createElement(tagName, options) {
            const element = rawCreateElement.call(rawDocument, tagName, options);
            element.__MICRO_APP_NAME__ = appName;
            return element;
        }
        function createElementNS(namespaceURI, name, options) {
            const element = rawCreateElementNS.call(rawDocument, namespaceURI, name, options);
            element.__MICRO_APP_NAME__ = appName;
            return element;
        }
        /**
         * TODO:
         *  1. listener 是否需要绑定proxyDocument，否则函数中的this指向原生window
         *  2. 相似代码提取为公共方法(with, iframe)
         *  3. 如果this不指向proxyDocument 和 rawDocument，则需要特殊处理
         */
        function addEventListener(type, listener, options) {
            const listenerList = eventListenerMap.get(type);
            if (listenerList) {
                listenerList.add(listener);
            }
            else {
                eventListenerMap.set(type, new Set([listener]));
            }
            listener && (listener.__MICRO_APP_MARK_OPTIONS__ = options);
            rawAddEventListener.call(rawDocument, type, listener, options);
        }
        function removeEventListener(type, listener, options) {
            const listenerList = eventListenerMap.get(type);
            if ((listenerList === null || listenerList === void 0 ? void 0 : listenerList.size) && listenerList.has(listener)) {
                listenerList.delete(listener);
            }
            rawRemoveEventListener.call(rawDocument, type, listener, options);
        }
        // reset snapshot data
        const reset = () => {
            sstEventListenerMap.clear();
            sstOnClickHandler = null;
        };
        /**
         * NOTE:
         *  1. about timer(events & properties should record & rebuild at all modes, exclude default mode)
         *  2. record maybe call twice when unmount prerender, keep-alive app manually with umd mode
         * 4 modes: default-mode、umd-mode、prerender、keep-alive
         * Solution:
         *  1. default-mode(normal): clear events & timers, not record & rebuild anything
         *  2. umd-mode(normal): not clear timers, record & rebuild events
         *  3. prerender/keep-alive(default, umd): not clear timers, record & rebuild events
         */
        const record = () => {
            /**
             * record onclick handler
             * onClickHandler maybe set again after prerender/keep-alive app hidden
             */
            sstOnClickHandler = onClickHandler || sstOnClickHandler;
            // record document event
            eventListenerMap.forEach((listenerList, type) => {
                if (listenerList.size) {
                    const cacheList = sstEventListenerMap.get(type) || [];
                    sstEventListenerMap.set(type, new Set([...cacheList, ...listenerList]));
                }
            });
        };
        // rebuild event and timer before remount app
        const rebuild = () => {
            // rebuild onclick event
            if (sstOnClickHandler && !onClickHandler)
                proxyDocument.onclick = sstOnClickHandler;
            // rebuild document event
            sstEventListenerMap.forEach((listenerList, type) => {
                for (const listener of listenerList) {
                    proxyDocument.addEventListener(type, listener, listener === null || listener === void 0 ? void 0 : listener.__MICRO_APP_MARK_OPTIONS__);
                }
            });
            reset();
        };
        // release all event listener & interval & timeout when unmount app
        const release = () => {
            // Clear the function bound by micro app through document.onclick
            if (isFunction$1(onClickHandler)) {
                rawRemoveEventListener.call(rawDocument, 'click', onClickHandler);
            }
            onClickHandler = null;
            // Clear document binding event
            if (eventListenerMap.size) {
                eventListenerMap.forEach((listenerList, type) => {
                    for (const listener of listenerList) {
                        rawRemoveEventListener.call(rawDocument, type, listener);
                    }
                });
                eventListenerMap.clear();
            }
        };
        const genProxyDocumentProps = () => {
            var _a;
            // microApp framework built-in Proxy
            const builtInProxyProps = new Map([
                ['onclick', (value) => {
                        if (isFunction$1(onClickHandler)) {
                            rawRemoveEventListener.call(rawDocument, 'click', onClickHandler, false);
                        }
                        // TODO: listener 是否需要绑定proxyDocument，否则函数中的this指向原生window
                        if (isFunction$1(value)) {
                            rawAddEventListener.call(rawDocument, 'click', value, false);
                        }
                        onClickHandler = value;
                    }]
            ]);
            // external custom proxy
            const customProxyDocumentProps = ((_a = microApp.options) === null || _a === void 0 ? void 0 : _a.customProxyDocumentProps) || new Map();
            // External has higher priority than built-in
            const mergedProxyDocumentProps = new Map([
                ...builtInProxyProps,
                ...customProxyDocumentProps,
            ]);
            return mergedProxyDocumentProps;
        };
        const mergedProxyDocumentProps = genProxyDocumentProps();
        const proxyDocument = new Proxy(rawDocument, {
            get: (target, key) => {
                var _a;
                throttleDeferForSetAppName(appName);
                // TODO: 转换成数据形式，类似iframe的方式
                if (key === 'createElement')
                    return createElement;
                if (key === 'createElementNS')
                    return createElementNS;
                if (key === Symbol.toStringTag)
                    return 'ProxyDocument';
                if (key === 'defaultView')
                    return sandbox.proxyWindow;
                if (key === 'onclick')
                    return onClickHandler;
                if (key === 'addEventListener')
                    return addEventListener;
                if (key === 'removeEventListener')
                    return removeEventListener;
                if (key === 'microAppElement')
                    return (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.container;
                if (key === '__MICRO_APP_NAME__')
                    return appName;
                return bindFunctionToRawTarget(Reflect.get(target, key), rawDocument, 'DOCUMENT');
            },
            set: (target, key, value) => {
                if (mergedProxyDocumentProps.has(key)) {
                    const proxyCallback = mergedProxyDocumentProps.get(key);
                    proxyCallback(value);
                }
                else if (key !== 'microAppElement') {
                    /**
                     * 1. Fix TypeError: Illegal invocation when set document.title
                     * 2. If the set method returns false, and the assignment happened in strict-mode code, a TypeError will be thrown.
                     */
                    Reflect.set(target, key, value);
                }
                return true;
            }
        });
        return {
            proxyDocument,
            documentEffect: {
                reset,
                record,
                rebuild,
                release,
            }
        };
    }
    /**
     * create proto Document
     * @param appName app name
     * @param proxyDocument proxy(document)
     * @returns Document
     */
    function createMicroDocument(appName, proxyDocument) {
        const { rawDocument, rawRootDocument } = globalEnv;
        class MicroDocument {
            static [Symbol.hasInstance](target) {
                let proto = target;
                while (proto) {
                    proto = Object.getPrototypeOf(proto);
                    if (proto === MicroDocument.prototype) {
                        return true;
                    }
                }
                return (target === proxyDocument ||
                    target instanceof rawRootDocument);
            }
        }
        /**
         * TIP:
         * 1. child class __proto__, which represents the inherit of the constructor, always points to the parent class
         * 2. child class prototype.__proto__, which represents the inherit of methods, always points to parent class prototype
         * e.g.
         * class B extends A {}
         * B.__proto__ === A // true
         * B.prototype.__proto__ === A.prototype // true
         */
        Object.setPrototypeOf(MicroDocument, rawRootDocument);
        // Object.create(rawRootDocument.prototype) will cause MicroDocument and proxyDocument methods not same when exec Document.prototype.xxx = xxx in child app
        Object.setPrototypeOf(MicroDocument.prototype, new Proxy(rawRootDocument.prototype, {
            get(target, key) {
                throttleDeferForSetAppName(appName);
                return bindFunctionToRawTarget(Reflect.get(target, key), rawDocument, 'DOCUMENT');
            },
            set(target, key, value) {
                Reflect.set(target, key, value);
                return true;
            }
        }));
        return MicroDocument;
    }

    /**
     * patch window of child app
     * @param appName app name
     * @param microAppWindow microWindow of child app
     * @param sandbox WithSandBox
     * @returns EffectHook
     */
    function patchWindow(appName, microAppWindow, sandbox) {
        patchWindowProperty(microAppWindow);
        createProxyWindow(appName, microAppWindow, sandbox);
        return patchWindowEffect(microAppWindow, appName);
    }
    /**
     * rewrite special properties of window
     * @param appName app name
     * @param microAppWindow child app microWindow
     */
    function patchWindowProperty(microAppWindow) {
        const rawWindow = globalEnv.rawWindow;
        Object.getOwnPropertyNames(rawWindow)
            .filter((key) => {
            return /^on/.test(key) && !SCOPE_WINDOW_ON_EVENT.includes(key);
        })
            .forEach((eventName) => {
            const { enumerable, writable, set } = Object.getOwnPropertyDescriptor(rawWindow, eventName) || {
                enumerable: true,
                writable: true,
            };
            rawDefineProperty(microAppWindow, eventName, {
                enumerable,
                configurable: true,
                get: () => rawWindow[eventName],
                set: (writable !== null && writable !== void 0 ? writable : !!set) ? (value) => { rawWindow[eventName] = value; }
                    : undefined,
            });
        });
    }
    /**
     * create proxyWindow with Proxy(microAppWindow)
     * @param appName app name
     * @param microAppWindow micro app window
     * @param sandbox WithSandBox
     */
    function createProxyWindow(appName, microAppWindow, sandbox) {
        const rawWindow = globalEnv.rawWindow;
        const descriptorTargetMap = new Map();
        const proxyWindow = new Proxy(microAppWindow, {
            get: (target, key) => {
                throttleDeferForSetAppName(appName);
                if (Reflect.has(target, key) ||
                    (isString$1(key) && /^__MICRO_APP_/.test(key)) ||
                    includes(sandbox.scopeProperties, key)) {
                    if (includes(RAW_GLOBAL_TARGET, key))
                        removeDomScope();
                    return Reflect.get(target, key);
                }
                return bindFunctionToRawTarget(Reflect.get(rawWindow, key), rawWindow);
            },
            set: (target, key, value) => {
                if (includes(sandbox.rawWindowScopeKeyList, key)) {
                    Reflect.set(rawWindow, key, value);
                }
                else if (
                // target.hasOwnProperty has been rewritten
                !rawHasOwnProperty.call(target, key) &&
                    rawHasOwnProperty.call(rawWindow, key) &&
                    !includes(sandbox.scopeProperties, key)) {
                    const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
                    const { configurable, enumerable, writable, set } = descriptor;
                    // set value because it can be set
                    rawDefineProperty(target, key, {
                        value,
                        configurable,
                        enumerable,
                        writable: writable !== null && writable !== void 0 ? writable : !!set,
                    });
                    sandbox.injectedKeys.add(key);
                }
                else {
                    // all scopeProperties will add to injectedKeys, use for key in window (Proxy.has)
                    if (!Reflect.has(target, key) || includes(sandbox.scopeProperties, key)) {
                        sandbox.injectedKeys.add(key);
                    }
                    Reflect.set(target, key, value);
                }
                if ((includes(sandbox.escapeProperties, key) ||
                    (
                    // TODO: staticEscapeProperties 合并到 escapeProperties
                    includes(sandbox.staticEscapeProperties, key) &&
                        !Reflect.has(rawWindow, key))) &&
                    !includes(sandbox.scopeProperties, key)) {
                    !Reflect.has(rawWindow, key) && sandbox.escapeKeys.add(key);
                    Reflect.set(rawWindow, key, value);
                }
                return true;
            },
            has: (target, key) => {
                /**
                 * Some keywords, such as Vue, need to meet two conditions at the same time:
                 * 1. window.Vue --> undefined
                 * 2. 'Vue' in window --> false
                 * Issue https://github.com/micro-zoe/micro-app/issues/686
                 */
                if (includes(sandbox.scopeProperties, key)) {
                    if (sandbox.injectedKeys.has(key)) {
                        return Reflect.has(target, key); // true
                    }
                    return !!target[key]; // false
                }
                return Reflect.has(target, key) || Reflect.has(rawWindow, key);
            },
            // Object.getOwnPropertyDescriptor(window, key)
            getOwnPropertyDescriptor: (target, key) => {
                if (rawHasOwnProperty.call(target, key)) {
                    descriptorTargetMap.set(key, 'target');
                    return Object.getOwnPropertyDescriptor(target, key);
                }
                if (rawHasOwnProperty.call(rawWindow, key)) {
                    descriptorTargetMap.set(key, 'rawWindow');
                    const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
                    if (descriptor && !descriptor.configurable) {
                        descriptor.configurable = true;
                    }
                    return descriptor;
                }
                return undefined;
            },
            // Object.defineProperty(window, key, Descriptor)
            defineProperty: (target, key, value) => {
                const from = descriptorTargetMap.get(key);
                if (from === 'rawWindow') {
                    return Reflect.defineProperty(rawWindow, key, value);
                }
                return Reflect.defineProperty(target, key, value);
            },
            // Object.getOwnPropertyNames(window)
            ownKeys: (target) => {
                return unique(Reflect.ownKeys(rawWindow).concat(Reflect.ownKeys(target)));
            },
            deleteProperty: (target, key) => {
                if (rawHasOwnProperty.call(target, key)) {
                    sandbox.injectedKeys.has(key) && sandbox.injectedKeys.delete(key);
                    sandbox.escapeKeys.has(key) && Reflect.deleteProperty(rawWindow, key);
                    return Reflect.deleteProperty(target, key);
                }
                return true;
            },
        });
        sandbox.proxyWindow = proxyWindow;
    }
    /**
     * Rewrite side-effect events
     * @param microAppWindow micro window
     */
    function patchWindowEffect(microAppWindow, appName) {
        const eventListenerMap = new Map();
        const sstEventListenerMap = new Map();
        const intervalIdMap = new Map();
        const timeoutIdMap = new Map();
        const { rawWindow, rawAddEventListener, rawRemoveEventListener, rawDispatchEvent, rawSetInterval, rawSetTimeout, rawClearInterval, rawClearTimeout, } = globalEnv;
        /**
         * All events will bind to microAppElement or rawWindow
         * Some special events, such as popstate、load、unmount、appstate-change、statechange..., bind to microAppElement, others bind to rawWindow
         * NOTE:
         *  1、At first, microAppWindow = new EventTarget(), but it can not compatible with iOS 14 or below, so microAppElement was used instead. (2024.1.22)
         * @param type event name
         * @returns microAppElement/rawWindow
         */
        function getEventTarget(type) {
            var _a;
            if (SCOPE_WINDOW_EVENT.includes(type) && ((_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.container)) {
                return getRootContainer(appInstanceMap.get(appName).container);
            }
            return rawWindow;
        }
        /**
         * listener may be null, e.g test-passive
         * TODO:
         *  1. listener 是否需要绑定microAppWindow，否则函数中的this指向原生window
         *  2. 如果this不指向proxyWindow 或 microAppWindow，应该要做处理
         *  window.addEventListener.call(非window, type, listener, options)
         */
        microAppWindow.addEventListener = function (type, listener, options) {
            const listenerList = eventListenerMap.get(type);
            if (listenerList) {
                listenerList.add(listener);
            }
            else {
                eventListenerMap.set(type, new Set([listener]));
            }
            listener && (listener.__MICRO_APP_MARK_OPTIONS__ = options);
            rawAddEventListener.call(getEventTarget(type), type, listener, options);
        };
        microAppWindow.removeEventListener = function (type, listener, options) {
            const listenerList = eventListenerMap.get(type);
            if ((listenerList === null || listenerList === void 0 ? void 0 : listenerList.size) && listenerList.has(listener)) {
                listenerList.delete(listener);
            }
            rawRemoveEventListener.call(getEventTarget(type), type, listener, options);
        };
        microAppWindow.dispatchEvent = function (event) {
            return rawDispatchEvent.call(getEventTarget(event === null || event === void 0 ? void 0 : event.type), event);
        };
        microAppWindow.setInterval = function (handler, timeout, ...args) {
            const intervalId = rawSetInterval.call(rawWindow, handler, timeout, ...args);
            intervalIdMap.set(intervalId, { handler, timeout, args });
            return intervalId;
        };
        microAppWindow.setTimeout = function (handler, timeout, ...args) {
            const timeoutId = rawSetTimeout.call(rawWindow, handler, timeout, ...args);
            timeoutIdMap.set(timeoutId, { handler, timeout, args });
            return timeoutId;
        };
        microAppWindow.clearInterval = function (intervalId) {
            intervalIdMap.delete(intervalId);
            rawClearInterval.call(rawWindow, intervalId);
        };
        microAppWindow.clearTimeout = function (timeoutId) {
            timeoutIdMap.delete(timeoutId);
            rawClearTimeout.call(rawWindow, timeoutId);
        };
        // reset snapshot data
        const reset = () => {
            sstEventListenerMap.clear();
        };
        /**
         * NOTE:
         *  1. about timer(events & properties should record & rebuild at all modes, exclude default mode)
         *  2. record maybe call twice when unmount prerender, keep-alive app manually with umd mode
         * 4 modes: default-mode、umd-mode、prerender、keep-alive
         * Solution:
         *  1. default-mode(normal): clear events & timers, not record & rebuild anything
         *  2. umd-mode(normal): not clear timers, record & rebuild events
         *  3. prerender/keep-alive(default, umd): not clear timers, record & rebuild events
         */
        const record = () => {
            // record window event
            eventListenerMap.forEach((listenerList, type) => {
                if (listenerList.size) {
                    const cacheList = sstEventListenerMap.get(type) || [];
                    sstEventListenerMap.set(type, new Set([...cacheList, ...listenerList]));
                }
            });
        };
        // rebuild event and timer before remount app
        const rebuild = () => {
            // rebuild window event
            sstEventListenerMap.forEach((listenerList, type) => {
                for (const listener of listenerList) {
                    microAppWindow.addEventListener(type, listener, listener === null || listener === void 0 ? void 0 : listener.__MICRO_APP_MARK_OPTIONS__);
                }
            });
            reset();
        };
        // release all event listener & interval & timeout when unmount app
        const release = (clearTimer) => {
            // Clear window binding events
            if (eventListenerMap.size) {
                eventListenerMap.forEach((listenerList, type) => {
                    for (const listener of listenerList) {
                        rawRemoveEventListener.call(getEventTarget(type), type, listener);
                    }
                });
                eventListenerMap.clear();
            }
            // default mode(not keep-alive or isPrerender)
            if (clearTimer) {
                intervalIdMap.forEach((_, intervalId) => {
                    rawClearInterval.call(rawWindow, intervalId);
                });
                timeoutIdMap.forEach((_, timeoutId) => {
                    rawClearTimeout.call(rawWindow, timeoutId);
                });
                intervalIdMap.clear();
                timeoutIdMap.clear();
            }
        };
        return {
            reset,
            record,
            rebuild,
            release,
        };
    }

    // set micro app state to origin state
    function setMicroState(appName, microState) {
        if (isRouterModeSearch(appName)) {
            const rawState = globalEnv.rawWindow.history.state;
            const additionalState = {
                microAppState: assign({}, rawState === null || rawState === void 0 ? void 0 : rawState.microAppState, {
                    [appName]: microState
                })
            };
            // create new state object
            return assign({}, rawState, additionalState);
        }
        return microState;
    }
    // delete micro app state form origin state
    function removeMicroState(appName, rawState) {
        if (isRouterModeSearch(appName)) {
            if (isPlainObject$1(rawState === null || rawState === void 0 ? void 0 : rawState.microAppState)) {
                if (!isUndefined$1(rawState.microAppState[appName])) {
                    delete rawState.microAppState[appName];
                }
                if (!Object.keys(rawState.microAppState).length) {
                    delete rawState.microAppState;
                }
            }
            return assign({}, rawState);
        }
        return rawState;
    }
    // get micro app state form origin state
    function getMicroState(appName) {
        var _a;
        const rawState = globalEnv.rawWindow.history.state;
        if (isRouterModeSearch(appName)) {
            return ((_a = rawState === null || rawState === void 0 ? void 0 : rawState.microAppState) === null || _a === void 0 ? void 0 : _a[appName]) || null;
        }
        return rawState;
    }
    const ENC_AD_RE = /&/g; // %M1
    const ENC_EQ_RE = /=/g; // %M2
    const DEC_AD_RE = /%M1/g; // &
    const DEC_EQ_RE = /%M2/g; // =
    // encode path with special symbol
    function encodeMicroPath(path) {
        return encodeURIComponent(commonDecode(path).replace(ENC_AD_RE, '%M1').replace(ENC_EQ_RE, '%M2'));
    }
    // decode path
    function decodeMicroPath(path) {
        return commonDecode(path).replace(DEC_AD_RE, '&').replace(DEC_EQ_RE, '=');
    }
    // Recursively resolve address
    function commonDecode(path) {
        try {
            const decPath = decodeURIComponent(path);
            if (path === decPath || DEC_AD_RE.test(decPath) || DEC_EQ_RE.test(decPath))
                return decPath;
            return commonDecode(decPath);
        }
        catch (_a) {
            return path;
        }
    }
    // Format the query parameter key to prevent conflicts with the original parameters
    function formatQueryAppName(appName) {
        // return `app-${appName}`
        return appName;
    }
    /**
     * Get app fullPath from browser url
     * @param appName app.name
     */
    function getMicroPathFromURL(appName) {
        var _a, _b;
        // TODO: pure模式从state中获取地址
        if (isRouterModePure(appName))
            return null;
        const rawLocation = globalEnv.rawWindow.location;
        if (isRouterModeSearch(appName)) {
            const queryObject = getQueryObjectFromURL(rawLocation.search, rawLocation.hash);
            const microPath = ((_a = queryObject.hashQuery) === null || _a === void 0 ? void 0 : _a[formatQueryAppName(appName)]) || ((_b = queryObject.searchQuery) === null || _b === void 0 ? void 0 : _b[formatQueryAppName(appName)]);
            return isString$1(microPath) ? decodeMicroPath(microPath) : null;
        }
        return rawLocation.pathname + rawLocation.search + rawLocation.hash;
    }
    /**
     * Attach child app fullPath to browser url
     * @param appName app.name
     * @param targetLocation location of child app or rawLocation of window
     */
    function setMicroPathToURL(appName, targetLocation) {
        const targetFullPath = targetLocation.pathname + targetLocation.search + targetLocation.hash;
        let isAttach2Hash = false;
        if (isRouterModeSearch(appName)) {
            let { pathname, search, hash } = globalEnv.rawWindow.location;
            const queryObject = getQueryObjectFromURL(search, hash);
            const encodedMicroPath = encodeMicroPath(targetFullPath);
            /**
             * Is parent is hash router
             * In fact, this is not true. It just means that the parameter is added to the hash
             */
            // If hash exists and search does not exist, it is considered as a hash route
            if (hash && !search) {
                isAttach2Hash = true;
                if (queryObject.hashQuery) {
                    queryObject.hashQuery[formatQueryAppName(appName)] = encodedMicroPath;
                }
                else {
                    queryObject.hashQuery = {
                        [formatQueryAppName(appName)]: encodedMicroPath
                    };
                }
                const baseHash = hash.includes('?') ? hash.slice(0, hash.indexOf('?') + 1) : hash + '?';
                hash = baseHash + stringifyQuery(queryObject.hashQuery);
            }
            else {
                if (queryObject.searchQuery) {
                    queryObject.searchQuery[formatQueryAppName(appName)] = encodedMicroPath;
                }
                else {
                    queryObject.searchQuery = {
                        [formatQueryAppName(appName)]: encodedMicroPath
                    };
                }
                search = '?' + stringifyQuery(queryObject.searchQuery);
            }
            return {
                fullPath: pathname + search + hash,
                isAttach2Hash,
            };
        }
        return {
            fullPath: targetFullPath,
            isAttach2Hash,
        };
    }
    /**
     * Delete child app fullPath from browser url
     * @param appName app.name
     * @param targetLocation target Location, default is rawLocation
     */
    function removeMicroPathFromURL(appName, targetLocation) {
        var _a, _b, _c, _d;
        let { pathname, search, hash } = globalEnv.rawWindow.location;
        let isAttach2Hash = false;
        if (isRouterModeSearch(appName)) {
            const queryObject = getQueryObjectFromURL(search, hash);
            if ((_a = queryObject.hashQuery) === null || _a === void 0 ? void 0 : _a[formatQueryAppName(appName)]) {
                isAttach2Hash = true;
                (_b = queryObject.hashQuery) === null || _b === void 0 ? true : delete _b[formatQueryAppName(appName)];
                const hashQueryStr = stringifyQuery(queryObject.hashQuery);
                hash = hash.slice(0, hash.indexOf('?') + Number(Boolean(hashQueryStr))) + hashQueryStr;
            }
            else if ((_c = queryObject.searchQuery) === null || _c === void 0 ? void 0 : _c[formatQueryAppName(appName)]) {
                (_d = queryObject.searchQuery) === null || _d === void 0 ? true : delete _d[formatQueryAppName(appName)];
                const searchQueryStr = stringifyQuery(queryObject.searchQuery);
                search = searchQueryStr ? '?' + searchQueryStr : '';
            }
        }
        return {
            fullPath: pathname + search + hash,
            isAttach2Hash,
        };
    }
    /**
     * Format search, hash to object
     */
    function getQueryObjectFromURL(search, hash) {
        const queryObject = {};
        if (search !== '' && search !== '?') {
            queryObject.searchQuery = parseQuery(search.slice(1));
        }
        if (hash.includes('?')) {
            queryObject.hashQuery = parseQuery(hash.slice(hash.indexOf('?') + 1));
        }
        return queryObject;
    }
    /**
     * get microApp path from browser URL without hash
     */
    function getNoHashMicroPathFromURL(appName, baseUrl) {
        const microPath = getMicroPathFromURL(appName);
        if (!microPath)
            return '';
        const formatLocation = createURL(microPath, baseUrl);
        return formatLocation.origin + formatLocation.pathname + formatLocation.search;
    }
    /**
     * Effect app is an app that can perform route navigation
     * NOTE: Invalid app action
     * 1. prevent update browser url, dispatch popStateEvent, reload browser
     * 2. It can update path with pushState/replaceState
     * 3. Can not update path outside (with router api)
     * 3. Can not update path by location
     */
    function isEffectiveApp(appName) {
        const app = appInstanceMap.get(appName);
        /**
         * !!(app && !app.isPrefetch && !app.isHidden())
         * NOTE: 隐藏的keep-alive应用暂时不作为无效应用，原因如下
         * 1、隐藏后才执行去除浏览器上的微应用的路由信息的操作，导致微应用的路由信息无法去除
         * 2、如果保持隐藏应用内部正常跳转，阻止同步路由信息到浏览器，这样理论上是好的，但是对于location跳转改如何处理？location跳转是基于修改浏览器地址后发送popstate事件实现的，所以应该是在隐藏后不支持通过location进行跳转
         */
        return !!(app && !app.isPrefetch);
    }
    // router mode is search
    function isRouterModeSearch(appName) {
        const app = appInstanceMap.get(appName);
        return !!(app && app.sandBox && app.routerMode === DEFAULT_ROUTER_MODE);
    }
    // router mode is history
    function isRouterModeNative(appName) {
        const app = appInstanceMap.get(appName);
        return !!(app && app.sandBox && app.routerMode === ROUTER_MODE_NATIVE);
    }
    // router mode is disable
    function isRouterModeNativeScope(appName) {
        const app = appInstanceMap.get(appName);
        return !!(app && app.sandBox && app.routerMode === ROUTER_MODE_NATIVE_SCOPE);
    }
    // router mode is pure
    function isRouterModePure(appName) {
        const app = appInstanceMap.get(appName);
        return !!(app && app.sandBox && app.routerMode === ROUTER_MODE_PURE);
    }
    /**
     * router mode is history or disable
     */
    function isRouterModeCustom(appName) {
        return isRouterModeNative(appName) || isRouterModeNativeScope(appName);
    }
    /**
     * get memory router mode of child app
     * NOTE:
     *  1. if microAppElement exists, it means the app render by the micro-app element
     *  2. if microAppElement not exists, it means it is prerender app
     * @param mode native config
     * @param inlineDisableMemoryRouter disable-memory-router set by micro-app element or prerender
     * @returns router mode
     */
    function getRouterMode(mode, inlineDisableMemoryRouter) {
        /**
         * compatible with disable-memory-router in older versions
         * if disable-memory-router is true, router-mode will be disable
         * Priority:
         *  inline disable-memory-router > inline router-mode > global disable-memory-router > global router-mode
         */
        const routerMode = ((inlineDisableMemoryRouter && ROUTER_MODE_NATIVE) ||
            mode ||
            (microApp.options['disable-memory-router'] && ROUTER_MODE_NATIVE) ||
            microApp.options['router-mode'] ||
            DEFAULT_ROUTER_MODE);
        return ROUTER_MODE_LIST.includes(routerMode) ? routerMode : DEFAULT_ROUTER_MODE;
    }

    /**
     * dispatch PopStateEvent & HashChangeEvent to child app
     * each child app will listen for popstate event when sandbox start
     * and release it when sandbox stop
     * @param appName app name
     * @returns release callback
     */
    function addHistoryListener(appName) {
        const rawWindow = globalEnv.rawWindow;
        // handle popstate event and distribute to child app
        const popStateHandler = (e) => {
            /**
             * 1. unmount app & hidden keep-alive app will not receive popstate event
             * 2. filter out onlyForBrowser
             */
            if (getActiveApps({
                excludeHiddenApp: true,
                excludePreRender: true,
            }).includes(appName) &&
                !e.onlyForBrowser) {
                updateMicroLocationWithEvent(appName, getMicroPathFromURL(appName));
            }
        };
        rawWindow.addEventListener('popstate', popStateHandler);
        return () => {
            rawWindow.removeEventListener('popstate', popStateHandler);
        };
    }
    /**
     * Effect: use to trigger child app jump
     * Actions:
     *  1. update microLocation with target path
     *  2. dispatch popStateEvent & hashChangeEvent
     * @param appName app name
     * @param targetFullPath target path of child app
     */
    function updateMicroLocationWithEvent(appName, targetFullPath) {
        const app = appInstanceMap.get(appName);
        const proxyWindow = app.sandBox.proxyWindow;
        const microAppWindow = app.sandBox.microAppWindow;
        let isHashChange = false;
        // for hashChangeEvent
        const oldHref = proxyWindow.location.href;
        // Do not attach micro state to url when targetFullPath is empty
        if (targetFullPath) {
            const oldHash = proxyWindow.location.hash;
            updateMicroLocation(appName, targetFullPath, microAppWindow.location);
            isHashChange = proxyWindow.location.hash !== oldHash;
        }
        // dispatch formatted popStateEvent to child
        dispatchPopStateEventToMicroApp(appName, proxyWindow, microAppWindow);
        // dispatch formatted hashChangeEvent to child when hash change
        if (isHashChange)
            dispatchHashChangeEventToMicroApp(appName, proxyWindow, microAppWindow, oldHref);
        // clear element scope before trigger event of next app
        removeDomScope();
    }
    /**
     * dispatch formatted popstate event to microApp
     * @param appName app name
     * @param proxyWindow sandbox window
     * @param eventState history.state
     */
    function dispatchPopStateEventToMicroApp(appName, proxyWindow, microAppWindow) {
        /**
         * TODO: test
         * angular14 takes e.type as type judgment
         * when e.type is popstate-appName popstate event will be invalid
         */
        // Object.defineProperty(newPopStateEvent, 'type', {
        //   value: 'popstate',
        //   writable: true,
        //   configurable: true,
        //   enumerable: true,
        // })
        // create PopStateEvent named popstate-appName with sub app state
        const newPopStateEvent = new PopStateEvent('popstate', { state: getMicroState(appName) });
        microAppWindow.dispatchEvent(newPopStateEvent);
        if (!isIframeSandbox(appName)) {
            // call function window.onpopstate if it exists
            isFunction$1(proxyWindow.onpopstate) && proxyWindow.onpopstate(newPopStateEvent);
        }
    }
    /**
     * dispatch formatted hashchange event to microApp
     * @param appName app name
     * @param proxyWindow sandbox window
     * @param oldHref old href
     */
    function dispatchHashChangeEventToMicroApp(appName, proxyWindow, microAppWindow, oldHref) {
        const newHashChangeEvent = new HashChangeEvent('hashchange', {
            newURL: proxyWindow.location.href,
            oldURL: oldHref,
        });
        microAppWindow.dispatchEvent(newHashChangeEvent);
        if (!isIframeSandbox(appName)) {
            // call function window.onhashchange if it exists
            isFunction$1(proxyWindow.onhashchange) && proxyWindow.onhashchange(newHashChangeEvent);
        }
    }
    /**
     * dispatch native PopStateEvent, simulate location behavior
     * @param onlyForBrowser only dispatch PopStateEvent to browser
     */
    function dispatchNativePopStateEvent(onlyForBrowser) {
        const event = new PopStateEvent('popstate', { state: null });
        if (onlyForBrowser)
            event.onlyForBrowser = true;
        globalEnv.rawWindow.dispatchEvent(event);
    }
    /**
     * dispatch hashchange event to browser
     * @param oldHref old href of rawWindow.location
     */
    function dispatchNativeHashChangeEvent(oldHref) {
        const newHashChangeEvent = new HashChangeEvent('hashchange', {
            newURL: globalEnv.rawWindow.location.href,
            oldURL: oldHref,
        });
        globalEnv.rawWindow.dispatchEvent(newHashChangeEvent);
    }
    /**
     * dispatch popstate & hashchange event to browser
     * @param appName app.name
     * @param onlyForBrowser only dispatch event to browser
     * @param oldHref old href of rawWindow.location
     */
    function dispatchNativeEvent(appName, onlyForBrowser, oldHref) {
        // clear element scope before dispatch global event
        removeDomScope();
        if (isEffectiveApp(appName)) {
            dispatchNativePopStateEvent(onlyForBrowser);
            if (oldHref) {
                dispatchNativeHashChangeEvent(oldHref);
            }
        }
    }

    /**
     * create proxyHistory for microApp
     * MDN https://developer.mozilla.org/en-US/docs/Web/API/History
     * @param appName app name
     * @param microLocation microApp location(with: proxyLocation iframe: iframeWindow.location)
     */
    function createMicroHistory(appName, microLocation) {
        const rawHistory = globalEnv.rawWindow.history;
        function getMicroHistoryMethod(methodName) {
            return function (...rests) {
                var _a, _b, _c;
                // TODO: 测试iframe的URL兼容isURL的情况
                if (isString$1(rests[2]) || isURL(rests[2])) {
                    const targetLocation = createURL(rests[2], microLocation.href);
                    const targetFullPath = targetLocation.pathname + targetLocation.search + targetLocation.hash;
                    if (!isRouterModePure(appName)) {
                        navigateWithNativeEvent(appName, methodName, setMicroPathToURL(appName, targetLocation), true, setMicroState(appName, rests[0]), rests[1]);
                    }
                    if (targetFullPath !== microLocation.fullPath) {
                        updateMicroLocation(appName, targetFullPath, microLocation);
                    }
                    (_c = (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : (_b = _a.sandBox).updateIframeBase) === null || _c === void 0 ? void 0 : _c.call(_b);
                }
                else {
                    nativeHistoryNavigate(appName, methodName, rests[2], rests[0], rests[1]);
                }
            };
        }
        const pushState = getMicroHistoryMethod('pushState');
        const replaceState = getMicroHistoryMethod('replaceState');
        if (isIframeSandbox(appName))
            return { pushState, replaceState };
        return new Proxy(rawHistory, {
            get(target, key) {
                if (key === 'state') {
                    return getMicroState(appName);
                }
                else if (key === 'pushState') {
                    return pushState;
                }
                else if (key === 'replaceState') {
                    return replaceState;
                }
                return bindFunctionToRawTarget(Reflect.get(target, key), target, 'HISTORY');
            },
            set(target, key, value) {
                Reflect.set(target, key, value);
                /**
                 * If the set() method returns false, and the assignment happened in strict-mode code, a TypeError will be thrown.
                 * e.g. history.state = {}
                 * TypeError: 'set' on proxy: trap returned false for property 'state'
                 */
                return true;
            }
        });
    }
    /**
     * navigate to new path base on native method of history
     * @param appName app.name
     * @param methodName pushState/replaceState
     * @param fullPath full path
     * @param state history.state, default is null
     * @param title history.title, default is ''
     */
    function nativeHistoryNavigate(appName, methodName, fullPath, state = null, title = '') {
        if (isEffectiveApp(appName)) {
            const method = methodName === 'pushState' ? globalEnv.rawPushState : globalEnv.rawReplaceState;
            method.call(globalEnv.rawWindow.history, state, title, fullPath);
        }
    }
    /**
     * Navigate to new path, and dispatch native popStateEvent/hashChangeEvent to browser
     * Use scenes:
     * 1. mount/unmount through attachRouteToBrowserURL with limited popstateEvent
     * 2. proxyHistory.pushState/replaceState with limited popstateEvent
     * 3. api microApp.router.push/replace
     * 4. proxyLocation.hash = xxx
     * NOTE:
     *  1. hidden keep-alive app can jump internally, but will not synchronize to browser
     * @param appName app.name
     * @param methodName pushState/replaceState
     * @param result result of add/remove microApp path on browser url
     * @param onlyForBrowser only dispatch event to browser
     * @param state history.state, not required
     * @param title history.title, not required
     */
    function navigateWithNativeEvent(appName, methodName, result, onlyForBrowser, state, title) {
        if (isEffectiveApp(appName)) {
            const rawLocation = globalEnv.rawWindow.location;
            const oldFullPath = rawLocation.pathname + rawLocation.search + rawLocation.hash;
            // oldHref use for hashChangeEvent of base app
            const oldHref = result.isAttach2Hash && oldFullPath !== result.fullPath ? rawLocation.href : null;
            // navigate with native history method
            nativeHistoryNavigate(appName, methodName, result.fullPath, state, title);
            /**
             * TODO:
             *  1. 如果所有模式统一发送popstate事件，则isRouterModeSearch(appName)要去掉
             *  2. 如果发送事件，则会导致vue router-view :key='router.path'绑定，无限卸载应用，死循环
             */
            if (oldFullPath !== result.fullPath && isRouterModeSearch(appName)) {
                dispatchNativeEvent(appName, onlyForBrowser, oldHref);
            }
        }
    }
    /**
     * update browser url when mount/unmount/hidden/show/attachToURL/attachAllToURL
     * just attach microRoute info to browser, dispatch event to base app(exclude child)
     * @param appName app.name
     * @param result result of add/remove microApp path on browser url
     * @param state history.state
     */
    function attachRouteToBrowserURL(appName, result, state) {
        navigateWithNativeEvent(appName, 'replaceState', result, true, state);
    }
    /**
     * When path is same, keep the microAppState in history.state
     * Fix bug of missing microAppState when base app is next.js or angular
     * @param method history.pushState/replaceState
     */
    function reWriteHistoryMethod(method) {
        const rawWindow = globalEnv.rawWindow;
        return function (...rests) {
            var _a;
            if (((_a = rawWindow.history.state) === null || _a === void 0 ? void 0 : _a.microAppState) &&
                (!isPlainObject$1(rests[0]) || !rests[0].microAppState) &&
                (isString$1(rests[2]) || isURL(rests[2]))) {
                const currentHref = rawWindow.location.href;
                const targetLocation = createURL(rests[2], currentHref);
                if (targetLocation.href === currentHref) {
                    rests[0] = assign({}, rests[0], {
                        microAppState: rawWindow.history.state.microAppState,
                    });
                }
            }
            method.apply(rawWindow.history, rests);
            /**
             * Attach child router info to browser url when base app navigate with pushState/replaceState
             * NOTE:
             * 1. Exec after apply pushState/replaceState
             * 2. Unable to catch when base app navigate with location
             * 3. When in nest app, rawPushState/rawReplaceState has been modified by parent
             */
            getActiveApps({
                excludeHiddenApp: true,
                excludePreRender: true,
            }).forEach(appName => {
                if (isRouterModeSearch(appName) && !getMicroPathFromURL(appName)) {
                    const app = appInstanceMap.get(appName);
                    attachRouteToBrowserURL(appName, setMicroPathToURL(appName, app.sandBox.proxyWindow.location), setMicroState(appName, getMicroState(appName)));
                }
            });
            // fix bug for nest app
            removeDomScope();
        };
    }
    /**
     * rewrite history.pushState/replaceState
     * used to fix the problem that the microAppState maybe missing when mainApp navigate to same path
     * e.g: when nextjs, angular receive popstate event, they will use history.replaceState to update browser url with a new state object
     */
    function patchHistory() {
        const rawWindow = globalEnv.rawWindow;
        rawWindow.history.pushState = reWriteHistoryMethod(globalEnv.rawPushState);
        rawWindow.history.replaceState = reWriteHistoryMethod(globalEnv.rawReplaceState);
    }
    function releasePatchHistory() {
        const rawWindow = globalEnv.rawWindow;
        rawWindow.history.pushState = globalEnv.rawPushState;
        rawWindow.history.replaceState = globalEnv.rawReplaceState;
    }

    function createRouterApi() {
        /**
         * common handler for router.push/router.replace method
         * @param appName app name
         * @param methodName replaceState/pushState
         * @param targetLocation target location
         * @param state to.state
         */
        function navigateWithRawHistory(appName, methodName, targetLocation, state) {
            navigateWithNativeEvent(appName, methodName, setMicroPathToURL(appName, targetLocation), false, setMicroState(appName, state !== null && state !== void 0 ? state : null));
            // clear element scope after navigate
            removeDomScope();
        }
        /**
         * navigation handler
         * @param appName app.name
         * @param app app instance
         * @param to router target options
         * @param replace use router.replace?
         */
        function handleNavigate(appName, app, to, replace) {
            const microLocation = app.sandBox.proxyWindow.location;
            const targetLocation = createURL(to.path, microLocation.href);
            // Only get path data, even if the origin is different from microApp
            const currentFullPath = microLocation.pathname + microLocation.search + microLocation.hash;
            const targetFullPath = targetLocation.pathname + targetLocation.search + targetLocation.hash;
            if (currentFullPath !== targetFullPath || getMicroPathFromURL(appName) !== targetFullPath) {
                if (!isRouterModePure(appName)) {
                    const methodName = (replace && to.replace !== false) || to.replace === true ? 'replaceState' : 'pushState';
                    navigateWithRawHistory(appName, methodName, targetLocation, to.state);
                }
                /**
                 * TODO:
                 *  1. 关闭虚拟路由的跳转地址不同：baseRoute + 子应用地址，文档中要说明
                 *  2. 关闭虚拟路由时跳转方式不同：1、基座跳转但不发送popstate事件 2、控制子应用更新location，内部发送popstate事件。
                 *  核心思路：减小对基座的影响(子应用跳转不向基座发送popstate事件，其他操作一致)，但这是必要的吗，只是多了一个触发popstate的操作
                 *  路由优化方案有两种：
                 *    1、减少对基座的影响，主要是解决vue循环刷新的问题
                 *    2、全局发送popstate事件，解决主、子都是vue3的冲突问题
                 *  两者选一个吧，如果选2，则下面这两行代码可以去掉
                 *  NOTE1: history和search模式采用2，这样可以解决vue3的问题，custom采用1，避免vue循环刷新的问题，这样在用户出现问题时各有解决方案。但反过来说，每种方案又分别导致另外的问题，不统一，导致复杂度增高
                 *  NOTE2: 关闭虚拟路由，同时发送popstate事件还是无法解决vue3的问题(毕竟history.state理论上还是会冲突)，那么就没必要发送popstate事件了。
                 */
                if (isRouterModeCustom(appName) || isRouterModePure(appName)) {
                    updateMicroLocationWithEvent(appName, targetFullPath);
                }
            }
        }
        /**
         * create method of router.push/replace
         * NOTE:
         * 1. The same fullPath will be blocked
         * 2. name & path is required
         * 3. path is fullPath except for the domain (the domain can be taken, but not valid)
         * @param replace use router.replace?
         */
        function createNavigationMethod(replace) {
            return function (to) {
                return new Promise((resolve, reject) => {
                    const appName = formatAppName(to.name);
                    if (appName && isString$1(to.path)) {
                        /**
                         * active apps, exclude prerender app or hidden keep-alive app
                         * NOTE:
                         *  1. prerender app or hidden keep-alive app clear and record popstate event, so we cannot control app jump through the API
                         *  2. disable memory-router
                         */
                        /**
                         * TODO: 子应用开始渲染但是还没渲染完成
                         *  1、调用跳转改如何处理
                         *  2、iframe的沙箱还没初始化时执行跳转报错，如何处理。。。
                         *  3、hidden app 是否支持跳转
                         */
                        if (getActiveApps({ excludeHiddenApp: true, excludePreRender: true }).includes(appName)) {
                            const app = appInstanceMap.get(appName);
                            resolve(app.sandBox.sandboxReady.then(() => handleNavigate(appName, app, to, replace)));
                        }
                        else {
                            reject(logError('navigation failed, app does not exist or is inactive'));
                        }
                        // /**
                        //  * app not exit or unmounted, update browser URL with replaceState
                        //  * use base app location.origin as baseURL
                        //  * 应用不存在或已卸载，依然使用replaceState来更新浏览器地址 -- 不合理
                        //  */
                        // /**
                        //  * TODO: 应用还没渲染或已经卸载最好不要支持跳转了，我知道这是因为解决一些特殊场景，但这么做是非常反直觉的
                        //  * 并且在新版本中有多种路由模式，如果应用不存在，我们根本无法知道是哪种模式，那么这里的操作就无意义了。
                        //  */
                        // const rawLocation = globalEnv.rawWindow.location
                        // const targetLocation = createURL(to.path, rawLocation.origin)
                        // const targetFullPath = targetLocation.pathname + targetLocation.search + targetLocation.hash
                        // if (getMicroPathFromURL(appName) !== targetFullPath) {
                        //   navigateWithRawHistory(
                        //     appName,
                        //     to.replace === false ? 'pushState' : 'replaceState',
                        //     targetLocation,
                        //     to.state,
                        //   )
                        // }
                    }
                    else {
                        reject(logError(`navigation failed, name & path are required when use router.${replace ? 'replace' : 'push'}`));
                    }
                });
            };
        }
        // create method of router.go/back/forward
        function createRawHistoryMethod(methodName) {
            return function (...rests) {
                return globalEnv.rawWindow.history[methodName](...rests);
            };
        }
        const beforeGuards = useSetRecord();
        const afterGuards = useSetRecord();
        /**
         * run all of beforeEach/afterEach guards
         * NOTE:
         * 1. Modify browser url first, and then run guards,
         *    consistent with the browser forward & back button
         * 2. Prevent the element binding
         * @param appName app name
         * @param to target location
         * @param from old location
         * @param guards guards list
         */
        function runGuards(appName, to, from, guards) {
            // clear element scope before execute function of parent
            removeDomScope();
            for (const guard of guards) {
                if (isFunction$1(guard)) {
                    guard(to, from, appName);
                }
                else if (isPlainObject$1(guard) && isFunction$1(guard[appName])) {
                    guard[appName](to, from);
                }
            }
        }
        /**
         * global hook for router
         * update router information base on microLocation
         * @param appName app name
         * @param microLocation location of microApp
         */
        function executeNavigationGuard(appName, to, from) {
            router.current.set(appName, to);
            runGuards(appName, to, from, beforeGuards.list());
            requestIdleCallback(() => {
                runGuards(appName, to, from, afterGuards.list());
            });
        }
        function clearRouterWhenUnmount(appName) {
            router.current.delete(appName);
        }
        /**
         * NOTE:
         * 1. app not exits
         * 2. sandbox is disabled
         * 3. router mode is custom
         */
        function commonHandlerForAttachToURL(appName) {
            if (isRouterModeSearch(appName)) {
                const app = appInstanceMap.get(appName);
                attachRouteToBrowserURL(appName, setMicroPathToURL(appName, app.sandBox.proxyWindow.location), setMicroState(appName, getMicroState(appName)));
            }
        }
        /**
         * Attach specified active app router info to browser url
         * @param appName app name
         */
        function attachToURL(appName) {
            appName = formatAppName(appName);
            if (appName && getActiveApps().includes(appName)) {
                commonHandlerForAttachToURL(appName);
            }
        }
        /**
         * Attach all active app router info to browser url
         * @param includeHiddenApp include hidden keep-alive app
         * @param includePreRender include preRender app
         */
        function attachAllToURL({ includeHiddenApp = false, includePreRender = false, }) {
            getActiveApps({
                excludeHiddenApp: !includeHiddenApp,
                excludePreRender: !includePreRender,
            }).forEach(appName => commonHandlerForAttachToURL(appName));
        }
        function createDefaultPageApi() {
            // defaultPage data
            const defaultPageRecord = useMapRecord();
            /**
             * defaultPage only effect when mount, and has lower priority than query on browser url
             * SetDefaultPageOptions {
             *   @param name app name
             *   @param path page path
             * }
             */
            function setDefaultPage(options) {
                const appName = formatAppName(options.name);
                if (!appName || !options.path) {
                    if ((process.env.NODE_ENV !== 'production')) {
                        if (!appName) {
                            logWarn(`setDefaultPage: invalid appName "${appName}"`);
                        }
                        else {
                            logWarn('setDefaultPage: path is required');
                        }
                    }
                    return noopFalse;
                }
                return defaultPageRecord.add(appName, options.path);
            }
            function removeDefaultPage(appName) {
                appName = formatAppName(appName);
                if (!appName)
                    return false;
                return defaultPageRecord.delete(appName);
            }
            return {
                setDefaultPage,
                removeDefaultPage,
                getDefaultPage: defaultPageRecord.get,
            };
        }
        function createBaseRouterApi() {
            /**
             * Record base app router, let child app control base app navigation
             */
            let baseRouterProxy = null;
            function setBaseAppRouter(baseRouter) {
                if (isObject$1(baseRouter)) {
                    baseRouterProxy = new Proxy(baseRouter, {
                        get(target, key) {
                            removeDomScope();
                            return bindFunctionToRawTarget(Reflect.get(target, key), target, 'BASEROUTER');
                        },
                        set(target, key, value) {
                            Reflect.set(target, key, value);
                            return true;
                        }
                    });
                }
                else if ((process.env.NODE_ENV !== 'production')) {
                    logWarn('setBaseAppRouter: Invalid base router');
                }
            }
            return {
                setBaseAppRouter,
                getBaseAppRouter: () => baseRouterProxy,
            };
        }
        // Router API for developer
        const router = Object.assign(Object.assign({ current: new Map(), encode: encodeMicroPath, decode: decodeMicroPath, push: createNavigationMethod(false), replace: createNavigationMethod(true), go: createRawHistoryMethod('go'), back: createRawHistoryMethod('back'), forward: createRawHistoryMethod('forward'), beforeEach: beforeGuards.add, afterEach: afterGuards.add, attachToURL,
            attachAllToURL }, createDefaultPageApi()), createBaseRouterApi());
        return {
            router,
            executeNavigationGuard,
            clearRouterWhenUnmount,
        };
    }
    const { router, executeNavigationGuard, clearRouterWhenUnmount, } = createRouterApi();

    const escape2RawWindowKeys = [
        'getComputedStyle',
        'visualViewport',
        'matchMedia',
        // 'DOMParser',
        'ResizeObserver',
        'IntersectionObserver',
    ];
    const escape2RawWindowRegExpKeys = [
        /animationFrame$/i,
        /mutationObserver$/i,
        /height$|width$/i,
        /offset$/i,
        // /event$/i,
        /selection$/i,
        /^range/i,
        /^screen/i,
        /^scroll/i,
        /X$|Y$/,
    ];
    const uniqueDocumentElement = [
        'body',
        'head',
        'html',
        'title',
    ];
    const hijackMicroLocationKeys = [
        'host',
        'hostname',
        'port',
        'protocol',
        'origin',
    ];
    // 有shadowRoot则代理到shadowRoot否则代理到原生document上 (属性)
    const proxy2RawDocOrShadowKeys = [
        'childElementCount',
        'children',
        'firstElementChild',
        'firstChild',
        'lastElementChild',
        'activeElement',
        'fullscreenElement',
        'pictureInPictureElement',
        'pointerLockElement',
        'styleSheets',
    ];
    // 有shadowRoot则代理到shadowRoot否则代理到原生document上 (方法)
    const proxy2RawDocOrShadowMethods = [
        'append',
        'contains',
        'replaceChildren',
        'createRange',
        'getSelection',
        'elementFromPoint',
        'elementsFromPoint',
        'getAnimations',
    ];
    // 直接代理到原生document上 (属性)
    const proxy2RawDocumentKeys = [
        'characterSet',
        'compatMode',
        'contentType',
        'designMode',
        'dir',
        'doctype',
        'embeds',
        'fullscreenEnabled',
        'hidden',
        'implementation',
        'lastModified',
        'pictureInPictureEnabled',
        'plugins',
        'readyState',
        'referrer',
        'visibilityState',
        'fonts',
    ];
    // 直接代理到原生document上 (方法)
    const proxy2RawDocumentMethods = [
        'execCommand',
        'createRange',
        'exitFullscreen',
        'exitPictureInPicture',
        'getElementsByTagNameNS',
        'hasFocus',
        'prepend',
    ];

    // origin is readonly, so we ignore when updateMicroLocation
    const locationKeys = ['href', 'pathname', 'search', 'hash', 'host', 'hostname', 'port', 'protocol', 'search'];
    // origin, fullPath is necessary for guardLocation
    const guardLocationKeys = [...locationKeys, 'origin', 'fullPath'];
    /**
     * Create location for microApp, each microApp has only one location object, it is a reference type
     * MDN https://developer.mozilla.org/en-US/docs/Web/API/Location
     * @param appName app name
     * @param url app url
     * @param microAppWindow iframeWindow, iframe only
     * @param childStaticLocation real child location info, iframe only
     * @param browserHost host of browser, iframe only
     * @param childHost host of child app, iframe only
     */
    function createMicroLocation(appName, url, microAppWindow, childStaticLocation, browserHost, childHost) {
        const rawWindow = globalEnv.rawWindow;
        const rawLocation = rawWindow.location;
        const isIframe = !!microAppWindow;
        /**
         * withLocation is microLocation for with sandbox
         * it is globally unique for child app
         */
        const withLocation = createURL(url);
        /**
         * In iframe, jump through raw iframeLocation will cause microAppWindow.location reset
         * So we get location dynamically
         */
        function getTarget() {
            return isIframe ? microAppWindow.location : withLocation;
        }
        /**
         * Common handler for href, assign, replace
         * It is mainly used to deal with special scenes about hash
         * @param value target path
         * @param methodName pushState/replaceState
         * @returns origin value or formatted value
         */
        function commonHandler(value, methodName) {
            const targetLocation = createURL(value, proxyLocation.href);
            // Even if the origin is the same, developers still have the possibility of want to jump to a new page
            if (targetLocation.origin === proxyLocation.origin) {
                const setMicroPathResult = setMicroPathToURL(appName, targetLocation);
                // if disable memory-router, navigate directly through rawLocation
                if (isRouterModeSearch(appName)) {
                    /**
                     * change hash with location.href will not trigger the browser reload
                     * so we use pushState & reload to imitate href behavior
                     * NOTE:
                     *    1. if child app only change hash, it should not trigger browser reload
                     *    2. if address is same and has hash, it should not add route stack
                     */
                    if (targetLocation.pathname === proxyLocation.pathname &&
                        targetLocation.search === proxyLocation.search) {
                        let oldHref = null;
                        if (targetLocation.hash !== proxyLocation.hash) {
                            if (setMicroPathResult.isAttach2Hash)
                                oldHref = rawLocation.href;
                            nativeHistoryNavigate(appName, methodName, setMicroPathResult.fullPath);
                        }
                        if (targetLocation.hash) {
                            dispatchNativeEvent(appName, false, oldHref);
                        }
                        else {
                            reload();
                        }
                        return void 0;
                        /**
                         * when baseApp is hash router, address change of child can not reload browser
                         * so we imitate behavior of browser (reload) manually
                         */
                    }
                    else if (setMicroPathResult.isAttach2Hash) {
                        nativeHistoryNavigate(appName, methodName, setMicroPathResult.fullPath);
                        reload();
                        return void 0;
                    }
                }
                return setMicroPathResult.fullPath;
            }
            return value;
        }
        /**
         * common handler for location.pathname & location.search
         * @param targetPath target fullPath
         * @param key pathname/search
         */
        function handleForPathNameAndSearch(targetPath, key) {
            const targetLocation = createURL(targetPath, url);
            // When the browser url has a hash value, the same pathname/search will not refresh browser
            if (targetLocation[key] === proxyLocation[key] && proxyLocation.hash) {
                // The href has not changed, not need to dispatch hashchange event
                dispatchNativeEvent(appName, false);
            }
            else {
                /**
                 * When the value is the same, no new route stack will be added
                 * Special scenes such as:
                 * pathname: /path ==> /path#hash, /path ==> /path?query
                 * search: ?query ==> ?query#hash
                 */
                nativeHistoryNavigate(appName, targetLocation[key] === proxyLocation[key] ? 'replaceState' : 'pushState', setMicroPathToURL(appName, targetLocation).fullPath);
                reload();
            }
        }
        const createLocationMethod = (locationMethodName) => {
            return function (value) {
                if (isEffectiveApp(appName)) {
                    const targetPath = commonHandler(value, locationMethodName === 'assign' ? 'pushState' : 'replaceState');
                    if (targetPath) {
                        // Same as href, complete targetPath with browser origin in vite env
                        rawLocation[locationMethodName](createURL(targetPath, rawLocation.origin).href);
                    }
                }
            };
        };
        const assign = createLocationMethod('assign');
        const replace = createLocationMethod('replace');
        const reload = (forcedReload) => rawLocation.reload(forcedReload);
        rawDefineProperty(getTarget(), 'fullPath', {
            enumerable: true,
            configurable: true,
            get: () => proxyLocation.pathname + proxyLocation.search + proxyLocation.hash,
        });
        /**
         * location.assign/replace is readonly, cannot be proxy, so we use empty object as proxy target
         */
        const proxyLocation = new Proxy({}, {
            get: (_, key) => {
                const target = getTarget();
                if (key === 'assign')
                    return assign;
                if (key === 'replace')
                    return replace;
                if (key === 'reload')
                    return reload;
                if (key === 'self')
                    return target;
                if (key === 'fullPath')
                    return target.fullPath;
                if (isRouterModeNative(appName)) {
                    return bindFunctionToRawTarget(Reflect.get(rawLocation, key), rawLocation, 'LOCATION');
                }
                // src of iframe is base app address, it needs to be replaced separately
                if (isIframe) {
                    // host hostname port protocol
                    if (hijackMicroLocationKeys.includes(key)) {
                        return childStaticLocation[key];
                    }
                    if (key === 'href') {
                        // do not use target, because target may be deleted
                        return target[key].replace(browserHost, childHost);
                    }
                }
                return bindFunctionToRawTarget(Reflect.get(target, key), target, 'LOCATION');
            },
            set: (_, key, value) => {
                if (isEffectiveApp(appName)) {
                    const target = getTarget();
                    if (key === 'href') {
                        /**
                         * In vite, targetPath without origin will be completed with child origin
                         * So we use browser origin to complete targetPath to avoid this problem
                         * NOTE:
                         *  1. history mode & value is childOrigin + path ==> jump to browserOrigin + path
                         *  2. disable mode & value is childOrigin + path ==> jump to childOrigin + path
                         *  3. search mode & value is browserOrigin + path ==> jump to browserOrigin + path
                         */
                        const targetPath = commonHandler(value, 'pushState');
                        if (targetPath) {
                            rawLocation.href = createURL(targetPath, rawLocation.origin).href;
                        }
                    }
                    else if (key === 'pathname') {
                        if (isRouterModeCustom(appName)) {
                            rawLocation.pathname = value;
                        }
                        else {
                            const targetPath = ('/' + value).replace(/^\/+/, '/') + proxyLocation.search + proxyLocation.hash;
                            handleForPathNameAndSearch(targetPath, 'pathname');
                        }
                    }
                    else if (key === 'search') {
                        if (isRouterModeCustom(appName)) {
                            rawLocation.search = value;
                        }
                        else {
                            const targetPath = proxyLocation.pathname + ('?' + value).replace(/^\?+/, '?') + proxyLocation.hash;
                            handleForPathNameAndSearch(targetPath, 'search');
                        }
                    }
                    else if (key === 'hash') {
                        if (isRouterModeCustom(appName)) {
                            rawLocation.hash = value;
                        }
                        else {
                            const targetPath = proxyLocation.pathname + proxyLocation.search + ('#' + value).replace(/^#+/, '#');
                            const targetLocation = createURL(targetPath, url);
                            // The same hash will not trigger popStateEvent
                            if (targetLocation.hash !== proxyLocation.hash) {
                                navigateWithNativeEvent(appName, 'pushState', setMicroPathToURL(appName, targetLocation), false);
                            }
                        }
                    }
                    else {
                        Reflect.set(target, key, value);
                    }
                }
                return true;
            },
        });
        return proxyLocation;
    }
    /**
     * create guardLocation by microLocation, used for router guard
     */
    function createGuardLocation(appName, microLocation) {
        const guardLocation = assign({ name: appName }, microLocation);
        // The prototype values on the URL needs to be manually transferred
        for (const key of guardLocationKeys)
            guardLocation[key] = microLocation[key];
        return guardLocation;
    }
    // for updateBrowserURLWithLocation when initial
    function autoTriggerNavigationGuard(appName, microLocation) {
        executeNavigationGuard(appName, createGuardLocation(appName, microLocation), createGuardLocation(appName, microLocation));
    }
    /**
     * The following scenes will trigger location update:
     * 1. pushState/replaceState
     * 2. popStateEvent
     * 3. query on browser url when init sub app
     * 4. set defaultPage when when init sub app
     * NOTE:
     * 1. update browser URL first, and then update microLocation
     * 2. the same fullPath will not trigger router guards
     * @param appName app name
     * @param path target path
     * @param base base url
     * @param microLocation micro app location
     * @param type auto prevent
     */
    function updateMicroLocation(appName, path, microLocation, type) {
        var _a;
        // record old values of microLocation to `from`
        const from = createGuardLocation(appName, microLocation);
        // if is iframeSandbox, microLocation muse be rawLocation of iframe, not proxyLocation
        const newLocation = createURL(path, microLocation.href);
        if (isIframeSandbox(appName)) {
            const microAppWindow = appInstanceMap.get(appName).sandBox.microAppWindow;
            (_a = microAppWindow.rawReplaceState) === null || _a === void 0 ? void 0 : _a.call(microAppWindow.history, getMicroState(appName), '', newLocation.href);
        }
        else {
            let targetHref = newLocation.href;
            if (microLocation.self.origin !== newLocation.origin) {
                targetHref = targetHref.replace(newLocation.origin, microLocation.self.origin);
            }
            microLocation.self.href = targetHref;
        }
        // update latest values of microLocation to `to`
        const to = createGuardLocation(appName, microLocation);
        // The hook called only when fullPath changed
        if (type === 'auto' || (from.fullPath !== to.fullPath && type !== 'prevent')) {
            executeNavigationGuard(appName, to, from);
        }
    }

    /**
     * TODO: 关于关闭虚拟路由系统的custom、history模式
     * 1. 是否需要发送popstate事件，为了减小对基座的影响，现在不发送
     * 2. 关闭后导致的vue3路由冲突问题需要在文档中明确指出(2处：在关闭虚拟路由系统的配置那里着重说明，在vue常见问题中说明)
     */
    /**
     * The router system has two operations: read and write
     * Read through location and write through history & location
     * @param appName app name
     * @param url app url
     * @returns MicroRouter
     */
    function createMicroRouter(appName, url) {
        const microLocation = createMicroLocation(appName, url);
        return {
            microLocation,
            microHistory: createMicroHistory(appName, microLocation),
        };
    }
    /**
     * When the sandbox executes start, or the hidden keep-alive application is re-rendered, the location is updated according to the browser url or attach router info to browser url
     * @param appName app.name
     * @param microLocation MicroLocation for sandbox
     * @param defaultPage default page
     */
    function initRouteStateWithURL(appName, microLocation, defaultPage) {
        const microPath = getMicroPathFromURL(appName);
        if (microPath) {
            updateMicroLocation(appName, microPath, microLocation, 'auto');
        }
        else {
            updateBrowserURLWithLocation(appName, microLocation, defaultPage);
        }
    }
    /**
     * initialize browser information according to microLocation
     * Scenes:
     *  1. sandbox.start
     *  2. reshow of keep-alive app
     */
    function updateBrowserURLWithLocation(appName, microLocation, defaultPage) {
        // update microLocation with defaultPage
        if (defaultPage)
            updateMicroLocation(appName, defaultPage, microLocation, 'prevent');
        if (!isRouterModePure(appName)) {
            // attach microApp route info to browser URL
            attachRouteToBrowserURL(appName, setMicroPathToURL(appName, microLocation), setMicroState(appName, null));
        }
        // trigger guards after change browser URL
        autoTriggerNavigationGuard(appName, microLocation);
    }
    /**
     * In any case, microPath & microState will be removed from browser, but location will be initialized only when keep-router-state is false
     * @param appName app name
     * @param url app url
     * @param microLocation location of microApp
     * @param keepRouteState keep-router-state is only used to control whether to clear the location of microApp, default is false
     */
    function clearRouteStateFromURL(appName, url, microLocation, keepRouteState) {
        if (!isRouterModeCustom(appName)) {
            if (!keepRouteState) {
                const { pathname, search, hash } = createURL(url);
                updateMicroLocation(appName, pathname + search + hash, microLocation, 'prevent');
            }
            if (!isRouterModePure(appName)) {
                removePathFromBrowser(appName);
            }
        }
        clearRouterWhenUnmount(appName);
    }
    /**
     * remove microState from history.state and remove microPath from browserURL
     * called on sandbox.stop or hidden of keep-alive app
     */
    function removePathFromBrowser(appName) {
        attachRouteToBrowserURL(appName, removeMicroPathFromURL(appName), removeMicroState(appName, globalEnv.rawWindow.history.state));
    }

    class BaseSandbox {
        constructor() {
            // keys that can only assigned to rawWindow
            this.rawWindowScopeKeyList = [
                'location',
            ];
            // keys that can escape to rawWindow
            this.staticEscapeProperties = [
                'System',
                '__cjsWrapper',
            ];
            // keys that scoped in child app
            this.staticScopeProperties = [
                'webpackJsonp',
                'webpackHotUpdate',
                'Vue',
                // TODO: 是否可以和constants/SCOPE_WINDOW_ON_EVENT合并
                'onpopstate',
                'onhashchange',
            ];
            // Properties that can only get and set in microAppWindow, will not escape to rawWindow
            this.scopeProperties = Array.from(this.staticScopeProperties);
            // Properties that can be escape to rawWindow
            this.escapeProperties = [];
            // Properties newly added to microAppWindow
            this.injectedKeys = new Set();
            // Properties escape to rawWindow, cleared when unmount
            this.escapeKeys = new Set();
            this.injectReactHMRProperty();
        }
        // adapter for react
        injectReactHMRProperty() {
            if ((process.env.NODE_ENV !== 'production')) {
                // react child in non-react env
                this.staticEscapeProperties.push('__REACT_ERROR_OVERLAY_GLOBAL_HOOK__');
                // in react parent
                if (globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__) {
                    this.staticScopeProperties = this.staticScopeProperties.concat([
                        '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__',
                        '__reactRefreshInjected',
                    ]);
                }
            }
        }
    }
    /**
     * TODO:
     *  1、将class Adapter去掉，改为CustomWindow，或者让CustomWindow继承Adapter
     *  2、with沙箱中的常量放入CustomWindow，虽然和iframe沙箱不一致，但更合理
     * 修改时机：在iframe沙箱支持插件后再修改
     */
    class CustomWindow {
    }
    // Fix conflict of babel-polyfill@6.x
    function fixBabelPolyfill6() {
        if (globalEnv.rawWindow._babelPolyfill)
            globalEnv.rawWindow._babelPolyfill = false;
    }
    /**
     * Fix error of hot reload when parent&child created by create-react-app in development environment
     * Issue: https://github.com/micro-zoe/micro-app/issues/382
     */
    function fixReactHMRConflict(app) {
        var _a;
        if ((process.env.NODE_ENV !== 'production')) {
            const rawReactErrorHook = globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__;
            const childReactErrorHook = (_a = app.sandBox) === null || _a === void 0 ? void 0 : _a.proxyWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__;
            if (rawReactErrorHook && childReactErrorHook) {
                globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = childReactErrorHook;
                defer(() => {
                    globalEnv.rawWindow.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = rawReactErrorHook;
                });
            }
        }
    }
    /**
     * update dom tree of target dom
     * @param container target dom
     * @param appName app name
     */
    function patchElementTree(container, appName) {
        const children = Array.from(container.children);
        children.length && children.forEach((child) => {
            patchElementTree(child, appName);
        });
        for (const child of children) {
            updateElementInfo(child, appName);
        }
    }
    /**
     * rewrite baseURI, ownerDocument, __MICRO_APP_NAME__ of target node
     * @param node target node
     * @param appName app name
     * @returns target node
     */
    function updateElementInfo(node, appName) {
        var _a, _b;
        const proxyWindow = (_b = (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.sandBox) === null || _b === void 0 ? void 0 : _b.proxyWindow;
        if (isNode(node) &&
            !node.__MICRO_APP_NAME__ &&
            !node.__PURE_ELEMENT__ &&
            proxyWindow) {
            /**
             * TODO:
             *  1. 测试baseURI和ownerDocument在with沙箱中是否正确
             *    经过验证with沙箱不能重写ownerDocument，否则react点击事件会触发两次
             *  2. with沙箱所有node设置__MICRO_APP_NAME__都使用updateElementInfo
            */
            rawDefineProperties(node, {
                baseURI: {
                    configurable: true,
                    // if disable-memory-router or router-mode='disable', href point to base app
                    get: () => proxyWindow.location.href,
                },
                __MICRO_APP_NAME__: {
                    configurable: true,
                    writable: true,
                    value: appName,
                },
            });
        }
        return node;
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * Promise<Response> fetch(input[, init])
     * input: string/Request
     * init?: object
     * @param url app url
     * @param target proxy target
     */
    function createMicroFetch(url, target) {
        const rawFetch = !isUndefined$1(target) ? target : globalEnv.rawWindow.fetch;
        if (!isFunction$1(rawFetch))
            return rawFetch;
        return function microFetch(input, init, ...rests) {
            if (isString$1(input) || isURL(input)) {
                input = createURL(input, url).toString();
            }
            /**
             * When fetch rewrite by baseApp, domScope still active when exec rawWindow.fetch
             * If baseApp operate dom in fetch, it will cause error
             * The same for XMLHttpRequest, EventSource
             */
            removeDomScope();
            return rawFetch.call(globalEnv.rawWindow, input, init, ...rests);
        };
    }
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
     * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
     * @param url app url
     * @param target proxy target
     */
    function createMicroXMLHttpRequest(url, target) {
        const rawXMLHttpRequest = !isUndefined$1(target) ? target : globalEnv.rawWindow.XMLHttpRequest;
        if (!isConstructor(rawXMLHttpRequest))
            return rawXMLHttpRequest;
        return class MicroXMLHttpRequest extends rawXMLHttpRequest {
            open(method, reqUrl, ...rests) {
                if ((isString$1(reqUrl) && !/^f(ile|tp):\/\//.test(reqUrl)) || isURL(reqUrl)) {
                    reqUrl = createURL(reqUrl, url).toString();
                }
                removeDomScope();
                super.open(method, reqUrl, ...rests);
            }
        };
    }
    function useMicroEventSource() {
        let eventSourceMap;
        /**
         * https://developer.mozilla.org/en-US/docs/Web/API/EventSource
         * pc = new EventSource(url[, configuration])
         * url: string/Request
         * configuration?: object
         * @param url app url
         * @param target proxy target
         */
        function createMicroEventSource(appName, url, target) {
            const rawEventSource = !isUndefined$1(target) ? target : globalEnv.rawWindow.EventSource;
            if (!isConstructor(rawEventSource))
                return rawEventSource;
            return class MicroEventSource extends rawEventSource {
                constructor(eventSourceUrl, eventSourceInitDict, ...rests) {
                    if (isString$1(eventSourceUrl) || isURL(eventSourceUrl)) {
                        eventSourceUrl = createURL(eventSourceUrl, url).toString();
                    }
                    removeDomScope();
                    super(eventSourceUrl, eventSourceInitDict, ...rests);
                    if (eventSourceMap) {
                        const eventSourceList = eventSourceMap.get(appName);
                        if (eventSourceList) {
                            eventSourceList.add(this);
                        }
                        else {
                            eventSourceMap.set(appName, new Set([this]));
                        }
                    }
                    else {
                        eventSourceMap = new Map([[appName, new Set([this])]]);
                    }
                }
                close() {
                    var _a;
                    super.close();
                    (_a = eventSourceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.delete(this);
                }
            };
        }
        function clearMicroEventSource(appName) {
            const eventSourceList = eventSourceMap === null || eventSourceMap === void 0 ? void 0 : eventSourceMap.get(appName);
            if (eventSourceList === null || eventSourceList === void 0 ? void 0 : eventSourceList.size) {
                eventSourceList.forEach(item => {
                    item.close();
                });
                eventSourceList.clear();
            }
        }
        return {
            createMicroEventSource,
            clearMicroEventSource,
        };
    }

    const { createMicroEventSource, clearMicroEventSource } = useMicroEventSource();
    class WithSandBox extends BaseSandbox {
        constructor(appName, url) {
            super();
            this.active = false;
            this.microAppWindow = new CustomWindow(); // Proxy target
            this.patchWith((resolve) => {
                // get scopeProperties and escapeProperties from plugins
                this.getSpecialProperties(appName);
                // create location, history for child app
                this.patchRouter(appName, url, this.microAppWindow);
                // patch window of child app
                this.windowEffect = patchWindow(appName, this.microAppWindow, this);
                // patch document of child app
                this.documentEffect = patchDocument(appName, this.microAppWindow, this);
                // properties associated with the native window
                this.setMappingPropertiesWithRawDescriptor(this.microAppWindow);
                // inject global properties
                this.initStaticGlobalKeys(appName, url, this.microAppWindow);
                resolve();
            });
        }
        /**
         * open sandbox and perform some initial actions
         * @param umdMode is umd mode
         * @param baseroute base route for child
         * @param defaultPage default page when mount child base on virtual router
         * @param disablePatchRequest prevent patchRequestApi
         */
        start({ umdMode, baseroute, defaultPage, disablePatchRequest, }) {
            if (this.active)
                return;
            this.active = true;
            /* --- memory router part --- start */
            // update microLocation, attach route info to browser url
            this.initRouteState(defaultPage);
            // unique listener of popstate event for sub app
            this.removeHistoryListener = addHistoryListener(this.microAppWindow.__MICRO_APP_NAME__);
            if (isRouterModeCustom(this.microAppWindow.__MICRO_APP_NAME__)) {
                this.microAppWindow.__MICRO_APP_BASE_ROUTE__ = this.microAppWindow.__MICRO_APP_BASE_URL__ = baseroute;
            }
            /* --- memory router part --- end */
            /**
             * Target: Ensure default mode action exactly same to first time when render again
             * 1. The following globalKey maybe modified when render, reset them when render again in default mode
             * 2. Umd mode will not delete any keys during sandBox.stop, ignore umd mode
             * 3. When sandbox.start called for the first time, it must be the default mode
             */
            if (!umdMode) {
                this.initGlobalKeysWhenStart(this.microAppWindow.__MICRO_APP_NAME__, this.microAppWindow.__MICRO_APP_URL__, this.microAppWindow, disablePatchRequest);
            }
            if (++globalEnv.activeSandbox === 1) {
                patchElementAndDocument();
                patchHistory();
            }
            if (++WithSandBox.activeCount === 1) {
                // effectDocumentEvent()
                initEnvOfNestedApp();
            }
            fixBabelPolyfill6();
        }
        /**
         * close sandbox and perform some clean up actions
         * @param umdMode is umd mode
         * @param keepRouteState prevent reset route
         * @param destroy completely destroy, delete cache resources
         * @param clearData clear data from base app
         */
        stop({ umdMode, keepRouteState, destroy, clearData, }) {
            var _a;
            if (!this.active)
                return;
            this.recordAndReleaseEffect({ umdMode, clearData, destroy }, !umdMode || destroy);
            /* --- memory router part --- start */
            // rest url and state of browser
            this.clearRouteState(keepRouteState);
            // release listener of popstate for child app
            (_a = this.removeHistoryListener) === null || _a === void 0 ? void 0 : _a.call(this);
            /* --- memory router part --- end */
            /**
             * NOTE:
             *  1. injectedKeys and escapeKeys must be placed at the back
             *  2. if key in initial microAppWindow, and then rewrite, this key will be delete from microAppWindow when stop, and lost when restart
             *  3. umd mode will not delete global keys
             */
            if (!umdMode || destroy) {
                clearMicroEventSource(this.microAppWindow.__MICRO_APP_NAME__);
                this.injectedKeys.forEach((key) => {
                    Reflect.deleteProperty(this.microAppWindow, key);
                });
                this.injectedKeys.clear();
                this.escapeKeys.forEach((key) => {
                    Reflect.deleteProperty(globalEnv.rawWindow, key);
                });
                this.escapeKeys.clear();
            }
            if (--globalEnv.activeSandbox === 0) {
                releasePatchElementAndDocument();
                releasePatchHistory();
            }
            if (--WithSandBox.activeCount === 0) ;
            this.active = false;
        }
        /**
         * inject global properties to microAppWindow
         * TODO: 设置为只读变量
         * @param appName app name
         * @param url app url
         * @param microAppWindow micro window
         */
        initStaticGlobalKeys(appName, url, microAppWindow) {
            microAppWindow.__MICRO_APP_ENVIRONMENT__ = true;
            microAppWindow.__MICRO_APP_NAME__ = appName;
            microAppWindow.__MICRO_APP_URL__ = url;
            microAppWindow.__MICRO_APP_PUBLIC_PATH__ = getEffectivePath(url);
            microAppWindow.__MICRO_APP_BASE_ROUTE__ = '';
            microAppWindow.__MICRO_APP_WINDOW__ = microAppWindow;
            microAppWindow.__MICRO_APP_PRE_RENDER__ = false;
            microAppWindow.__MICRO_APP_UMD_MODE__ = false;
            microAppWindow.__MICRO_APP_PROXY_WINDOW__ = this.proxyWindow;
            microAppWindow.__MICRO_APP_SANDBOX__ = this;
            microAppWindow.__MICRO_APP_SANDBOX_TYPE__ = 'with';
            microAppWindow.rawWindow = globalEnv.rawWindow;
            microAppWindow.rawDocument = globalEnv.rawDocument;
            microAppWindow.microApp = assign(new EventCenterForMicroApp(appName), {
                removeDomScope,
                pureCreateElement,
                router,
            });
        }
        /**
         * Record global effect and then release (effect: global event, timeout, data listener)
         * Scenes:
         * 1. unmount of default/umd app
         * 2. hidden keep-alive app
         * 3. after init prerender app
         * @param options {
         *  @param clearData clear data from base app
         *  @param isPrerender is prerender app
         *  @param keepAlive is keep-alive app
         * }
         * @param preventRecord prevent record effect events
         */
        recordAndReleaseEffect(options, preventRecord = false) {
            if (preventRecord) {
                this.resetEffectSnapshot();
            }
            else {
                this.recordEffectSnapshot();
            }
            this.releaseGlobalEffect(options);
        }
        /**
         * reset effect snapshot data in default mode or destroy
         * Scenes:
         *  1. unmount hidden keep-alive app manually
         *  2. unmount prerender app manually
         */
        resetEffectSnapshot() {
            this.windowEffect.reset();
            this.documentEffect.reset();
            resetDataCenterSnapshot(this.microAppWindow.microApp);
        }
        /**
         * record umd snapshot before the first execution of umdHookMount
         * Scenes:
         * 1. exec umdMountHook in umd mode
         * 2. hidden keep-alive app
         * 3. after init prerender app
         */
        recordEffectSnapshot() {
            this.windowEffect.record();
            this.documentEffect.record();
            recordDataCenterSnapshot(this.microAppWindow.microApp);
        }
        // rebuild umd snapshot before remount umd app
        rebuildEffectSnapshot() {
            this.windowEffect.rebuild();
            this.documentEffect.rebuild();
            rebuildDataCenterSnapshot(this.microAppWindow.microApp);
        }
        /**
         * clear global event, timeout, data listener
         * Scenes:
         * 1. unmount of default/umd app
         * 2. hidden keep-alive app
         * 3. after init prerender app
         * @param umdMode is umd mode
         * @param clearData clear data from base app
         * @param isPrerender is prerender app
         * @param keepAlive is keep-alive app
         * @param destroy completely destroy
         */
        releaseGlobalEffect({ umdMode = false, clearData = false, isPrerender = false, keepAlive = false, destroy = false, }) {
            var _a, _b, _c;
            // default mode(not keep-alive or isPrerender)
            this.windowEffect.release((!umdMode && !keepAlive && !isPrerender) || destroy);
            this.documentEffect.release();
            (_a = this.microAppWindow.microApp) === null || _a === void 0 ? void 0 : _a.clearDataListener();
            (_b = this.microAppWindow.microApp) === null || _b === void 0 ? void 0 : _b.clearGlobalDataListener();
            if (clearData) {
                microApp.clearData(this.microAppWindow.__MICRO_APP_NAME__);
                (_c = this.microAppWindow.microApp) === null || _c === void 0 ? void 0 : _c.clearData();
            }
        }
        /**
         * get scopeProperties and escapeProperties from plugins & adapter
         * @param appName app name
         */
        getSpecialProperties(appName) {
            var _a;
            if (isPlainObject$1(microApp.options.plugins)) {
                this.commonActionForSpecialProperties(microApp.options.plugins.global);
                this.commonActionForSpecialProperties((_a = microApp.options.plugins.modules) === null || _a === void 0 ? void 0 : _a[appName]);
            }
        }
        // common action for global plugins and module plugins
        commonActionForSpecialProperties(plugins) {
            if (isArray$1(plugins)) {
                for (const plugin of plugins) {
                    if (isPlainObject$1(plugin)) {
                        if (isArray$1(plugin.scopeProperties)) {
                            this.scopeProperties = this.scopeProperties.concat(plugin.scopeProperties);
                        }
                        if (isArray$1(plugin.escapeProperties)) {
                            this.escapeProperties = this.escapeProperties.concat(plugin.escapeProperties);
                        }
                    }
                }
            }
        }
        // set __MICRO_APP_PRE_RENDER__ state
        setPreRenderState(state) {
            this.microAppWindow.__MICRO_APP_PRE_RENDER__ = state;
        }
        markUmdMode(state) {
            this.microAppWindow.__MICRO_APP_UMD_MODE__ = state;
        }
        patchWith(cb) {
            this.sandboxReady = new Promise((resolve) => cb(resolve));
        }
        // properties associated with the native window
        setMappingPropertiesWithRawDescriptor(microAppWindow) {
            let topValue, parentValue;
            const rawWindow = globalEnv.rawWindow;
            if (rawWindow === rawWindow.parent) { // not in iframe
                topValue = parentValue = this.proxyWindow;
            }
            else { // in iframe
                topValue = rawWindow.top;
                parentValue = rawWindow.parent;
            }
            rawDefineProperties(microAppWindow, {
                top: this.createDescriptorForMicroAppWindow('top', topValue),
                parent: this.createDescriptorForMicroAppWindow('parent', parentValue),
            });
            GLOBAL_KEY_TO_WINDOW.forEach((key) => {
                rawDefineProperty(microAppWindow, key, this.createDescriptorForMicroAppWindow(key, this.proxyWindow));
            });
        }
        createDescriptorForMicroAppWindow(key, value) {
            const { configurable = true, enumerable = true, writable, set } = Object.getOwnPropertyDescriptor(globalEnv.rawWindow, key) || { writable: true };
            const descriptor = {
                value,
                configurable,
                enumerable,
                writable: writable !== null && writable !== void 0 ? writable : !!set
            };
            return descriptor;
        }
        /**
         * init global properties of microAppWindow when exec sandBox.start
         * @param microAppWindow micro window
         * @param appName app name
         * @param url app url
         * @param disablePatchRequest prevent rewrite request method of child app
         */
        initGlobalKeysWhenStart(appName, url, microAppWindow, disablePatchRequest) {
            microAppWindow.hasOwnProperty = (key) => rawHasOwnProperty.call(microAppWindow, key) || rawHasOwnProperty.call(globalEnv.rawWindow, key);
            this.setHijackProperty(appName, microAppWindow);
            if (!disablePatchRequest)
                this.patchRequestApi(appName, url, microAppWindow);
            this.setScopeProperties(microAppWindow);
        }
        // set hijack Properties to microAppWindow
        setHijackProperty(appName, microAppWindow) {
            let modifiedEval, modifiedImage;
            rawDefineProperties(microAppWindow, {
                eval: {
                    configurable: true,
                    enumerable: false,
                    get() {
                        throttleDeferForSetAppName(appName);
                        return modifiedEval || globalEnv.rawWindow.eval;
                    },
                    set: (value) => {
                        modifiedEval = value;
                    },
                },
                Image: {
                    configurable: true,
                    enumerable: false,
                    get() {
                        throttleDeferForSetAppName(appName);
                        return modifiedImage || globalEnv.ImageProxy;
                    },
                    set: (value) => {
                        modifiedImage = value;
                    },
                },
            });
        }
        // rewrite fetch, XMLHttpRequest, EventSource
        patchRequestApi(appName, url, microAppWindow) {
            let microFetch = createMicroFetch(url);
            let microXMLHttpRequest = createMicroXMLHttpRequest(url);
            let microEventSource = createMicroEventSource(appName, url);
            rawDefineProperties(microAppWindow, {
                fetch: {
                    configurable: true,
                    enumerable: true,
                    get() {
                        return microFetch;
                    },
                    set(value) {
                        microFetch = createMicroFetch(url, value);
                    },
                },
                XMLHttpRequest: {
                    configurable: true,
                    enumerable: true,
                    get() {
                        return microXMLHttpRequest;
                    },
                    set(value) {
                        microXMLHttpRequest = createMicroXMLHttpRequest(url, value);
                    },
                },
                EventSource: {
                    configurable: true,
                    enumerable: true,
                    get() {
                        return microEventSource;
                    },
                    set(value) {
                        microEventSource = createMicroEventSource(appName, url, value);
                    },
                },
            });
        }
        /**
         * Init scope keys to microAppWindow, prevent fall to rawWindow from with(microAppWindow)
         * like: if (!xxx) {}
         * NOTE:
         * 1. Symbol.unscopables cannot affect undefined keys
         * 2. Doesn't use for window.xxx because it fall to proxyWindow
         */
        setScopeProperties(microAppWindow) {
            this.scopeProperties.forEach((key) => {
                Reflect.set(microAppWindow, key, microAppWindow[key]);
            });
        }
        // set location & history for memory router
        patchRouter(appName, url, microAppWindow) {
            const { microLocation, microHistory } = createMicroRouter(appName, url);
            rawDefineProperties(microAppWindow, {
                location: {
                    configurable: false,
                    enumerable: true,
                    get() {
                        return microLocation;
                    },
                    set: (value) => {
                        globalEnv.rawWindow.location = value;
                    },
                },
                history: {
                    configurable: true,
                    enumerable: true,
                    get() {
                        return microHistory;
                    },
                },
            });
        }
        initRouteState(defaultPage) {
            initRouteStateWithURL(this.microAppWindow.__MICRO_APP_NAME__, this.microAppWindow.location, defaultPage);
        }
        clearRouteState(keepRouteState) {
            clearRouteStateFromURL(this.microAppWindow.__MICRO_APP_NAME__, this.microAppWindow.__MICRO_APP_URL__, this.microAppWindow.location, keepRouteState);
        }
        setRouteInfoForKeepAliveApp() {
            updateBrowserURLWithLocation(this.microAppWindow.__MICRO_APP_NAME__, this.microAppWindow.location);
        }
        removeRouteInfoForKeepAliveApp() {
            removePathFromBrowser(this.microAppWindow.__MICRO_APP_NAME__);
        }
        /**
         * Format all html elements when init
         * @param container micro app container
         */
        patchStaticElement(container) {
            patchElementTree(container, this.microAppWindow.__MICRO_APP_NAME__);
        }
        /**
         * action before exec scripts when mount
         * Actions:
         * 1. patch static elements from html
         * @param container micro app container
         */
        actionBeforeExecScripts(container) {
            this.patchStaticElement(container);
        }
        setStaticAppState(state) {
            this.microAppWindow.__MICRO_APP_STATE__ = state;
        }
    }
    WithSandBox.activeCount = 0; // number of active sandbox

    function patchRouter(appName, url, microAppWindow, browserHost) {
        const childStaticLocation = createURL(url);
        const childHost = childStaticLocation.protocol + '//' + childStaticLocation.host;
        const childFullPath = childStaticLocation.pathname + childStaticLocation.search + childStaticLocation.hash;
        // rewrite microAppWindow.history
        const microHistory = microAppWindow.history;
        microAppWindow.rawReplaceState = microHistory.replaceState;
        assign(microHistory, createMicroHistory(appName, microAppWindow.location));
        /**
         * Init microLocation before exec sandbox.start
         * NOTE:
         *  1. exec updateMicroLocation after patch microHistory
         *  2. sandbox.start will sync microLocation info to browser url
         */
        updateMicroLocation(appName, childFullPath, microAppWindow.location, 'prevent');
        // create proxyLocation
        return createMicroLocation(appName, url, microAppWindow, childStaticLocation, browserHost, childHost);
    }

    /**
     * patch window of child app
     * @param appName app name
     * @param microAppWindow microWindow of child app
     * @param sandbox WithSandBox
     * @returns EffectHook
     */
    function patchWindow$1(appName, microAppWindow, sandbox) {
        patchWindowProperty$1(appName, microAppWindow);
        createProxyWindow$1(microAppWindow, sandbox);
        return patchWindowEffect$1(microAppWindow);
    }
    /**
     * rewrite special properties of window
     * @param appName app name
     * @param microAppWindow child app microWindow
     */
    function patchWindowProperty$1(appName, microAppWindow) {
        const rawWindow = globalEnv.rawWindow;
        escape2RawWindowKeys.forEach((key) => {
            microAppWindow[key] = bindFunctionToRawTarget(rawWindow[key], rawWindow);
        });
        Object.getOwnPropertyNames(microAppWindow)
            .filter((key) => {
            escape2RawWindowRegExpKeys.some((reg) => {
                if (reg.test(key) && key in microAppWindow.parent) {
                    if (isFunction$1(rawWindow[key])) {
                        microAppWindow[key] = bindFunctionToRawTarget(rawWindow[key], rawWindow);
                    }
                    else {
                        const { configurable, enumerable } = Object.getOwnPropertyDescriptor(microAppWindow, key) || {
                            configurable: true,
                            enumerable: true,
                        };
                        if (configurable) {
                            rawDefineProperty(microAppWindow, key, {
                                configurable,
                                enumerable,
                                get: () => rawWindow[key],
                                set: (value) => { rawWindow[key] = value; },
                            });
                        }
                    }
                    return true;
                }
                return false;
            });
            return /^on/.test(key) && !SCOPE_WINDOW_ON_EVENT.includes(key);
        })
            .forEach((eventName) => {
            const { enumerable, writable, set } = Object.getOwnPropertyDescriptor(microAppWindow, eventName) || {
                enumerable: true,
                writable: true,
            };
            try {
                rawDefineProperty(microAppWindow, eventName, {
                    enumerable,
                    configurable: true,
                    get: () => rawWindow[eventName],
                    set: (writable !== null && writable !== void 0 ? writable : !!set) ? (value) => { rawWindow[eventName] = isFunction$1(value) ? value.bind(microAppWindow) : value; }
                        : undefined,
                });
            }
            catch (e) {
                logWarn(e, appName);
            }
        });
    }
    /**
     * create proxyWindow with Proxy(microAppWindow)
     * @param microAppWindow micro app window
     * @param sandbox IframeSandbox
     */
    function createProxyWindow$1(microAppWindow, sandbox) {
        const rawWindow = globalEnv.rawWindow;
        const customProperties = new Set();
        /**
         * proxyWindow will only take effect in certain scenes, such as window.key
         * e.g:
         *  1. window.key in normal app --> fall into proxyWindow
         *  2. window.key in module app(vite), fall into microAppWindow(iframeWindow)
         *  3. if (key)... --> fall into microAppWindow(iframeWindow)
         */
        const proxyWindow = new Proxy(microAppWindow, {
            get: (target, key) => {
                if (key === 'location') {
                    return sandbox.proxyLocation;
                }
                if (includes(GLOBAL_KEY_TO_WINDOW, key)) {
                    return proxyWindow;
                }
                if (customProperties.has(key)) {
                    return Reflect.get(target, key);
                }
                /**
                 * Same as proxyWindow, escapeProperties will only take effect in certain scenes
                 * e.g:
                 *  1. window.key in normal app --> fall into proxyWindow, escapeProperties will effect
                 *  2. window.key in module app(vite), fall into microAppWindow(iframeWindow), escapeProperties will not take effect
                 *  3. if (key)... --> fall into microAppWindow(iframeWindow), escapeProperties will not take effect
                 */
                if (includes(sandbox.escapeProperties, key) && !Reflect.has(target, key)) {
                    return bindFunctionToRawTarget(Reflect.get(rawWindow, key), rawWindow);
                }
                return bindFunctionToRawTarget(Reflect.get(target, key), target);
            },
            set: (target, key, value) => {
                if (key === 'location') {
                    return Reflect.set(rawWindow, key, value);
                }
                if (!Reflect.has(target, key)) {
                    customProperties.add(key);
                }
                Reflect.set(target, key, value);
                if (includes(sandbox.escapeProperties, key)) {
                    !Reflect.has(rawWindow, key) && sandbox.escapeKeys.add(key);
                    Reflect.set(rawWindow, key, value);
                }
                return true;
            },
            has: (target, key) => key in target,
            deleteProperty: (target, key) => {
                if (Reflect.has(target, key)) {
                    sandbox.escapeKeys.has(key) && Reflect.deleteProperty(rawWindow, key);
                    return Reflect.deleteProperty(target, key);
                }
                return true;
            },
        });
        sandbox.proxyWindow = proxyWindow;
    }
    function patchWindowEffect$1(microAppWindow) {
        const { rawWindow, rawAddEventListener, rawRemoveEventListener } = globalEnv;
        const eventListenerMap = new Map();
        const sstEventListenerMap = new Map();
        function getEventTarget(type) {
            return SCOPE_WINDOW_EVENT.includes(type) ? microAppWindow : rawWindow;
        }
        // TODO: listener 是否需要绑定microAppWindow，否则函数中的this指向原生window
        microAppWindow.addEventListener = function (type, listener, options) {
            const listenerList = eventListenerMap.get(type);
            if (listenerList) {
                listenerList.add(listener);
            }
            else {
                eventListenerMap.set(type, new Set([listener]));
            }
            listener && (listener.__MICRO_APP_MARK_OPTIONS__ = options);
            rawAddEventListener.call(getEventTarget(type), type, listener, options);
        };
        microAppWindow.removeEventListener = function (type, listener, options) {
            const listenerList = eventListenerMap.get(type);
            if ((listenerList === null || listenerList === void 0 ? void 0 : listenerList.size) && listenerList.has(listener)) {
                listenerList.delete(listener);
            }
            rawRemoveEventListener.call(getEventTarget(type), type, listener, options);
        };
        const reset = () => {
            sstEventListenerMap.clear();
        };
        /**
         * NOTE:
         *  1. about timer(events & properties should record & rebuild at all modes, exclude default mode)
         *  2. record maybe call twice when unmount prerender, keep-alive app manually with umd mode
         * 4 modes: default-mode、umd-mode、prerender、keep-alive
         * Solution:
         *  1. default-mode(normal): clear events & timers, not record & rebuild anything
         *  2. umd-mode(normal): not clear timers, record & rebuild events
         *  3. prerender/keep-alive(default, umd): not clear timers, record & rebuild events
         *
         * TODO: 现在的 清除、记录和恢复操作分散的太零散，sandbox、create_app中都有分散，将代码再优化一下，集中处理
         */
        const record = () => {
            // record window event
            eventListenerMap.forEach((listenerList, type) => {
                if (listenerList.size) {
                    const cacheList = sstEventListenerMap.get(type) || [];
                    sstEventListenerMap.set(type, new Set([...cacheList, ...listenerList]));
                }
            });
        };
        // rebuild event and timer before remount app
        const rebuild = () => {
            // rebuild window event
            sstEventListenerMap.forEach((listenerList, type) => {
                for (const listener of listenerList) {
                    microAppWindow.addEventListener(type, listener, listener === null || listener === void 0 ? void 0 : listener.__MICRO_APP_MARK_OPTIONS__);
                }
            });
            reset();
        };
        const release = () => {
            // Clear window binding events
            if (eventListenerMap.size) {
                eventListenerMap.forEach((listenerList, type) => {
                    for (const listener of listenerList) {
                        rawRemoveEventListener.call(getEventTarget(type), type, listener);
                    }
                });
                eventListenerMap.clear();
            }
        };
        return {
            reset,
            record,
            rebuild,
            release,
        };
    }

    /**
     * TODO: 1、shadowDOM 2、结构优化
     *
     * patch document of child app
     * @param appName app name
     * @param microAppWindow microWindow of child app
     * @param sandbox IframeSandbox
     * @returns EffectHook
     */
    function patchDocument$1(appName, microAppWindow, sandbox) {
        patchDocumentPrototype(appName, microAppWindow);
        patchDocumentProperty(appName, microAppWindow, sandbox);
        return patchDocumentEffect(appName, microAppWindow);
    }
    function patchDocumentPrototype(appName, microAppWindow) {
        const rawDocument = globalEnv.rawDocument;
        const microRootDocument = microAppWindow.Document;
        const microDocument = microAppWindow.document;
        const rawMicroCreateElement = microRootDocument.prototype.createElement;
        const rawMicroCreateElementNS = microRootDocument.prototype.createElementNS;
        const rawMicroCreateTextNode = microRootDocument.prototype.createTextNode;
        const rawMicroCreateDocumentFragment = microRootDocument.prototype.createDocumentFragment;
        const rawMicroCreateComment = microRootDocument.prototype.createComment;
        const rawMicroQuerySelector = microRootDocument.prototype.querySelector;
        const rawMicroQuerySelectorAll = microRootDocument.prototype.querySelectorAll;
        const rawMicroGetElementById = microRootDocument.prototype.getElementById;
        const rawMicroGetElementsByClassName = microRootDocument.prototype.getElementsByClassName;
        const rawMicroGetElementsByTagName = microRootDocument.prototype.getElementsByTagName;
        const rawMicroGetElementsByName = microRootDocument.prototype.getElementsByName;
        const rawMicroElementFromPoint = microRootDocument.prototype.elementFromPoint;
        const rawMicroCaretRangeFromPoint = microRootDocument.prototype.caretRangeFromPoint;
        microRootDocument.prototype.caretRangeFromPoint = function caretRangeFromPoint(x, y) {
            // 这里this指向document才可以获取到子应用的document实例，range才可以被成功生成
            const element = rawMicroElementFromPoint.call(rawDocument, x, y);
            const range = rawMicroCaretRangeFromPoint.call(rawDocument, x, y);
            updateElementInfo(element, appName);
            return range;
        };
        microRootDocument.prototype.createElement = function createElement(tagName, options) {
            const element = rawMicroCreateElement.call(this, tagName, options);
            return updateElementInfo(element, appName);
        };
        microRootDocument.prototype.createElementNS = function createElementNS(namespaceURI, name, options) {
            const element = rawMicroCreateElementNS.call(this, namespaceURI, name, options);
            return updateElementInfo(element, appName);
        };
        microRootDocument.prototype.createTextNode = function createTextNode(data) {
            const element = rawMicroCreateTextNode.call(this, data);
            return updateElementInfo(element, appName);
        };
        microRootDocument.prototype.createDocumentFragment = function createDocumentFragment() {
            const element = rawMicroCreateDocumentFragment.call(this);
            return updateElementInfo(element, appName);
        };
        microRootDocument.prototype.createComment = function createComment(data) {
            const element = rawMicroCreateComment.call(this, data);
            return updateElementInfo(element, appName);
        };
        function getDefaultRawTarget(target) {
            return microDocument !== target ? target : rawDocument;
        }
        // query element👇
        function querySelector(selectors) {
            var _a, _b;
            if (!selectors ||
                isUniqueElement(selectors) ||
                microDocument !== this) {
                const _this = getDefaultRawTarget(this);
                return rawMicroQuerySelector.call(_this, selectors);
            }
            return (_b = (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.querySelector(selectors)) !== null && _b !== void 0 ? _b : null;
        }
        function querySelectorAll(selectors) {
            var _a, _b;
            if (!selectors ||
                isUniqueElement(selectors) ||
                microDocument !== this) {
                const _this = getDefaultRawTarget(this);
                return rawMicroQuerySelectorAll.call(_this, selectors);
            }
            return (_b = (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.querySelectorAll(selectors)) !== null && _b !== void 0 ? _b : [];
        }
        microRootDocument.prototype.querySelector = querySelector;
        microRootDocument.prototype.querySelectorAll = querySelectorAll;
        microRootDocument.prototype.getElementById = function getElementById(key) {
            const _this = getDefaultRawTarget(this);
            if (isInvalidQuerySelectorKey(key)) {
                return rawMicroGetElementById.call(_this, key);
            }
            try {
                return querySelector.call(this, `#${key}`);
            }
            catch (_a) {
                return rawMicroGetElementById.call(_this, key);
            }
        };
        microRootDocument.prototype.getElementsByClassName = function getElementsByClassName(key) {
            const _this = getDefaultRawTarget(this);
            if (isInvalidQuerySelectorKey(key)) {
                return rawMicroGetElementsByClassName.call(_this, key);
            }
            try {
                return querySelectorAll.call(this, `.${key}`);
            }
            catch (_a) {
                return rawMicroGetElementsByClassName.call(_this, key);
            }
        };
        microRootDocument.prototype.getElementsByTagName = function getElementsByTagName(key) {
            const _this = getDefaultRawTarget(this);
            if (isUniqueElement(key) ||
                isInvalidQuerySelectorKey(key)) {
                return rawMicroGetElementsByTagName.call(_this, key);
            }
            else if (/^script|base$/i.test(key)) {
                return rawMicroGetElementsByTagName.call(microDocument, key);
            }
            try {
                return querySelectorAll.call(this, key);
            }
            catch (_a) {
                return rawMicroGetElementsByTagName.call(_this, key);
            }
        };
        microRootDocument.prototype.getElementsByName = function getElementsByName(key) {
            const _this = getDefaultRawTarget(this);
            if (isInvalidQuerySelectorKey(key)) {
                return rawMicroGetElementsByName.call(_this, key);
            }
            try {
                return querySelectorAll.call(this, `[name=${key}]`);
            }
            catch (_a) {
                return rawMicroGetElementsByName.call(_this, key);
            }
        };
    }
    function patchDocumentProperty(appName, microAppWindow, sandbox) {
        const rawDocument = globalEnv.rawDocument;
        const microRootDocument = microAppWindow.Document;
        const microDocument = microAppWindow.document;
        const getCommonDescriptor = (key, getter) => {
            const { enumerable } = Object.getOwnPropertyDescriptor(microRootDocument.prototype, key) || {
                enumerable: true,
            };
            return {
                configurable: true,
                enumerable,
                get: getter,
            };
        };
        const createDescriptors = () => {
            const result = {};
            const descList = [
                // if disable-memory-router or router-mode='disable', href point to base app
                ['documentURI', () => sandbox.proxyLocation.href],
                ['URL', () => sandbox.proxyLocation.href],
                ['documentElement', () => rawDocument.documentElement],
                ['scrollingElement', () => rawDocument.scrollingElement],
                ['forms', () => microRootDocument.prototype.querySelectorAll.call(microDocument, 'form')],
                ['images', () => microRootDocument.prototype.querySelectorAll.call(microDocument, 'img')],
                ['links', () => microRootDocument.prototype.querySelectorAll.call(microDocument, 'a')],
                // unique keys of micro-app
                ['microAppElement', () => { var _a; return (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.container; }],
                ['__MICRO_APP_NAME__', () => appName],
            ];
            descList.forEach((desc) => {
                result[desc[0]] = getCommonDescriptor(desc[0], desc[1]);
            });
            // TODO: shadowDOM
            proxy2RawDocOrShadowKeys.forEach((key) => {
                result[key] = getCommonDescriptor(key, () => rawDocument[key]);
            });
            // TODO: shadowDOM
            proxy2RawDocOrShadowMethods.forEach((key) => {
                result[key] = getCommonDescriptor(key, () => bindFunctionToRawTarget(rawDocument[key], rawDocument, 'DOCUMENT'));
            });
            proxy2RawDocumentKeys.forEach((key) => {
                result[key] = getCommonDescriptor(key, () => rawDocument[key]);
            });
            proxy2RawDocumentMethods.forEach((key) => {
                result[key] = getCommonDescriptor(key, () => bindFunctionToRawTarget(rawDocument[key], rawDocument, 'DOCUMENT'));
            });
            return result;
        };
        rawDefineProperties(microRootDocument.prototype, createDescriptors());
        // head, body, html, title
        uniqueDocumentElement.forEach((tagName) => {
            rawDefineProperty(microDocument, tagName, {
                enumerable: true,
                configurable: true,
                get: () => {
                    throttleDeferForSetAppName(appName);
                    return rawDocument[tagName];
                },
                set: (value) => { rawDocument[tagName] = value; },
            });
        });
    }
    function patchDocumentEffect(appName, microAppWindow) {
        const { rawDocument, rawAddEventListener, rawRemoveEventListener } = globalEnv;
        const eventListenerMap = new Map();
        const sstEventListenerMap = new Map();
        let onClickHandler = null;
        let sstOnClickHandler = null;
        const microRootDocument = microAppWindow.Document;
        const microDocument = microAppWindow.document;
        function getEventTarget(type, bindTarget) {
            return SCOPE_DOCUMENT_EVENT.includes(type) ? bindTarget : rawDocument;
        }
        microRootDocument.prototype.addEventListener = function (type, listener, options) {
            const handler = isFunction$1(listener) ? (listener.__MICRO_APP_BOUND_FUNCTION__ = listener.__MICRO_APP_BOUND_FUNCTION__ || listener.bind(this)) : listener;
            const listenerList = eventListenerMap.get(type);
            if (listenerList) {
                listenerList.add(listener);
            }
            else {
                eventListenerMap.set(type, new Set([listener]));
            }
            listener && (listener.__MICRO_APP_MARK_OPTIONS__ = options);
            rawAddEventListener.call(getEventTarget(type, this), type, handler, options);
        };
        microRootDocument.prototype.removeEventListener = function (type, listener, options) {
            const listenerList = eventListenerMap.get(type);
            if ((listenerList === null || listenerList === void 0 ? void 0 : listenerList.size) && listenerList.has(listener)) {
                listenerList.delete(listener);
            }
            const handler = (listener === null || listener === void 0 ? void 0 : listener.__MICRO_APP_BOUND_FUNCTION__) || listener;
            rawRemoveEventListener.call(getEventTarget(type, this), type, handler, options);
        };
        // 重新定义microRootDocument.prototype 上的on开头方法
        function createSetterHandler(eventName) {
            if (eventName === 'onclick') {
                return (value) => {
                    if (isFunction$1(onClickHandler)) {
                        rawRemoveEventListener.call(rawDocument, 'click', onClickHandler, false);
                    }
                    if (isFunction$1(value)) {
                        onClickHandler = value.bind(microDocument);
                        rawAddEventListener.call(rawDocument, 'click', onClickHandler, false);
                    }
                    else {
                        onClickHandler = value;
                    }
                };
            }
            return (value) => { rawDocument[eventName] = isFunction$1(value) ? value.bind(microDocument) : value; };
        }
        /**
         * TODO:
         * 1、直接代理到原生document是否正确
         * 2、shadowDOM
         */
        Object.getOwnPropertyNames(microRootDocument.prototype)
            .filter((key) => /^on/.test(key) && !SCOPE_DOCUMENT_ON_EVENT.includes(key))
            .forEach((eventName) => {
            const { enumerable, writable, set } = Object.getOwnPropertyDescriptor(microRootDocument.prototype, eventName) || {
                enumerable: true,
                writable: true,
            };
            try {
                rawDefineProperty(microRootDocument.prototype, eventName, {
                    enumerable,
                    configurable: true,
                    get: () => {
                        if (eventName === 'onclick')
                            return onClickHandler;
                        return rawDocument[eventName];
                    },
                    set: (writable !== null && writable !== void 0 ? writable : !!set) ? createSetterHandler(eventName) : undefined,
                });
            }
            catch (e) {
                logWarn(e, appName);
            }
        });
        const reset = () => {
            sstEventListenerMap.clear();
            sstOnClickHandler = null;
        };
        /**
         * record event
         * NOTE:
         *  1.record maybe call twice when unmount prerender, keep-alive app manually with umd mode
         * Scenes:
         *  1. exec umdMountHook in umd mode
         *  2. hidden keep-alive app
         *  3. after init prerender app
         */
        const record = () => {
            /**
             * record onclick handler
             * onClickHandler maybe set again after prerender/keep-alive app hidden
             */
            sstOnClickHandler = onClickHandler || sstOnClickHandler;
            // record document event
            eventListenerMap.forEach((listenerList, type) => {
                if (listenerList.size) {
                    const cacheList = sstEventListenerMap.get(type) || [];
                    sstEventListenerMap.set(type, new Set([...cacheList, ...listenerList]));
                }
            });
        };
        // rebuild event and timer before remount app
        const rebuild = () => {
            // rebuild onclick event
            if (sstOnClickHandler && !onClickHandler)
                microDocument.onclick = sstOnClickHandler;
            sstEventListenerMap.forEach((listenerList, type) => {
                for (const listener of listenerList) {
                    microDocument.addEventListener(type, listener, listener === null || listener === void 0 ? void 0 : listener.__MICRO_APP_MARK_OPTIONS__);
                }
            });
            reset();
        };
        const release = () => {
            // Clear the function bound by micro app through document.onclick
            if (isFunction$1(onClickHandler)) {
                rawRemoveEventListener.call(rawDocument, 'click', onClickHandler);
            }
            onClickHandler = null;
            // Clear document binding event
            if (eventListenerMap.size) {
                eventListenerMap.forEach((listenerList, type) => {
                    for (const listener of listenerList) {
                        rawRemoveEventListener.call(getEventTarget(type, microDocument), type, (listener === null || listener === void 0 ? void 0 : listener.__MICRO_APP_BOUND_FUNCTION__) || listener);
                    }
                });
                eventListenerMap.clear();
            }
        };
        return {
            reset,
            record,
            rebuild,
            release,
        };
    }

    /**
     * patch Element & Node of child app
     * @param appName app name
     * @param url app url
     * @param microAppWindow microWindow of child app
     * @param sandbox IframeSandbox
     */
    function patchElement(appName, url, microAppWindow, sandbox) {
        patchIframeNode(appName, microAppWindow, sandbox);
        patchIframeAttribute(url, microAppWindow);
    }
    function patchIframeNode(appName, microAppWindow, sandbox) {
        const rawRootElement = globalEnv.rawRootElement; // native root Element
        const rawDocument = globalEnv.rawDocument;
        const microDocument = microAppWindow.document;
        const microRootNode = microAppWindow.Node;
        const microRootElement = microAppWindow.Element;
        // const rawMicroGetRootNode = microRootNode.prototype.getRootNode
        const rawMicroAppendChild = microRootNode.prototype.appendChild;
        const rawMicroInsertBefore = microRootNode.prototype.insertBefore;
        const rawMicroReplaceChild = microRootNode.prototype.replaceChild;
        const rawMicroRemoveChild = microRootNode.prototype.removeChild;
        const rawMicroAppend = microRootElement.prototype.append;
        const rawMicroPrepend = microRootElement.prototype.prepend;
        const rawMicroInsertAdjacentElement = microRootElement.prototype.insertAdjacentElement;
        const rawMicroCloneNode = microRootNode.prototype.cloneNode;
        const rawInnerHTMLDesc = Object.getOwnPropertyDescriptor(microRootElement.prototype, 'innerHTML');
        const rawParentNodeDesc = Object.getOwnPropertyDescriptor(microRootNode.prototype, 'parentNode');
        const rawOwnerDocumentDesc = Object.getOwnPropertyDescriptor(microRootNode.prototype, 'ownerDocument');
        const isPureNode = (target) => {
            return (isScriptElement(target) || isBaseElement(target)) && target.__PURE_ELEMENT__;
        };
        const getRawTarget = (parent) => {
            if (parent === sandbox.microHead) {
                return rawDocument.head;
            }
            else if (parent === sandbox.microBody) {
                return rawDocument.body;
            }
            return parent;
        };
        microRootNode.prototype.getRootNode = function getRootNode() {
            return microDocument;
            // TODO: 什么情况下返回原生document?
            // const rootNode = rawMicroGetRootNode.call(this, options)
            // if (rootNode === appInstanceMap.get(appName)?.container) return microDocument
            // return rootNode
        };
        microRootNode.prototype.appendChild = function appendChild(node) {
            // TODO: 有必要执行这么多次updateElementInfo？
            updateElementInfo(node, appName);
            if (isPureNode(node)) {
                return rawMicroAppendChild.call(this, node);
            }
            return rawRootElement.prototype.appendChild.call(getRawTarget(this), node);
        };
        microRootNode.prototype.insertBefore = function insertBefore(node, child) {
            updateElementInfo(node, appName);
            if (isPureNode(node)) {
                return rawMicroInsertBefore.call(this, node, child);
            }
            return rawRootElement.prototype.insertBefore.call(getRawTarget(this), node, child);
        };
        microRootNode.prototype.replaceChild = function replaceChild(node, child) {
            updateElementInfo(node, appName);
            if (isPureNode(node)) {
                return rawMicroReplaceChild.call(this, node, child);
            }
            return rawRootElement.prototype.replaceChild.call(getRawTarget(this), node, child);
        };
        microRootNode.prototype.removeChild = function removeChild(oldChild) {
            if (isPureNode(oldChild) || this.contains(oldChild)) {
                return rawMicroRemoveChild.call(this, oldChild);
            }
            return rawRootElement.prototype.removeChild.call(getRawTarget(this), oldChild);
        };
        microRootElement.prototype.append = function append(...nodes) {
            let i = 0;
            let hasPureNode = false;
            while (i < nodes.length) {
                nodes[i] = isNode(nodes[i]) ? nodes[i] : microDocument.createTextNode(nodes[i]);
                if (isPureNode(nodes[i]))
                    hasPureNode = true;
                i++;
            }
            if (hasPureNode) {
                return rawMicroAppend.call(this, ...nodes);
            }
            return rawRootElement.prototype.append.call(getRawTarget(this), ...nodes);
        };
        microRootElement.prototype.prepend = function prepend(...nodes) {
            let i = 0;
            let hasPureNode = false;
            while (i < nodes.length) {
                nodes[i] = isNode(nodes[i]) ? nodes[i] : microDocument.createTextNode(nodes[i]);
                if (isPureNode(nodes[i]))
                    hasPureNode = true;
                i++;
            }
            if (hasPureNode) {
                return rawMicroPrepend.call(this, ...nodes);
            }
            return rawRootElement.prototype.prepend.call(getRawTarget(this), ...nodes);
        };
        /**
         * The insertAdjacentElement method of the Element interface inserts a given element node at a given position relative to the element it is invoked upon.
         * Scenes:
         *  1. vite4 development env for style
         */
        microRootElement.prototype.insertAdjacentElement = function insertAdjacentElement(where, element) {
            updateElementInfo(element, appName);
            if (isPureNode(element)) {
                return rawMicroInsertAdjacentElement.call(this, where, element);
            }
            return rawRootElement.prototype.insertAdjacentElement.call(getRawTarget(this), where, element);
        };
        // patch cloneNode
        microRootNode.prototype.cloneNode = function cloneNode(deep) {
            const clonedNode = rawMicroCloneNode.call(this, deep);
            return updateElementInfo(clonedNode, appName);
        };
        rawDefineProperty(microRootNode.prototype, 'ownerDocument', {
            configurable: true,
            enumerable: true,
            get() {
                return this.__PURE_ELEMENT__
                    ? rawOwnerDocumentDesc.get.call(this)
                    : microDocument;
            },
        });
        rawDefineProperty(microRootElement.prototype, 'innerHTML', {
            configurable: true,
            enumerable: true,
            get() {
                return rawInnerHTMLDesc.get.call(this);
            },
            set(code) {
                rawInnerHTMLDesc.set.call(this, code);
                Array.from(this.children).forEach((child) => {
                    if (isElement(child)) {
                        updateElementInfo(child, appName);
                    }
                });
            }
        });
        // patch parentNode
        rawDefineProperty(microRootNode.prototype, 'parentNode', {
            configurable: true,
            enumerable: true,
            get() {
                var _a, _b, _c;
                /**
                 * set current appName for hijack parentNode of html
                 * NOTE:
                 *  1. Is there a problem with setting the current appName in iframe mode
                 */
                throttleDeferForSetAppName(appName);
                const result = rawParentNodeDesc.get.call(this);
                /**
                  * If parentNode is <micro-app-body>, return rawDocument.body
                  * Scenes:
                  *  1. element-ui@2/lib/utils/vue-popper.js
                  *    if (this.popperElm.parentNode === document.body) ...
                  * WARNING:
                  *  Will it cause other problems ?
                  *  e.g. target.parentNode.remove(target)
                  */
                if (isMicroAppBody(result) && ((_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.container)) {
                    return ((_c = (_b = microApp.options).getRootElementParentNode) === null || _c === void 0 ? void 0 : _c.call(_b, this, appName)) || globalEnv.rawDocument.body;
                }
                return result;
            }
        });
        // Adapt to new image(...) scene
        const ImageProxy = new Proxy(microAppWindow.Image, {
            construct(Target, args) {
                const elementImage = new Target(...args);
                updateElementInfo(elementImage, appName);
                return elementImage;
            },
        });
        rawDefineProperty(microAppWindow, 'Image', {
            configurable: true,
            writable: true,
            value: ImageProxy,
        });
    }
    function patchIframeAttribute(url, microAppWindow) {
        const microRootElement = microAppWindow.Element;
        const rawMicroSetAttribute = microRootElement.prototype.setAttribute;
        microRootElement.prototype.setAttribute = function setAttribute(key, value) {
            if (((key === 'src' || key === 'srcset') && /^(img|script)$/i.test(this.tagName)) ||
                (key === 'href' && /^link$/i.test(this.tagName))) {
                value = CompletionPath(value, url);
            }
            rawMicroSetAttribute.call(this, key, value);
        };
        const protoAttrList = [
            [microAppWindow.HTMLImageElement.prototype, 'src'],
            [microAppWindow.HTMLScriptElement.prototype, 'src'],
            [microAppWindow.HTMLLinkElement.prototype, 'href'],
        ];
        /**
         * element.setAttribute does not trigger this actions:
         *  1. img.src = xxx
         *  2. script.src = xxx
         *  3. link.href = xxx
         */
        protoAttrList.forEach(([target, attr]) => {
            const { enumerable, configurable, get, set } = Object.getOwnPropertyDescriptor(target, attr) || {
                enumerable: true,
                configurable: true,
            };
            rawDefineProperty(target, attr, {
                enumerable,
                configurable,
                get: function () {
                    return get === null || get === void 0 ? void 0 : get.call(this);
                },
                set: function (value) {
                    set === null || set === void 0 ? void 0 : set.call(this, CompletionPath(value, url));
                },
            });
        });
    }

    class IframeSandbox {
        constructor(appName, url) {
            this.active = false;
            // Properties that can be escape to rawWindow
            this.escapeProperties = [];
            // Properties escape to rawWindow, cleared when unmount
            this.escapeKeys = new Set();
            // 初始化和每次跳转时都要更新base的href
            this.updateIframeBase = () => {
                var _a;
                // origin must be child app origin
                (_a = this.baseElement) === null || _a === void 0 ? void 0 : _a.setAttribute('href', createURL(this.url).origin + this.proxyLocation.pathname);
            };
            this.appName = appName;
            this.url = url;
            const rawLocation = globalEnv.rawWindow.location;
            const browserHost = rawLocation.protocol + '//' + rawLocation.host;
            this.deleteIframeElement = this.createIframeElement(appName, browserHost + rawLocation.pathname);
            this.microAppWindow = this.iframe.contentWindow;
            this.patchIframe(this.microAppWindow, (resolve) => {
                // create new html to iframe
                this.createIframeTemplate(this.microAppWindow);
                // get escapeProperties from plugins
                this.getSpecialProperties(appName);
                // patch location & history of child app
                this.proxyLocation = patchRouter(appName, url, this.microAppWindow, browserHost);
                // patch window of child app
                this.windowEffect = patchWindow$1(appName, this.microAppWindow, this);
                // patch document of child app
                this.documentEffect = patchDocument$1(appName, this.microAppWindow, this);
                // patch Node & Element of child app
                patchElement(appName, url, this.microAppWindow, this);
                /**
                 * create static properties
                 * NOTE:
                 *  1. execute as early as possible
                 *  2. run after patchRouter & createProxyWindow
                 */
                this.initStaticGlobalKeys(appName, url, this.microAppWindow);
                resolve();
            });
        }
        /**
         * create iframe for sandbox
         * @param appName app name
         * @param browserPath browser origin
         * @returns release callback
         */
        createIframeElement(appName, browserPath) {
            this.iframe = pureCreateElement('iframe');
            const iframeAttrs = {
                src: microApp.options.iframeSrc || browserPath,
                style: 'display: none',
                id: appName,
            };
            Object.keys(iframeAttrs).forEach((key) => this.iframe.setAttribute(key, iframeAttrs[key]));
            // effect action during construct
            globalEnv.rawDocument.body.appendChild(this.iframe);
            /**
             * If dom operated async when unmount, premature deletion of iframe will cause unexpected problems
             * e.g.
             *  1. antd: notification.destroy()
             * WARNING:
             *  If async operation time is too long, defer cannot avoid the problem
             * TODO: more test
             */
            return () => defer(() => {
                var _a, _b;
                // default mode or destroy, iframe will be deleted when unmount
                (_b = (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(this.iframe);
                this.iframe = null;
            });
        }
        start({ baseroute, defaultPage, disablePatchRequest, }) {
            if (this.active)
                return;
            this.active = true;
            /* --- memory router part --- start */
            /**
             * Sync router info to iframe when exec sandbox.start with disable or enable memory-router
             * e.g.:
             *  vue-router@4.x get target path by remove the base section from rawLocation.pathname
             *  code: window.location.pathname.slice(base.length) || '/'; (base is baseroute)
             * NOTE:
             *  1. iframe router and browser router are separated, we should update iframe router manually
             *  2. withSandbox location is browser location when disable memory-router, so no need to do anything
             */
            /**
             * TODO:
             * 1. iframe关闭虚拟路由系统后，default-page无法使用，推荐用户直接使用浏览器地址控制首页渲染
             *    补充：keep-router-state 也无法配置，因为keep-router-state一定为true。
             * 2. 导航拦截、current.route 可以正常使用
             * 3. 可以正常控制子应用跳转，方式还是自上而下(也可以是子应用内部跳转，这种方式更好一点，减小对基座的影响，不会导致vue的循环刷新)
             * 4. 关闭虚拟路由以后会对应 route-mode='custom' 模式，包括with沙箱也会这么做
             * 5. 关闭虚拟路由是指尽可能模拟没有虚拟路由的情况，子应用直接获取浏览器location和history，控制浏览器跳转
             */
            this.initRouteState(defaultPage);
            // unique listener of popstate event for child app
            this.removeHistoryListener = addHistoryListener(this.microAppWindow.__MICRO_APP_NAME__);
            if (isRouterModeCustom(this.microAppWindow.__MICRO_APP_NAME__)) {
                this.microAppWindow.__MICRO_APP_BASE_ROUTE__ = this.microAppWindow.__MICRO_APP_BASE_URL__ = baseroute;
            }
            /* --- memory router part --- end */
            /**
             * create base element to iframe
             * WARNING: This will also affect a, image, link and script
             */
            if (!disablePatchRequest) {
                this.createIframeBase();
            }
            if (++globalEnv.activeSandbox === 1) {
                patchElementAndDocument();
                patchHistory();
            }
            if (++IframeSandbox.activeCount === 1) ;
        }
        stop({ umdMode, keepRouteState, destroy, clearData, }) {
            var _a;
            if (!this.active)
                return;
            this.recordAndReleaseEffect({ clearData }, !umdMode || destroy);
            /* --- memory router part --- start */
            // if keep-route-state is true, preserve microLocation state
            this.clearRouteState(keepRouteState);
            // release listener of popstate for child app
            (_a = this.removeHistoryListener) === null || _a === void 0 ? void 0 : _a.call(this);
            /* --- memory router part --- end */
            if (!umdMode || destroy) {
                this.deleteIframeElement();
                this.escapeKeys.forEach((key) => {
                    Reflect.deleteProperty(globalEnv.rawWindow, key);
                });
                this.escapeKeys.clear();
            }
            if (--globalEnv.activeSandbox === 0) {
                releasePatchElementAndDocument();
                releasePatchHistory();
            }
            if (--IframeSandbox.activeCount === 0) ;
            this.active = false;
        }
        /**
         * create static properties
         * NOTE:
         *  1. execute as early as possible
         *  2. run after patchRouter & createProxyWindow
         * TODO: 设置为只读变量
         */
        initStaticGlobalKeys(appName, url, microAppWindow) {
            microAppWindow.__MICRO_APP_ENVIRONMENT__ = true;
            microAppWindow.__MICRO_APP_NAME__ = appName;
            microAppWindow.__MICRO_APP_URL__ = url;
            microAppWindow.__MICRO_APP_PUBLIC_PATH__ = getEffectivePath(url);
            microAppWindow.__MICRO_APP_BASE_ROUTE__ = '';
            microAppWindow.__MICRO_APP_WINDOW__ = microAppWindow;
            microAppWindow.__MICRO_APP_PRE_RENDER__ = false;
            microAppWindow.__MICRO_APP_UMD_MODE__ = false;
            microAppWindow.__MICRO_APP_PROXY_WINDOW__ = this.proxyWindow;
            microAppWindow.__MICRO_APP_SANDBOX__ = this;
            microAppWindow.__MICRO_APP_SANDBOX_TYPE__ = 'iframe';
            microAppWindow.rawWindow = globalEnv.rawWindow;
            microAppWindow.rawDocument = globalEnv.rawDocument;
            microAppWindow.microApp = assign(new EventCenterForMicroApp(appName), {
                removeDomScope,
                pureCreateElement,
                location: this.proxyLocation,
                router,
            });
        }
        /**
         * Record global effect and then release (effect: global event, timeout, data listener)
         * Scenes:
         * 1. unmount of default/umd app
         * 2. hidden keep-alive app
         * 3. after init prerender app
         * @param options {
         *  @param clearData clear data from base app
         *  @param isPrerender is prerender app
         *  @param keepAlive is keep-alive app
         * }
         * @param preventRecord prevent record effect events (default or destroy)
         */
        recordAndReleaseEffect(options, preventRecord = false) {
            if (preventRecord) {
                this.resetEffectSnapshot();
            }
            else {
                this.recordEffectSnapshot();
            }
            this.releaseGlobalEffect(options);
        }
        /**
         * reset effect snapshot data in default mode or destroy
         * Scenes:
         *  1. unmount hidden keep-alive app manually
         *  2. unmount prerender app manually
         */
        resetEffectSnapshot() {
            var _a, _b;
            (_a = this.windowEffect) === null || _a === void 0 ? void 0 : _a.reset();
            (_b = this.documentEffect) === null || _b === void 0 ? void 0 : _b.reset();
            resetDataCenterSnapshot(this.microAppWindow.microApp);
        }
        /**
         * record umd snapshot before the first execution of umdHookMount
         * Scenes:
         * 1. exec umdMountHook in umd mode
         * 2. hidden keep-alive app
         * 3. after init prerender app
         */
        recordEffectSnapshot() {
            var _a, _b;
            (_a = this.windowEffect) === null || _a === void 0 ? void 0 : _a.record();
            (_b = this.documentEffect) === null || _b === void 0 ? void 0 : _b.record();
            recordDataCenterSnapshot(this.microAppWindow.microApp);
        }
        // rebuild umd snapshot before remount umd app
        rebuildEffectSnapshot() {
            var _a, _b;
            (_a = this.windowEffect) === null || _a === void 0 ? void 0 : _a.rebuild();
            (_b = this.documentEffect) === null || _b === void 0 ? void 0 : _b.rebuild();
            rebuildDataCenterSnapshot(this.microAppWindow.microApp);
        }
        /**
         * clear global event, timeout, data listener
         * Scenes:
         * 1. unmount of normal/umd app
         * 2. hidden keep-alive app
         * 3. after init prerender app
         * @param clearData clear data from base app
         * @param isPrerender is prerender app
         * @param keepAlive is keep-alive app
         */
        releaseGlobalEffect({ clearData = false }) {
            var _a, _b, _c, _d, _e;
            (_a = this.windowEffect) === null || _a === void 0 ? void 0 : _a.release();
            (_b = this.documentEffect) === null || _b === void 0 ? void 0 : _b.release();
            (_c = this.microAppWindow.microApp) === null || _c === void 0 ? void 0 : _c.clearDataListener();
            (_d = this.microAppWindow.microApp) === null || _d === void 0 ? void 0 : _d.clearGlobalDataListener();
            if (clearData) {
                microApp.clearData(this.microAppWindow.__MICRO_APP_NAME__);
                (_e = this.microAppWindow.microApp) === null || _e === void 0 ? void 0 : _e.clearData();
            }
        }
        // set __MICRO_APP_PRE_RENDER__ state
        setPreRenderState(state) {
            this.microAppWindow.__MICRO_APP_PRE_RENDER__ = state;
        }
        // record umdMode
        markUmdMode(state) {
            this.microAppWindow.__MICRO_APP_UMD_MODE__ = state;
        }
        // TODO: RESTRUCTURE
        patchIframe(microAppWindow, cb) {
            const oldMicroDocument = microAppWindow.document;
            this.sandboxReady = new Promise((resolve) => {
                (function iframeLocationReady() {
                    setTimeout(() => {
                        try {
                            /**
                             * NOTE:
                             *  1. In browser, iframe document will be recreated after iframe initial
                             *  2. In jest, iframe document is always the same
                             */
                            if (microAppWindow.document === oldMicroDocument && !false) {
                                iframeLocationReady();
                            }
                            else {
                                /**
                                 * NOTE:
                                 *  1. microAppWindow will not be recreated
                                 *  2. the properties of microAppWindow may be recreated, such as document
                                 *  3. the variables added to microAppWindow may be cleared
                                 */
                                microAppWindow.stop();
                                cb(resolve);
                            }
                        }
                        catch (e) {
                            iframeLocationReady();
                        }
                    }, 0);
                })();
            });
        }
        // TODO: RESTRUCTURE
        createIframeTemplate(microAppWindow) {
            const microDocument = microAppWindow.document;
            clearDOM(microDocument);
            const html = microDocument.createElement('html');
            html.innerHTML = '<head></head><body></body>';
            microDocument.appendChild(html);
            // 记录iframe原生body
            this.microBody = microDocument.body;
            this.microHead = microDocument.head;
        }
        /**
         * baseElement will complete the relative address of element according to the URL
         * e.g: a image link script fetch ajax EventSource
         */
        createIframeBase() {
            this.baseElement = pureCreateElement('base');
            this.updateIframeBase();
            this.microHead.appendChild(this.baseElement);
        }
        /**
         * get escapeProperties from plugins & adapter
         * @param appName app name
         */
        getSpecialProperties(appName) {
            var _a;
            if (isPlainObject$1(microApp.options.plugins)) {
                this.commonActionForSpecialProperties(microApp.options.plugins.global);
                this.commonActionForSpecialProperties((_a = microApp.options.plugins.modules) === null || _a === void 0 ? void 0 : _a[appName]);
            }
        }
        // common action for global plugins and module plugins
        commonActionForSpecialProperties(plugins) {
            if (isArray$1(plugins)) {
                for (const plugin of plugins) {
                    if (isPlainObject$1(plugin)) {
                        if (isArray$1(plugin.escapeProperties)) {
                            this.escapeProperties = this.escapeProperties.concat(plugin.escapeProperties);
                        }
                    }
                }
            }
        }
        initRouteState(defaultPage) {
            initRouteStateWithURL(this.microAppWindow.__MICRO_APP_NAME__, this.microAppWindow.location, defaultPage);
        }
        clearRouteState(keepRouteState) {
            clearRouteStateFromURL(this.microAppWindow.__MICRO_APP_NAME__, this.microAppWindow.__MICRO_APP_URL__, this.microAppWindow.location, keepRouteState);
        }
        setRouteInfoForKeepAliveApp() {
            updateBrowserURLWithLocation(this.microAppWindow.__MICRO_APP_NAME__, this.microAppWindow.location);
        }
        removeRouteInfoForKeepAliveApp() {
            removePathFromBrowser(this.microAppWindow.__MICRO_APP_NAME__);
        }
        /**
         * Format all html elements when init
         * @param container micro app container
         */
        patchStaticElement(container) {
            patchElementTree(container, this.microAppWindow.__MICRO_APP_NAME__);
        }
        /**
         * action before exec scripts when mount
         * Actions:
         * 1. patch static elements from html
         * @param container micro app container
         */
        actionBeforeExecScripts(container) {
            this.patchStaticElement(container);
        }
        setStaticAppState(state) {
            this.microAppWindow.__MICRO_APP_STATE__ = state;
        }
    }
    IframeSandbox.activeCount = 0; // number of active sandbox

    // micro app instances
    const appInstanceMap = new Map();
    class CreateApp {
        constructor({ name, url, container, scopecss, useSandbox, inline, iframe, ssrUrl, isPrefetch, prefetchLevel, routerMode, }) {
            this.state = appStates.CREATED;
            this.keepAliveState = null;
            this.loadSourceLevel = 0;
            this.umdHookMount = null;
            this.umdHookUnmount = null;
            this.lifeCycleState = null;
            this.umdMode = false;
            // TODO: 类型优化，加上iframe沙箱
            this.sandBox = null;
            this.fiber = false;
            appInstanceMap.set(name, this);
            // init actions
            this.name = name;
            this.url = url;
            this.useSandbox = useSandbox;
            this.scopecss = this.useSandbox && scopecss;
            // exec before getInlineModeState
            this.iframe = iframe !== null && iframe !== void 0 ? iframe : false;
            this.inline = this.getInlineModeState(inline);
            /**
             * NOTE:
             *  1. Navigate after micro-app created, before mount
             */
            this.routerMode = routerMode || DEFAULT_ROUTER_MODE;
            // not exist when prefetch 👇
            this.container = container !== null && container !== void 0 ? container : null;
            this.ssrUrl = ssrUrl !== null && ssrUrl !== void 0 ? ssrUrl : '';
            // exist only prefetch 👇
            this.isPrefetch = isPrefetch !== null && isPrefetch !== void 0 ? isPrefetch : false;
            this.isPrerender = prefetchLevel === 3;
            this.prefetchLevel = prefetchLevel;
            this.source = { html: null, links: new Set(), scripts: new Set() };
            this.loadSourceCode();
            this.createSandbox();
        }
        // Load resources
        loadSourceCode() {
            this.setAppState(appStates.LOADING);
            HTMLLoader.getInstance().run(this, extractSourceDom);
        }
        /**
         * When resource is loaded, mount app if it is not prefetch or unmount
         * defaultPage disablePatchRequest routerMode baseroute is only for prerender app
         */
        onLoad({ html, 
        // below params is only for prerender app
        defaultPage, routerMode, baseroute, disablePatchRequest, }) {
            var _a;
            if (++this.loadSourceLevel === 2) {
                this.source.html = html;
                if (!this.isPrefetch && !this.isUnmounted()) {
                    getRootContainer(this.container).mount(this);
                }
                else if (this.isPrerender) {
                    /**
                     * PreRender is an option of prefetch, it will render app during prefetch
                     * Limit:
                     * 1. fiber forced on
                     * 2. only virtual router support
                     *
                     * NOTE: (Don't update browser url, dispatch popstateEvent, reload window, dispatch lifecycle event)
                     * 1. pushState/replaceState in child can update microLocation, but will not attach router info to browser url
                     * 2. prevent dispatch popstate/hashchange event to browser
                     * 3. all navigation actions of location are invalid (In the future, we can consider update microLocation without trigger browser reload)
                     * 4. lifecycle event will not trigger when prerender
                     *
                     * Special scenes
                     * 1. unmount prerender app when loading
                     * 2. unmount prerender app when exec js
                     * 2. unmount prerender app after exec js
                     */
                    const container = pureCreateElement('div');
                    container.setAttribute('prerender', 'true');
                    (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.setPreRenderState(true);
                    this.mount({
                        container,
                        inline: this.inline,
                        fiber: true,
                        defaultPage: defaultPage || '',
                        disablePatchRequest: disablePatchRequest !== null && disablePatchRequest !== void 0 ? disablePatchRequest : false,
                        routerMode: routerMode,
                        baseroute: baseroute || '',
                    });
                }
            }
        }
        /**
         * Error loading HTML
         * @param e Error
         */
        onLoadError(e) {
            this.loadSourceLevel = -1;
            if (!this.isUnmounted()) {
                this.onerror(e);
                this.setAppState(appStates.LOAD_FAILED);
            }
        }
        /**
         * mount app
         * @param container app container
         * @param inline run js in inline mode
         * @param routerMode virtual router mode
         * @param defaultPage default page of virtual router
         * @param baseroute route prefix, default is ''
         * @param disablePatchRequest prevent rewrite request method of child app
         * @param fiber run js in fiber mode
         */
        mount({ container, inline, routerMode, defaultPage, baseroute, disablePatchRequest, fiber, }) {
            if (this.loadSourceLevel !== 2) {
                /**
                 * container cannot be null when load end
                 * NOTE:
                 *  1. render prefetch app before load end
                 *  2. unmount prefetch app and mount again before load end
                 */
                this.container = container;
                // mount before prerender exec mount (loading source), set isPrerender to false
                this.isPrerender = false;
                // dispatch state event to micro app
                dispatchCustomEventToMicroApp(this, 'statechange', {
                    appState: appStates.LOADING
                });
                // reset app state to LOADING
                return this.setAppState(appStates.LOADING);
            }
            this.createSandbox();
            // place outside of nextAction, as nextAction may execute async
            this.setAppState(appStates.BEFORE_MOUNT);
            const nextAction = () => {
                var _a, _b, _c, _d, _e, _f, _g;
                /**
                 * Special scenes:
                 * 1. mount before prerender exec mount (loading source)
                 * 2. mount when prerender js executing
                 * 3. mount after prerender js exec end
                 * 4. mount after prerender unmounted
                 *
                 * TODO: test shadowDOM
                 */
                if (this.isPrerender &&
                    isDivElement(this.container) &&
                    this.container.hasAttribute('prerender')) {
                    /**
                     * rebuild effect event of window, document, data center
                     * explain:
                     * 1. rebuild before exec mount, do nothing
                     * 2. rebuild when js executing, recovery recorded effect event, because prerender fiber mode
                     * 3. rebuild after js exec end, normal recovery effect event
                     */
                    (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.rebuildEffectSnapshot();
                    // current this.container is <div prerender='true'></div>
                    this.cloneContainer(container, this.container, false);
                    /**
                     * set this.container to <micro-app></micro-app>
                     * NOTE:
                     * must exec before this.preRenderEvents?.forEach((cb) => cb())
                     */
                    this.container = container;
                    (_b = this.preRenderEvents) === null || _b === void 0 ? void 0 : _b.forEach((cb) => cb());
                    // reset isPrerender config
                    this.isPrerender = false;
                    this.preRenderEvents = null;
                    // attach router info to browser url
                    router.attachToURL(this.name);
                    (_c = this.sandBox) === null || _c === void 0 ? void 0 : _c.setPreRenderState(false);
                }
                else {
                    this.container = container;
                    this.inline = this.getInlineModeState(inline);
                    this.fiber = fiber;
                    this.routerMode = routerMode;
                    const dispatchBeforeMount = () => {
                        this.setLifeCycleState(lifeCycles.BEFOREMOUNT);
                        dispatchLifecyclesEvent(this.container, this.name, lifeCycles.BEFOREMOUNT);
                    };
                    if (this.isPrerender) {
                        ((_d = this.preRenderEvents) !== null && _d !== void 0 ? _d : (this.preRenderEvents = [])).push(dispatchBeforeMount);
                    }
                    else {
                        dispatchBeforeMount();
                    }
                    this.setAppState(appStates.MOUNTING);
                    // dispatch state event to micro app
                    dispatchCustomEventToMicroApp(this, 'statechange', {
                        appState: appStates.MOUNTING
                    });
                    // TODO: 将所有cloneContainer中的'as Element'去掉，兼容shadowRoot的场景
                    this.cloneContainer(this.container, this.source.html, !this.umdMode);
                    (_e = this.sandBox) === null || _e === void 0 ? void 0 : _e.start({
                        umdMode: this.umdMode,
                        baseroute,
                        defaultPage,
                        disablePatchRequest,
                    });
                    if (!this.umdMode) {
                        // update element info of html
                        (_f = this.sandBox) === null || _f === void 0 ? void 0 : _f.actionBeforeExecScripts(this.container);
                        // if all js are executed, param isFinished will be true
                        execScripts(this, (isFinished) => {
                            if (!this.umdMode) {
                                const { mount, unmount } = this.getUmdLibraryHooks();
                                /**
                                 * umdHookUnmount can works in default mode
                                 * register through window.unmount
                                 */
                                // TODO: 不对，这里要改，因为unmount不一定是函数
                                this.umdHookUnmount = unmount;
                                // if mount & unmount is function, the sub app is umd mode
                                if (isFunction$1(mount) && isFunction$1(unmount)) {
                                    this.umdHookMount = mount;
                                    // sandbox must exist
                                    this.sandBox.markUmdMode(this.umdMode = true);
                                    try {
                                        this.handleMounted(this.umdHookMount(microApp.getData(this.name, true)));
                                    }
                                    catch (e) {
                                        /**
                                         * TODO:
                                         *  1. 是否应该直接抛出错误
                                         *  2. 是否应该触发error生命周期
                                         */
                                        logError('An error occurred in window.mount \n', this.name, e);
                                    }
                                }
                                else if (isFinished === true) {
                                    this.handleMounted();
                                }
                            }
                        });
                    }
                    else {
                        (_g = this.sandBox) === null || _g === void 0 ? void 0 : _g.rebuildEffectSnapshot();
                        try {
                            this.handleMounted(this.umdHookMount(microApp.getData(this.name, true)));
                        }
                        catch (e) {
                            logError('An error occurred in window.mount \n', this.name, e);
                        }
                    }
                }
            };
            // TODO: 可优化？
            this.sandBox ? this.sandBox.sandboxReady.then(nextAction) : nextAction();
        }
        /**
         * handle for promise umdHookMount
         * @param umdHookMountResult result of umdHookMount
         */
        handleMounted(umdHookMountResult) {
            var _a, _b;
            const dispatchAction = () => {
                if (isPromise(umdHookMountResult)) {
                    umdHookMountResult
                        .then(() => this.dispatchMountedEvent())
                        .catch((e) => {
                        logError('An error occurred in window.mount \n', this.name, e);
                        this.dispatchMountedEvent();
                    });
                }
                else {
                    this.dispatchMountedEvent();
                }
            };
            if (this.isPrerender) {
                (_a = this.preRenderEvents) === null || _a === void 0 ? void 0 : _a.push(dispatchAction);
                (_b = this.sandBox) === null || _b === void 0 ? void 0 : _b.recordAndReleaseEffect({ isPrerender: true });
            }
            else {
                dispatchAction();
            }
        }
        /**
         * dispatch mounted event when app run finished
         */
        dispatchMountedEvent() {
            var _a;
            if (!this.isUnmounted()) {
                this.setAppState(appStates.MOUNTED);
                // call window.onmount of child app
                execMicroAppGlobalHook(this.getMicroAppGlobalHook(microGlobalEvent.ONMOUNT), this.name, microGlobalEvent.ONMOUNT, microApp.getData(this.name, true));
                // dispatch state event to micro app
                dispatchCustomEventToMicroApp(this, 'statechange', {
                    appState: appStates.MOUNTED
                });
                // dispatch mounted event to micro app
                dispatchCustomEventToMicroApp(this, 'mounted');
                this.setLifeCycleState(lifeCycles.MOUNTED);
                // dispatch event mounted to parent
                dispatchLifecyclesEvent(this.container, this.name, lifeCycles.MOUNTED);
                /**
                 * Hidden Keep-alive app during resource loading, render normally to ensure their liveliness (running in the background) characteristics.
                 * Actions:
                 *  1. Record & release all global events after mount
                 */
                if (this.isHidden()) {
                    (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.recordAndReleaseEffect({ keepAlive: true });
                }
            }
            /**
             * TODO: 这里增加一个处理，如果渲染完成时已经卸载，则进行一些操作
             * 如果是默认模式：删除所有事件和定时器
             * 如果是umd模式：重新记录和清空事件
             * 补充：非必需，优先级低
             */
        }
        /**
         * unmount app
         * NOTE:
         *  1. do not add any params on account of unmountApp
         * @param destroy completely destroy, delete cache resources
         * @param clearData clear data of dateCenter
         * @param keepRouteState keep route state when unmount, default is false
         * @param unmountcb callback of unmount
         */
        unmount({ destroy, clearData, keepRouteState, unmountcb, }) {
            var _a;
            destroy = destroy || this.state === appStates.LOAD_FAILED;
            this.setAppState(appStates.UNMOUNT);
            let umdHookUnmountResult = null;
            try {
                // call umd unmount hook before the sandbox is cleared
                umdHookUnmountResult = (_a = this.umdHookUnmount) === null || _a === void 0 ? void 0 : _a.call(this, microApp.getData(this.name, true));
            }
            catch (e) {
                logError('An error occurred in window.unmount \n', this.name, e);
            }
            // dispatch state event to micro app
            dispatchCustomEventToMicroApp(this, 'statechange', {
                appState: appStates.UNMOUNT
            });
            // dispatch unmount event to micro app
            dispatchCustomEventToMicroApp(this, 'unmount');
            // call window.onunmount of child app
            execMicroAppGlobalHook(this.getMicroAppGlobalHook(microGlobalEvent.ONUNMOUNT), this.name, microGlobalEvent.ONUNMOUNT);
            this.handleUnmounted({
                destroy,
                clearData,
                keepRouteState,
                unmountcb,
                umdHookUnmountResult,
            });
        }
        /**
         * handle for promise umdHookUnmount
         * @param destroy completely destroy, delete cache resources
         * @param clearData clear data of dateCenter
         * @param keepRouteState keep route state when unmount, default is false
         * @param unmountcb callback of unmount
         * @param umdHookUnmountResult result of umdHookUnmount
         */
        handleUnmounted({ destroy, clearData, keepRouteState, unmountcb, umdHookUnmountResult, }) {
            const nextAction = () => this.actionsForUnmount({
                destroy,
                clearData,
                keepRouteState,
                unmountcb,
            });
            if (isPromise(umdHookUnmountResult)) {
                // async window.unmount will cause appName bind error in nest app
                removeDomScope();
                umdHookUnmountResult.then(nextAction).catch(nextAction);
            }
            else {
                nextAction();
            }
        }
        /**
         * actions for unmount app
         * @param destroy completely destroy, delete cache resources
         * @param clearData clear data of dateCenter
         * @param keepRouteState keep route state when unmount, default is false
         * @param unmountcb callback of unmount
         */
        actionsForUnmount({ destroy, clearData, keepRouteState, unmountcb, }) {
            var _a;
            if (this.umdMode && this.container && !destroy) {
                this.cloneContainer(this.source.html, this.container, false);
            }
            /**
             * this.container maybe contains micro-app element, stop sandbox should exec after cloneContainer
             * NOTE:
             * 1. if destroy is true, clear route state
             * 2. umd mode and keep-alive will not clear EventSource
             */
            (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.stop({
                umdMode: this.umdMode,
                keepRouteState: keepRouteState && !destroy,
                destroy,
                clearData: clearData || destroy,
            });
            this.setLifeCycleState(lifeCycles.UNMOUNT);
            // dispatch unmount event to base app
            dispatchLifecyclesEvent(this.container, this.name, lifeCycles.UNMOUNT);
            this.clearOptions(destroy);
            unmountcb === null || unmountcb === void 0 ? void 0 : unmountcb();
        }
        clearOptions(destroy) {
            this.container.innerHTML = '';
            this.container = null;
            this.isPrerender = false;
            this.preRenderEvents = null;
            this.setKeepAliveState(null);
            // in iframe sandbox & default mode, delete the sandbox & iframeElement
            // TODO: with沙箱与iframe沙箱保持一致：with沙箱默认模式下删除 或者 iframe沙箱umd模式下保留
            if (this.iframe && !this.umdMode)
                this.sandBox = null;
            if (destroy)
                this.actionsForCompletelyDestroy();
            removeDomScope();
        }
        // actions for completely destroy
        actionsForCompletelyDestroy() {
            var _a, _b;
            (_b = (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.deleteIframeElement) === null || _b === void 0 ? void 0 : _b.call(_a);
            sourceCenter.script.deleteInlineInfo(this.source.scripts);
            appInstanceMap.delete(this.name);
        }
        // hidden app when disconnectedCallback called with keep-alive
        hiddenKeepAliveApp(callback) {
            var _a, _b;
            this.setKeepAliveState(keepAliveStates.KEEP_ALIVE_HIDDEN);
            /**
             * afterhidden事件需要提前发送，原因如下：
             *  1. 此时发送this.container还指向micro-app元素，而不是临时div元素
             *  2. 沙箱执行recordAndReleaseEffect后会将appstate-change方法也清空，之后再发送子应用也接受不到了
             *  3. 对于this.loadSourceLevel !== 2的情况，unmount是同步执行的，所以也会出现2的问题
             * TODO: 有可能导致的问题
             *  1. 在基座接受到afterhidden方法后立即执行unmount，彻底destroy应用时，因为unmount时同步执行，所以this.container为null后才执行cloneContainer
             */
            dispatchCustomEventToMicroApp(this, 'appstate-change', {
                appState: 'afterhidden',
            });
            this.setLifeCycleState(lifeCycles.AFTERHIDDEN);
            // dispatch afterHidden event to base app
            dispatchLifecyclesEvent(this.container, this.name, lifeCycles.AFTERHIDDEN);
            if (isRouterModeSearch(this.name)) {
                // called after lifeCyclesEvent
                (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.removeRouteInfoForKeepAliveApp();
            }
            /**
             * Hidden app before the resources are loaded, then unmount the app
             */
            if (this.loadSourceLevel !== 2) {
                getRootContainer(this.container).unmount();
            }
            else {
                this.container = this.cloneContainer(pureCreateElement('div'), this.container, false);
                (_b = this.sandBox) === null || _b === void 0 ? void 0 : _b.recordAndReleaseEffect({ keepAlive: true });
            }
            callback === null || callback === void 0 ? void 0 : callback();
        }
        // show app when connectedCallback called with keep-alive
        showKeepAliveApp(container) {
            var _a, _b;
            (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.rebuildEffectSnapshot();
            // dispatch beforeShow event to micro-app
            dispatchCustomEventToMicroApp(this, 'appstate-change', {
                appState: 'beforeshow',
            });
            // dispatch beforeShow event to base app
            dispatchLifecyclesEvent(container, this.name, lifeCycles.BEFORESHOW);
            this.setKeepAliveState(keepAliveStates.KEEP_ALIVE_SHOW);
            this.container = this.cloneContainer(container, this.container, false);
            /**
             * TODO:
             *  问题：当路由模式为custom时，keep-alive应用在重新展示，是否需要根据子应用location信息更新浏览器地址？
             *  暂时不这么做吧，因为无法确定二次展示时新旧地址是否相同，是否带有特殊信息
             */
            if (isRouterModeSearch(this.name)) {
                // called before lifeCyclesEvent
                (_b = this.sandBox) === null || _b === void 0 ? void 0 : _b.setRouteInfoForKeepAliveApp();
            }
            // dispatch afterShow event to micro-app
            dispatchCustomEventToMicroApp(this, 'appstate-change', {
                appState: 'aftershow',
            });
            this.setLifeCycleState(lifeCycles.AFTERSHOW);
            // dispatch afterShow event to base app
            dispatchLifecyclesEvent(this.container, this.name, lifeCycles.AFTERSHOW);
        }
        /**
         * app rendering error
         * @param e Error
         */
        onerror(e) {
            this.setLifeCycleState(lifeCycles.ERROR);
            // dispatch state event to micro app
            dispatchCustomEventToMicroApp(this, 'statechange', {
                appState: appStates.LOAD_FAILED
            });
            dispatchLifecyclesEvent(this.container, this.name, lifeCycles.ERROR, e);
        }
        /**
         * Parse htmlString to DOM
         * NOTE: iframe sandbox will use DOMParser of iframeWindow, with sandbox will use DOMParser of base app
         * @param htmlString DOMString
         * @returns parsed DOM
         */
        parseHtmlString(htmlString) {
            var _a;
            const DOMParser = ((_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.proxyWindow) ? this.sandBox.proxyWindow.DOMParser
                : globalEnv.rawWindow.DOMParser;
            return (new DOMParser()).parseFromString(htmlString, 'text/html').body;
        }
        /**
         * clone origin elements to target
         * @param origin Cloned element
         * @param target Accept cloned elements
         * @param deep deep clone or transfer dom
         */
        cloneContainer(target, origin, deep) {
            // 在基座接受到afterhidden方法后立即执行unmount，彻底destroy应用时，因为unmount时同步执行，所以this.container为null后才执行cloneContainer
            if (origin) {
                target.innerHTML = '';
                Array.from(deep ? this.parseHtmlString(origin.innerHTML).childNodes : origin.childNodes).forEach((node) => {
                    target.appendChild(node);
                });
            }
            return target;
        }
        /**
         * Scene:
         *  1. create app
         *  2. remount of default mode with iframe sandbox
         *    In default mode with iframe sandbox, unmount app will delete iframeElement & sandBox, and create sandBox when mount again, used to solve the problem that module script cannot be execute when append it again
         */
        createSandbox() {
            if (this.useSandbox && !this.sandBox) {
                this.sandBox = this.iframe ? new IframeSandbox(this.name, this.url) : new WithSandBox(this.name, this.url);
            }
        }
        // set app state
        setAppState(state) {
            var _a;
            this.state = state;
            // set window.__MICRO_APP_STATE__
            (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.setStaticAppState(state);
        }
        // get app state
        getAppState() {
            return this.state;
        }
        // set app lifeCycleState
        setLifeCycleState(state) {
            this.lifeCycleState = state;
        }
        // get app lifeCycleState
        getLifeCycleState() {
            return this.lifeCycleState || '';
        }
        // set keep-alive state
        setKeepAliveState(state) {
            this.keepAliveState = state;
        }
        // get keep-alive state
        getKeepAliveState() {
            return this.keepAliveState;
        }
        // is app unmounted
        isUnmounted() {
            return appStates.UNMOUNT === this.state;
        }
        // is app already hidden
        isHidden() {
            return keepAliveStates.KEEP_ALIVE_HIDDEN === this.keepAliveState;
        }
        // get umd library, if it not exist, return empty object
        getUmdLibraryHooks() {
            // after execScripts, the app maybe unmounted
            if (!this.isUnmounted() && this.sandBox) {
                const libraryName = getRootContainer(this.container).getAttribute('library') || `micro-app-${this.name}`;
                const proxyWindow = this.sandBox.proxyWindow;
                // compatible with pre versions
                if (isObject$1(proxyWindow[libraryName])) {
                    return proxyWindow[libraryName];
                }
                return {
                    mount: proxyWindow.mount,
                    unmount: proxyWindow.unmount,
                };
            }
            return {};
        }
        getMicroAppGlobalHook(eventName) {
            var _a, _b;
            const listener = (_b = (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.proxyWindow) === null || _b === void 0 ? void 0 : _b[eventName];
            return isFunction$1(listener) ? listener : null;
        }
        querySelector(selectors) {
            return this.container ? globalEnv.rawElementQuerySelector.call(this.container, selectors) : null;
        }
        querySelectorAll(selectors) {
            return this.container ? globalEnv.rawElementQuerySelectorAll.call(this.container, selectors) : [];
        }
        /**
         * NOTE:
         * 1. If the iframe sandbox no longer enforces the use of inline mode in the future, the way getElementsByTagName retrieves the script from the iframe by default needs to be changed, because in non inline mode, the script in the iframe may be empty
         * @param inline inline mode config
         */
        getInlineModeState(inline) {
            var _a;
            return (_a = (this.iframe || inline)) !== null && _a !== void 0 ? _a : false;
        }
    }
    // iframe route mode
    function isIframeSandbox(appName) {
        var _a, _b;
        return (_b = (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.iframe) !== null && _b !== void 0 ? _b : false;
    }

    // Record element and map element
    const dynamicElementInMicroAppMap = new WeakMap();
    // Get the map element
    function getMappingNode(node) {
        var _a;
        return (_a = dynamicElementInMicroAppMap.get(node)) !== null && _a !== void 0 ? _a : node;
    }
    /**
     * Process the new node and format the style, link and script element
     * @param child new node
     * @param app app
     */
    function handleNewNode(child, app) {
        if (dynamicElementInMicroAppMap.has(child)) {
            return dynamicElementInMicroAppMap.get(child);
        }
        else if (isStyleElement(child)) {
            if (child.hasAttribute('exclude')) {
                const replaceComment = document.createComment('style element with exclude attribute ignored by micro-app');
                dynamicElementInMicroAppMap.set(child, replaceComment);
                return replaceComment;
            }
            else if (app.scopecss && !child.hasAttribute('ignore')) {
                return scopedCSS(child, app);
            }
            return child;
        }
        else if (isLinkElement(child)) {
            if (child.hasAttribute('exclude') || checkExcludeUrl(child.getAttribute('href'), app.name)) {
                const linkReplaceComment = document.createComment('link element with exclude attribute ignored by micro-app');
                dynamicElementInMicroAppMap.set(child, linkReplaceComment);
                return linkReplaceComment;
            }
            else if (child.hasAttribute('ignore') ||
                checkIgnoreUrl(child.getAttribute('href'), app.name) ||
                (child.href &&
                    isFunction$1(microApp.options.excludeAssetFilter) &&
                    microApp.options.excludeAssetFilter(child.href))) {
                return child;
            }
            const { address, linkInfo, replaceComment } = extractLinkFromHtml(child, null, app, true);
            if (address && linkInfo) {
                const replaceStyle = formatDynamicLink(address, app, linkInfo, child);
                dynamicElementInMicroAppMap.set(child, replaceStyle);
                return replaceStyle;
            }
            else if (replaceComment) {
                dynamicElementInMicroAppMap.set(child, replaceComment);
                return replaceComment;
            }
            return child;
        }
        else if (isScriptElement(child)) {
            if (child.src &&
                isFunction$1(microApp.options.excludeAssetFilter) &&
                microApp.options.excludeAssetFilter(child.src)) {
                return child;
            }
            const { replaceComment, address, scriptInfo } = extractScriptElement(child, null, app, true) || {};
            if (address && scriptInfo) {
                // remote script or inline script
                const replaceElement = scriptInfo.isExternal ? runDynamicRemoteScript(address, app, scriptInfo, child) : runDynamicInlineScript(address, app, scriptInfo);
                dynamicElementInMicroAppMap.set(child, replaceElement);
                return replaceElement;
            }
            else if (replaceComment) {
                dynamicElementInMicroAppMap.set(child, replaceComment);
                return replaceComment;
            }
            return child;
        }
        return child;
    }
    /**
     * Handle the elements inserted into head and body, and execute normally in other cases
     * @param app app
     * @param method raw method
     * @param parent parent node
     * @param targetChild target node
     * @param passiveChild second param of insertBefore and replaceChild
     */
    function invokePrototypeMethod(app, rawMethod, parent, targetChild, passiveChild) {
        const hijackParent = getHijackParent(parent, targetChild, app);
        if (hijackParent) {
            /**
             * If parentNode is <micro-app-body>, return rawDocument.body
             * Scenes:
             *  1. element-ui@2/lib/utils/vue-popper.js
             *    if (this.popperElm.parentNode === document.body) ...
             * WARNING:
             *  1. When operate child from parentNode async, may have been unmount
             *    e.g. target.parentNode.remove(target)
             * ISSUE:
             *  1. https://github.com/micro-zoe/micro-app/issues/739
             *    Solution: Return the true value when node not in document
             */
            if (!isIframeSandbox(app.name) &&
                isMicroAppBody(hijackParent) &&
                rawMethod !== globalEnv.rawRemoveChild) {
                const descriptor = Object.getOwnPropertyDescriptor(targetChild, 'parentNode');
                if ((!descriptor || descriptor.configurable) && !targetChild.__MICRO_APP_HAS_DPN__) {
                    rawDefineProperties(targetChild, {
                        parentNode: {
                            configurable: true,
                            get() {
                                var _a, _b;
                                const result = globalEnv.rawParentNodeDesc.get.call(this);
                                if (isMicroAppBody(result) && app.container) {
                                    // TODO: remove getRootElementParentNode
                                    return ((_b = (_a = microApp.options).getRootElementParentNode) === null || _b === void 0 ? void 0 : _b.call(_a, this, app.name)) || document.body;
                                }
                                return result;
                            },
                        },
                        __MICRO_APP_HAS_DPN__: {
                            configurable: true,
                            get: () => true,
                        }
                    });
                }
            }
            if ((process.env.NODE_ENV !== 'production') &&
                isIFrameElement(targetChild) &&
                rawMethod === globalEnv.rawAppendChild) {
                fixReactHMRConflict(app);
            }
            /**
             * 1. If passiveChild exists, it must be insertBefore or replaceChild
             * 2. When removeChild, targetChild may not be in microAppHead or head
             * NOTE:
             *  1. If passiveChild not in hijackParent, insertBefore replaceChild will be degraded to appendChild
             *    E.g: document.head.replaceChild(targetChild, document.scripts[0])
             *  2. If passiveChild not in hijackParent but in parent and method is insertBefore, try insert it into the position corresponding to hijackParent
             *    E.g: document.head.insertBefore(targetChild, document.head.childNodes[0])
             *    ISSUE: https://github.com/micro-zoe/micro-app/issues/1071
             */
            if (passiveChild && !hijackParent.contains(passiveChild)) {
                if (rawMethod === globalEnv.rawInsertBefore && parent.contains(passiveChild)) {
                    const indexOfParent = Array.from(parent.childNodes).indexOf(passiveChild);
                    if (hijackParent.childNodes[indexOfParent]) {
                        return invokeRawMethod(rawMethod, hijackParent, targetChild, hijackParent.childNodes[indexOfParent]);
                    }
                }
                return globalEnv.rawAppendChild.call(hijackParent, targetChild);
            }
            else if (rawMethod === globalEnv.rawRemoveChild && !hijackParent.contains(targetChild)) {
                if (parent.contains(targetChild)) {
                    return rawMethod.call(parent, targetChild);
                }
                return targetChild;
            }
            return invokeRawMethod(rawMethod, hijackParent, targetChild, passiveChild);
        }
        return invokeRawMethod(rawMethod, parent, targetChild, passiveChild);
    }
    // head/body map to micro-app-head/micro-app-body
    function getHijackParent(parent, targetChild, app) {
        if (app) {
            if (parent === document.head) {
                if (app.iframe && isScriptElement(targetChild)) {
                    return app.sandBox.microHead;
                }
                return app.querySelector('micro-app-head');
            }
            if (parent === document.body || parent === document.body.parentNode) {
                if (app.iframe && isScriptElement(targetChild)) {
                    return app.sandBox.microBody;
                }
                return app.querySelector('micro-app-body');
            }
            if (app.iframe && isScriptElement(targetChild)) {
                return app.sandBox.microBody;
            }
        }
        return null;
    }
    function invokeRawMethod(rawMethod, parent, targetChild, passiveChild) {
        if (isPendMethod(rawMethod)) {
            return rawMethod.call(parent, targetChild);
        }
        return rawMethod.call(parent, targetChild, passiveChild);
    }
    function isPendMethod(method) {
        return method === globalEnv.rawAppend || method === globalEnv.rawPrepend;
    }
    /**
     * Attempt to complete the static resource address again before insert the node
     * @param app app instance
     * @param newChild target node
     */
    function completePathDynamic(app, newChild) {
        if (isElement(newChild)) {
            if (/^(img|script)$/i.test(newChild.tagName)) {
                if (newChild.hasAttribute('src')) {
                    globalEnv.rawSetAttribute.call(newChild, 'src', CompletionPath(newChild.getAttribute('src'), app.url));
                }
                if (newChild.hasAttribute('srcset')) {
                    globalEnv.rawSetAttribute.call(newChild, 'srcset', CompletionPath(newChild.getAttribute('srcset'), app.url));
                }
            }
            else if (/^link$/i.test(newChild.tagName) && newChild.hasAttribute('href')) {
                globalEnv.rawSetAttribute.call(newChild, 'href', CompletionPath(newChild.getAttribute('href'), app.url));
            }
        }
    }
    /**
     * method of handle new node
     * @param parent parent node
     * @param newChild new node
     * @param passiveChild passive node
     * @param rawMethod method
     */
    function commonElementHandler(parent, newChild, passiveChild, rawMethod) {
        const currentAppName = getCurrentAppName();
        if (isNode(newChild) &&
            !newChild.__PURE_ELEMENT__ &&
            (newChild.__MICRO_APP_NAME__ ||
                currentAppName)) {
            newChild.__MICRO_APP_NAME__ = newChild.__MICRO_APP_NAME__ || currentAppName;
            const app = appInstanceMap.get(newChild.__MICRO_APP_NAME__);
            if (isStyleElement(newChild)) {
                const isShadowNode = parent.getRootNode();
                const isShadowEnvironment = isShadowNode instanceof ShadowRoot;
                isShadowEnvironment && newChild.setAttribute('ignore', 'true');
            }
            if (app === null || app === void 0 ? void 0 : app.container) {
                completePathDynamic(app, newChild);
                return invokePrototypeMethod(app, rawMethod, parent, handleNewNode(newChild, app), passiveChild && getMappingNode(passiveChild));
            }
        }
        if (rawMethod === globalEnv.rawAppend || rawMethod === globalEnv.rawPrepend) {
            return rawMethod.call(parent, newChild);
        }
        return rawMethod.call(parent, newChild, passiveChild);
    }
    /**
     * Rewrite element prototype method
     */
    function patchElementAndDocument() {
        patchDocument$2();
        const rawRootElement = globalEnv.rawRootElement;
        const rawRootNode = globalEnv.rawRootNode;
        // prototype methods of add element👇
        rawRootElement.prototype.appendChild = function appendChild(newChild) {
            return commonElementHandler(this, newChild, null, globalEnv.rawAppendChild);
        };
        rawRootElement.prototype.insertBefore = function insertBefore(newChild, refChild) {
            return commonElementHandler(this, newChild, refChild, globalEnv.rawInsertBefore);
        };
        rawRootElement.prototype.replaceChild = function replaceChild(newChild, oldChild) {
            return commonElementHandler(this, newChild, oldChild, globalEnv.rawReplaceChild);
        };
        rawRootElement.prototype.append = function append(...nodes) {
            let i = 0;
            while (i < nodes.length) {
                let node = nodes[i];
                node = isNode(node) ? node : globalEnv.rawCreateTextNode.call(globalEnv.rawDocument, node);
                commonElementHandler(this, markElement(node), null, globalEnv.rawAppend);
                i++;
            }
        };
        rawRootElement.prototype.prepend = function prepend(...nodes) {
            let i = nodes.length;
            while (i > 0) {
                let node = nodes[i - 1];
                node = isNode(node) ? node : globalEnv.rawCreateTextNode.call(globalEnv.rawDocument, node);
                commonElementHandler(this, markElement(node), null, globalEnv.rawPrepend);
                i--;
            }
        };
        // prototype methods of delete element👇
        rawRootElement.prototype.removeChild = function removeChild(oldChild) {
            if (oldChild === null || oldChild === void 0 ? void 0 : oldChild.__MICRO_APP_NAME__) {
                const app = appInstanceMap.get(oldChild.__MICRO_APP_NAME__);
                if (app === null || app === void 0 ? void 0 : app.container) {
                    return invokePrototypeMethod(app, globalEnv.rawRemoveChild, this, getMappingNode(oldChild));
                }
                try {
                    return globalEnv.rawRemoveChild.call(this, oldChild);
                }
                catch (_a) {
                    return ((oldChild === null || oldChild === void 0 ? void 0 : oldChild.parentNode) && globalEnv.rawRemoveChild.call(oldChild.parentNode, oldChild));
                }
            }
            return globalEnv.rawRemoveChild.call(this, oldChild);
        };
        /**
         * The insertAdjacentElement method of the Element interface inserts a given element node at a given position relative to the element it is invoked upon.
         * NOTE:
         *  1. parameter 2 of insertAdjacentElement must type 'Element'
         */
        rawRootElement.prototype.insertAdjacentElement = function (where, element) {
            var _a;
            if ((element === null || element === void 0 ? void 0 : element.__MICRO_APP_NAME__) && isElement(element)) {
                const app = appInstanceMap.get(element.__MICRO_APP_NAME__);
                if (app === null || app === void 0 ? void 0 : app.container) {
                    const processedEle = handleNewNode(element, app);
                    if (!isElement(processedEle))
                        return element;
                    const realParent = (_a = getHijackParent(this, processedEle, app)) !== null && _a !== void 0 ? _a : this;
                    return globalEnv.rawInsertAdjacentElement.call(realParent, where, processedEle);
                }
            }
            return globalEnv.rawInsertAdjacentElement.call(this, where, element);
        };
        // patch cloneNode
        rawRootElement.prototype.cloneNode = function cloneNode(deep) {
            const clonedNode = globalEnv.rawCloneNode.call(this, deep);
            this.__MICRO_APP_NAME__ && (clonedNode.__MICRO_APP_NAME__ = this.__MICRO_APP_NAME__);
            return clonedNode;
        };
        /**
         * document.body(head).querySelector(querySelectorAll) hijack to microAppBody(microAppHead).querySelector(querySelectorAll)
         * NOTE:
         *  1. May cause some problems!
         *  2. Add config options?
         */
        function getQueryTarget(target) {
            const currentAppName = getCurrentAppName();
            if ((target === document.body || target === document.head) && currentAppName) {
                const app = appInstanceMap.get(currentAppName);
                if (app === null || app === void 0 ? void 0 : app.container) {
                    if (target === document.body) {
                        return app.querySelector('micro-app-body');
                    }
                    else if (target === document.head) {
                        return app.querySelector('micro-app-head');
                    }
                }
            }
            return target;
        }
        rawRootElement.prototype.querySelector = function querySelector(selectors) {
            var _a;
            return globalEnv.rawElementQuerySelector.call((_a = getQueryTarget(this)) !== null && _a !== void 0 ? _a : this, selectors);
        };
        rawRootElement.prototype.querySelectorAll = function querySelectorAll(selectors) {
            var _a;
            return globalEnv.rawElementQuerySelectorAll.call((_a = getQueryTarget(this)) !== null && _a !== void 0 ? _a : this, selectors);
        };
        // rewrite setAttribute, complete resource address
        rawRootElement.prototype.setAttribute = function setAttribute(key, value) {
            const appName = this.__MICRO_APP_NAME__ || getCurrentAppName();
            if (appName &&
                appInstanceMap.has(appName) &&
                (((key === 'src' || key === 'srcset') && /^(img|script|video|audio|source|embed)$/i.test(this.tagName)) ||
                    (key === 'href' && /^link$/i.test(this.tagName)))) {
                const app = appInstanceMap.get(appName);
                value = CompletionPath(value, app.url);
            }
            globalEnv.rawSetAttribute.call(this, key, value);
        };
        /**
         * TODO: 兼容直接通过img.src等操作设置的资源
         * NOTE:
         *  1. 卸载时恢复原始值
         *  2. 循环嵌套的情况
         *  3. 放在global_env中统一处理
         *  4. 是否和completePathDynamic的作用重复？
         */
        // const protoAttrList: Array<[HTMLElement, string]> = [
        //   [HTMLImageElement.prototype, 'src'],
        //   [HTMLScriptElement.prototype, 'src'],
        //   [HTMLLinkElement.prototype, 'href'],
        // ]
        // protoAttrList.forEach(([target, attr]) => {
        //   const { enumerable, configurable, get, set } = Object.getOwnPropertyDescriptor(target, attr) || {
        //     enumerable: true,
        //     configurable: true,
        //   }
        //   rawDefineProperty(target, attr, {
        //     enumerable,
        //     configurable,
        //     get: function () {
        //       return get?.call(this)
        //     },
        //     set: function (value) {
        //       const currentAppName = getCurrentAppName()
        //       if (currentAppName && appInstanceMap.has(currentAppName)) {
        //         const app = appInstanceMap.get(currentAppName)
        //         value = CompletionPath(value, app!.url)
        //       }
        //       set?.call(this, value)
        //     },
        //   })
        // })
        rawDefineProperty(rawRootElement.prototype, 'innerHTML', {
            configurable: true,
            enumerable: true,
            get() {
                return globalEnv.rawInnerHTMLDesc.get.call(this);
            },
            set(code) {
                globalEnv.rawInnerHTMLDesc.set.call(this, code);
                const currentAppName = getCurrentAppName();
                Array.from(this.children).forEach((child) => {
                    if (isElement(child) && currentAppName) {
                        // TODO: 使用updateElementInfo进行更新
                        child.__MICRO_APP_NAME__ = currentAppName;
                    }
                });
            }
        });
        rawDefineProperty(rawRootNode.prototype, 'parentNode', {
            configurable: true,
            enumerable: true,
            get() {
                var _a, _b, _c;
                /**
                 * hijack parentNode of html
                 * Scenes:
                 *  1. element-ui@2/lib/utils/popper.js
                 *    // root is child app window, so root.document is proxyDocument or microDocument
                 *    if (element.parentNode === root.document) ...
                */
                const currentAppName = getCurrentAppName();
                if (currentAppName && this === globalEnv.rawDocument.firstElementChild) {
                    const microDocument = (_c = (_b = (_a = appInstanceMap.get(currentAppName)) === null || _a === void 0 ? void 0 : _a.sandBox) === null || _b === void 0 ? void 0 : _b.proxyWindow) === null || _c === void 0 ? void 0 : _c.document;
                    if (microDocument)
                        return microDocument;
                }
                const result = globalEnv.rawParentNodeDesc.get.call(this);
                /**
                 * If parentNode is <micro-app-body>, return rawDocument.body
                 * Scenes:
                 *  1. element-ui@2/lib/utils/vue-popper.js
                 *    if (this.popperElm.parentNode === document.body) ...
                 * WARNING:
                 *  Will it cause other problems ?
                 *  e.g. target.parentNode.remove(target)
                 * BUG:
                 *  1. vue2 umdMode, throw error when render again (<div id='app'></div> will be deleted when render again ) -- Abandon this way at 2023.2.28 before v1.0.0-beta.0, it will cause vue2 throw error when render again
                 */
                // if (isMicroAppBody(result) && appInstanceMap.get(this.__MICRO_APP_NAME__)?.container) {
                //   return document.body
                // }
                return result;
            },
        });
    }
    /**
     * Mark the newly created element in the micro application
     * @param element new element
     */
    function markElement(element) {
        const currentAppName = getCurrentAppName();
        if (currentAppName)
            element.__MICRO_APP_NAME__ = currentAppName;
        return element;
    }
    // methods of document
    function patchDocument$2() {
        const rawDocument = globalEnv.rawDocument;
        const rawRootDocument = globalEnv.rawRootDocument;
        function getBindTarget(target) {
            return isProxyDocument(target) ? rawDocument : target;
        }
        // create element 👇
        rawRootDocument.prototype.createElement = function createElement(tagName, options) {
            const element = globalEnv.rawCreateElement.call(getBindTarget(this), tagName, options);
            return markElement(element);
        };
        rawRootDocument.prototype.createElementNS = function createElementNS(namespaceURI, name, options) {
            const element = globalEnv.rawCreateElementNS.call(getBindTarget(this), namespaceURI, name, options);
            return markElement(element);
        };
        // TODO: 放开
        // rawRootDocument.prototype.createTextNode = function createTextNode (data: string): Text {
        //   const element = globalEnv.rawCreateTextNode.call(getBindTarget(this), data)
        //   return markElement(element)
        // }
        rawRootDocument.prototype.createDocumentFragment = function createDocumentFragment() {
            const element = globalEnv.rawCreateDocumentFragment.call(getBindTarget(this));
            return markElement(element);
        };
        rawRootDocument.prototype.createComment = function createComment(data) {
            const element = globalEnv.rawCreateComment.call(getBindTarget(this), data);
            return markElement(element);
        };
        // query element👇
        function querySelector(selectors) {
            var _a, _b;
            const _this = getBindTarget(this);
            const currentAppName = getCurrentAppName();
            if (!currentAppName ||
                !selectors ||
                isUniqueElement(selectors) ||
                // ISSUE: https://github.com/micro-zoe/micro-app/issues/56
                rawDocument !== _this) {
                return globalEnv.rawQuerySelector.call(_this, selectors);
            }
            return (_b = (_a = appInstanceMap.get(currentAppName)) === null || _a === void 0 ? void 0 : _a.querySelector(selectors)) !== null && _b !== void 0 ? _b : null;
        }
        function querySelectorAll(selectors) {
            var _a, _b;
            const _this = getBindTarget(this);
            const currentAppName = getCurrentAppName();
            if (!currentAppName ||
                !selectors ||
                isUniqueElement(selectors) ||
                rawDocument !== _this) {
                return globalEnv.rawQuerySelectorAll.call(_this, selectors);
            }
            return (_b = (_a = appInstanceMap.get(currentAppName)) === null || _a === void 0 ? void 0 : _a.querySelectorAll(selectors)) !== null && _b !== void 0 ? _b : [];
        }
        rawRootDocument.prototype.querySelector = querySelector;
        rawRootDocument.prototype.querySelectorAll = querySelectorAll;
        rawRootDocument.prototype.getElementById = function getElementById(key) {
            const _this = getBindTarget(this);
            if (!getCurrentAppName() || isInvalidQuerySelectorKey(key)) {
                return globalEnv.rawGetElementById.call(_this, key);
            }
            try {
                return querySelector.call(_this, `#${key}`);
            }
            catch (_a) {
                return globalEnv.rawGetElementById.call(_this, key);
            }
        };
        rawRootDocument.prototype.getElementsByClassName = function getElementsByClassName(key) {
            const _this = getBindTarget(this);
            if (!getCurrentAppName() || isInvalidQuerySelectorKey(key)) {
                return globalEnv.rawGetElementsByClassName.call(_this, key);
            }
            try {
                return querySelectorAll.call(_this, `.${key}`);
            }
            catch (_a) {
                return globalEnv.rawGetElementsByClassName.call(_this, key);
            }
        };
        rawRootDocument.prototype.getElementsByTagName = function getElementsByTagName(key) {
            var _a;
            const _this = getBindTarget(this);
            const currentAppName = getCurrentAppName();
            if (!currentAppName ||
                isUniqueElement(key) ||
                isInvalidQuerySelectorKey(key) ||
                (!((_a = appInstanceMap.get(currentAppName)) === null || _a === void 0 ? void 0 : _a.inline) && /^script$/i.test(key))) {
                return globalEnv.rawGetElementsByTagName.call(_this, key);
            }
            try {
                return querySelectorAll.call(_this, key);
            }
            catch (_b) {
                return globalEnv.rawGetElementsByTagName.call(_this, key);
            }
        };
        rawRootDocument.prototype.getElementsByName = function getElementsByName(key) {
            const _this = getBindTarget(this);
            if (!getCurrentAppName() || isInvalidQuerySelectorKey(key)) {
                return globalEnv.rawGetElementsByName.call(_this, key);
            }
            try {
                return querySelectorAll.call(_this, `[name=${key}]`);
            }
            catch (_a) {
                return globalEnv.rawGetElementsByName.call(_this, key);
            }
        };
    }
    function releasePatchDocument() {
        const rawRootDocument = globalEnv.rawRootDocument;
        rawRootDocument.prototype.createElement = globalEnv.rawCreateElement;
        rawRootDocument.prototype.createElementNS = globalEnv.rawCreateElementNS;
        rawRootDocument.prototype.createDocumentFragment = globalEnv.rawCreateDocumentFragment;
        rawRootDocument.prototype.querySelector = globalEnv.rawQuerySelector;
        rawRootDocument.prototype.querySelectorAll = globalEnv.rawQuerySelectorAll;
        rawRootDocument.prototype.getElementById = globalEnv.rawGetElementById;
        rawRootDocument.prototype.getElementsByClassName = globalEnv.rawGetElementsByClassName;
        rawRootDocument.prototype.getElementsByTagName = globalEnv.rawGetElementsByTagName;
        rawRootDocument.prototype.getElementsByName = globalEnv.rawGetElementsByName;
    }
    // release patch
    function releasePatchElementAndDocument() {
        removeDomScope();
        releasePatchDocument();
        const rawRootElement = globalEnv.rawRootElement;
        const rawRootNode = globalEnv.rawRootNode;
        rawRootElement.prototype.appendChild = globalEnv.rawAppendChild;
        rawRootElement.prototype.insertBefore = globalEnv.rawInsertBefore;
        rawRootElement.prototype.replaceChild = globalEnv.rawReplaceChild;
        rawRootElement.prototype.removeChild = globalEnv.rawRemoveChild;
        rawRootElement.prototype.append = globalEnv.rawAppend;
        rawRootElement.prototype.prepend = globalEnv.rawPrepend;
        rawRootElement.prototype.cloneNode = globalEnv.rawCloneNode;
        rawRootElement.prototype.querySelector = globalEnv.rawElementQuerySelector;
        rawRootElement.prototype.querySelectorAll = globalEnv.rawElementQuerySelectorAll;
        rawRootElement.prototype.setAttribute = globalEnv.rawSetAttribute;
        rawDefineProperty(rawRootElement.prototype, 'innerHTML', globalEnv.rawInnerHTMLDesc);
        rawDefineProperty(rawRootNode.prototype, 'parentNode', globalEnv.rawParentNodeDesc);
    }
    // Set the style of micro-app-head and micro-app-body
    let hasRejectMicroAppStyle = false;
    function rejectMicroAppStyle() {
        if (!hasRejectMicroAppStyle) {
            hasRejectMicroAppStyle = true;
            const style = pureCreateElement('style');
            globalEnv.rawSetAttribute.call(style, 'type', 'text/css');
            style.textContent = `\n${microApp.tagName}, micro-app-body { display: block; } \nmicro-app-head { display: none; }`;
            globalEnv.rawDocument.head.appendChild(style);
        }
    }

    const globalEnv = {
        // active sandbox count
        activeSandbox: 0,
    };
    /**
     * Note loop nesting
     * Only prototype or unique values can be put here
     */
    function initGlobalEnv() {
        if (isBrowser) {
            const rawWindow = window.rawWindow || Function('return window')();
            const rawDocument = window.rawDocument || Function('return document')();
            const rawRootDocument = rawWindow.Document || Function('return Document')();
            const rawRootElement = rawWindow.Element;
            const rawRootNode = rawWindow.Node;
            const rawRootEventTarget = rawWindow.EventTarget;
            // save patch raw methods, pay attention to this binding
            const rawSetAttribute = rawRootElement.prototype.setAttribute;
            const rawAppendChild = rawRootElement.prototype.appendChild;
            const rawInsertBefore = rawRootElement.prototype.insertBefore;
            const rawReplaceChild = rawRootElement.prototype.replaceChild;
            const rawRemoveChild = rawRootElement.prototype.removeChild;
            const rawAppend = rawRootElement.prototype.append;
            const rawPrepend = rawRootElement.prototype.prepend;
            const rawCloneNode = rawRootElement.prototype.cloneNode;
            const rawElementQuerySelector = rawRootElement.prototype.querySelector;
            const rawElementQuerySelectorAll = rawRootElement.prototype.querySelectorAll;
            const rawInsertAdjacentElement = rawRootElement.prototype.insertAdjacentElement;
            const rawInnerHTMLDesc = Object.getOwnPropertyDescriptor(rawRootElement.prototype, 'innerHTML');
            const rawParentNodeDesc = Object.getOwnPropertyDescriptor(rawRootNode.prototype, 'parentNode');
            // Document proto methods
            const rawCreateElement = rawRootDocument.prototype.createElement;
            const rawCreateElementNS = rawRootDocument.prototype.createElementNS;
            const rawCreateTextNode = rawRootDocument.prototype.createTextNode;
            const rawCreateDocumentFragment = rawRootDocument.prototype.createDocumentFragment;
            const rawCreateComment = rawRootDocument.prototype.createComment;
            const rawQuerySelector = rawRootDocument.prototype.querySelector;
            const rawQuerySelectorAll = rawRootDocument.prototype.querySelectorAll;
            const rawGetElementById = rawRootDocument.prototype.getElementById;
            const rawGetElementsByClassName = rawRootDocument.prototype.getElementsByClassName;
            const rawGetElementsByTagName = rawRootDocument.prototype.getElementsByTagName;
            const rawGetElementsByName = rawRootDocument.prototype.getElementsByName;
            const ImageProxy = new Proxy(Image, {
                construct(Target, args) {
                    const elementImage = new Target(...args);
                    const currentAppName = getCurrentAppName();
                    if (currentAppName)
                        elementImage.__MICRO_APP_NAME__ = currentAppName;
                    return elementImage;
                },
            });
            /**
             * save effect raw methods
             * pay attention to this binding, especially setInterval, setTimeout, clearInterval, clearTimeout
             */
            const rawSetInterval = rawWindow.setInterval;
            const rawSetTimeout = rawWindow.setTimeout;
            const rawClearInterval = rawWindow.clearInterval;
            const rawClearTimeout = rawWindow.clearTimeout;
            const rawPushState = rawWindow.history.pushState;
            const rawReplaceState = rawWindow.history.replaceState;
            const rawAddEventListener = rawRootEventTarget.prototype.addEventListener;
            const rawRemoveEventListener = rawRootEventTarget.prototype.removeEventListener;
            const rawDispatchEvent = rawRootEventTarget.prototype.dispatchEvent;
            // mark current application as base application
            window.__MICRO_APP_BASE_APPLICATION__ = true;
            assign(globalEnv, {
                supportModuleScript: isSupportModuleScript(),
                // common global vars
                rawWindow,
                rawDocument,
                rawRootDocument,
                rawRootElement,
                rawRootNode,
                // source/patch
                rawSetAttribute,
                rawAppendChild,
                rawInsertBefore,
                rawReplaceChild,
                rawRemoveChild,
                rawAppend,
                rawPrepend,
                rawCloneNode,
                rawElementQuerySelector,
                rawElementQuerySelectorAll,
                rawInsertAdjacentElement,
                rawInnerHTMLDesc,
                rawParentNodeDesc,
                rawCreateElement,
                rawCreateElementNS,
                rawCreateDocumentFragment,
                rawCreateTextNode,
                rawCreateComment,
                rawQuerySelector,
                rawQuerySelectorAll,
                rawGetElementById,
                rawGetElementsByClassName,
                rawGetElementsByTagName,
                rawGetElementsByName,
                ImageProxy,
                // sandbox/effect
                rawSetInterval,
                rawSetTimeout,
                rawClearInterval,
                rawClearTimeout,
                rawPushState,
                rawReplaceState,
                rawAddEventListener,
                rawRemoveEventListener,
                rawDispatchEvent,
            });
            // global effect
            rejectMicroAppStyle();
        }
    }

    /**
     * define element
     * @param tagName element name
    */
    function defineElement(tagName) {
        class MicroAppElement extends getBaseHTMLElement() {
            constructor() {
                super(...arguments);
                this.isWaiting = false;
                this.cacheData = null;
                this.connectedCount = 0;
                this.connectStateMap = new Map();
                this.appName = ''; // app name
                this.appUrl = ''; // app url
                this.ssrUrl = ''; // html path in ssr mode
                this.version = version;
                /**
                 * handle for change of name an url after element init
                 */
                this.handleAttributeUpdate = () => {
                    this.isWaiting = false;
                    const formatAttrName = formatAppName(this.getAttribute('name'));
                    const formatAttrUrl = formatAppURL(this.getAttribute('url'), this.appName);
                    if (this.legalAttribute('name', formatAttrName) && this.legalAttribute('url', formatAttrUrl)) {
                        const oldApp = appInstanceMap.get(formatAttrName);
                        /**
                         * If oldApp exist & appName is different, determine whether oldApp is running
                         */
                        if (formatAttrName !== this.appName && oldApp) {
                            if (!oldApp.isUnmounted() && !oldApp.isHidden() && !oldApp.isPrefetch) {
                                this.setAttribute('name', this.appName);
                                return logError(`app name conflict, an app named ${formatAttrName} is running`);
                            }
                        }
                        if (formatAttrName !== this.appName || formatAttrUrl !== this.appUrl) {
                            if (formatAttrName === this.appName) {
                                this.unmount(true, () => {
                                    this.actionsForAttributeChange(formatAttrName, formatAttrUrl, oldApp);
                                });
                            }
                            else if (this.getKeepAliveModeResult()) {
                                this.handleHiddenKeepAliveApp();
                                this.actionsForAttributeChange(formatAttrName, formatAttrUrl, oldApp);
                            }
                            else {
                                this.unmount(false, () => {
                                    this.actionsForAttributeChange(formatAttrName, formatAttrUrl, oldApp);
                                });
                            }
                        }
                    }
                    else if (formatAttrName !== this.appName) {
                        this.setAttribute('name', this.appName);
                    }
                };
            }
            static get observedAttributes() {
                return ['name', 'url'];
            }
            // 👇 Configuration
            // name: app name
            // url: html address
            // shadowDom: use shadowDOM, default is false
            // destroy: whether delete cache resources when unmount, default is false
            // inline: whether js runs in inline script mode, default is false
            // disableScopecss: whether disable css scoped, default is false
            // disableSandbox: whether disable sandbox, default is false
            // baseRoute: route prefix, default is ''
            // keep-alive: open keep-alive mode
            connectedCallback() {
                const cacheCount = ++this.connectedCount;
                this.connectStateMap.set(cacheCount, true);
                /**
                 * In some special scenes, such as vue's keep-alive, the micro-app will be inserted and deleted twice in an instant
                 * So we execute the mount method async and record connectState to prevent repeated rendering
                 */
                const effectiveApp = this.appName && this.appUrl;
                defer(() => {
                    if (this.connectStateMap.get(cacheCount)) {
                        dispatchLifecyclesEvent(this, this.appName, lifeCycles.CREATED);
                        /**
                         * If insert micro-app element without name or url, and set them in next action like angular,
                         * handleConnected will be executed twice, causing the app render repeatedly,
                         * so we only execute handleConnected() if url and name exist when connectedCallback
                         */
                        effectiveApp && this.handleConnected();
                    }
                });
            }
            disconnectedCallback() {
                this.connectStateMap.set(this.connectedCount, false);
                this.handleDisconnected();
            }
            /**
             * Re render app from the command line
             * MicroAppElement.reload(destroy)
             */
            reload(destroy) {
                return new Promise((resolve) => {
                    const handleAfterReload = () => {
                        this.removeEventListener(lifeCycles.MOUNTED, handleAfterReload);
                        this.removeEventListener(lifeCycles.AFTERSHOW, handleAfterReload);
                        resolve(true);
                    };
                    this.addEventListener(lifeCycles.MOUNTED, handleAfterReload);
                    this.addEventListener(lifeCycles.AFTERSHOW, handleAfterReload);
                    this.handleDisconnected(destroy, () => {
                        this.handleConnected();
                    });
                });
            }
            /**
             * common action for unmount
             * @param destroy reload param
             */
            handleDisconnected(destroy = false, callback) {
                const app = appInstanceMap.get(this.appName);
                if (app && !app.isUnmounted() && !app.isHidden()) {
                    // keep-alive
                    if (this.getKeepAliveModeResult() && !destroy) {
                        this.handleHiddenKeepAliveApp(callback);
                    }
                    else {
                        this.unmount(destroy, callback);
                    }
                }
            }
            attributeChangedCallback(attr, _oldVal, newVal) {
                if (this.legalAttribute(attr, newVal) &&
                    this[attr === ObservedAttrName.NAME ? 'appName' : 'appUrl'] !== newVal) {
                    if (attr === ObservedAttrName.URL && (!this.appUrl ||
                        !this.connectStateMap.get(this.connectedCount) // TODO: 这里的逻辑可否再优化一下
                    )) {
                        newVal = formatAppURL(newVal, this.appName);
                        if (!newVal) {
                            return logError(`Invalid attribute url ${newVal}`, this.appName);
                        }
                        this.appUrl = newVal;
                        this.handleInitialNameAndUrl();
                    }
                    else if (attr === ObservedAttrName.NAME && (!this.appName ||
                        !this.connectStateMap.get(this.connectedCount) // TODO: 这里的逻辑可否再优化一下
                    )) {
                        const formatNewName = formatAppName(newVal);
                        if (!formatNewName) {
                            return logError(`Invalid attribute name ${newVal}`, this.appName);
                        }
                        // TODO: 当micro-app还未插入文档中就修改name，逻辑可否再优化一下
                        if (this.cacheData) {
                            microApp.setData(formatNewName, this.cacheData);
                            this.cacheData = null;
                        }
                        this.appName = formatNewName;
                        if (formatNewName !== newVal) {
                            this.setAttribute('name', this.appName);
                        }
                        this.handleInitialNameAndUrl();
                    }
                    else if (!this.isWaiting) {
                        this.isWaiting = true;
                        defer(this.handleAttributeUpdate);
                    }
                }
            }
            // handle for connectedCallback run before attributeChangedCallback
            handleInitialNameAndUrl() {
                this.connectStateMap.get(this.connectedCount) && this.handleConnected();
            }
            /**
             * first mount of this app
             */
            handleConnected() {
                if (!this.appName || !this.appUrl)
                    return;
                if (this.getDisposeResult('shadowDOM') && !this.shadowRoot && isFunction$1(this.attachShadow)) {
                    this.attachShadow({ mode: 'open' });
                }
                this.updateSsrUrl(this.appUrl);
                if (appInstanceMap.has(this.appName)) {
                    const oldApp = appInstanceMap.get(this.appName);
                    const oldAppUrl = oldApp.ssrUrl || oldApp.url;
                    const targetUrl = this.ssrUrl || this.appUrl;
                    /**
                     * NOTE:
                     * 1. keep-alive don't care about ssrUrl
                     * 2. Even if the keep-alive app is pushed into the background, it is still active and cannot be replaced. Otherwise, it is difficult for developers to troubleshoot in case of conflict and  will leave developers at a loss
                     * 3. When scopecss, useSandbox of prefetch app different from target app, delete prefetch app and create new one
                     */
                    if (oldApp.isHidden() &&
                        oldApp.url === this.appUrl) {
                        this.handleShowKeepAliveApp(oldApp);
                    }
                    else if (oldAppUrl === targetUrl && (oldApp.isUnmounted() ||
                        (oldApp.isPrefetch &&
                            this.sameCoreOptions(oldApp)))) {
                        this.handleMount(oldApp);
                    }
                    else if (oldApp.isPrefetch || oldApp.isUnmounted()) {
                        if ((process.env.NODE_ENV !== 'production') && this.sameCoreOptions(oldApp)) {
                            /**
                             * url is different & old app is unmounted or prefetch, create new app to replace old one
                             */
                            logWarn(`the ${oldApp.isPrefetch ? 'prefetch' : 'unmounted'} app with url: ${oldAppUrl} replaced by a new app with url: ${targetUrl}`, this.appName);
                        }
                        this.handleCreateApp();
                    }
                    else {
                        logError(`app name conflict, an app named: ${this.appName} with url: ${oldAppUrl} is running`);
                    }
                }
                else {
                    this.handleCreateApp();
                }
            }
            // remount app or create app if attribute url or name change
            actionsForAttributeChange(formatAttrName, formatAttrUrl, oldApp) {
                var _a;
                /**
                 * do not add judgment of formatAttrUrl === this.appUrl
                 */
                this.updateSsrUrl(formatAttrUrl);
                this.appName = formatAttrName;
                this.appUrl = formatAttrUrl;
                ((_a = this.shadowRoot) !== null && _a !== void 0 ? _a : this).innerHTML = '';
                if (formatAttrName !== this.getAttribute('name')) {
                    this.setAttribute('name', this.appName);
                }
                /**
                 * when oldApp not null: this.appName === oldApp.name
                 * scene1: if formatAttrName and this.appName are equal: exitApp is the current app, the url must be different, oldApp has been unmounted
                 * scene2: if formatAttrName and this.appName are different: oldApp must be prefetch or unmounted, if url is equal, then just mount, if url is different, then create new app to replace oldApp
                 * scene3: url is different but ssrUrl is equal
                 * scene4: url is equal but ssrUrl is different, if url is equal, name must different
                 * scene5: if oldApp is KEEP_ALIVE_HIDDEN, name must different
                 */
                if (oldApp) {
                    if (oldApp.isHidden()) {
                        if (oldApp.url === this.appUrl) {
                            this.handleShowKeepAliveApp(oldApp);
                        }
                        else {
                            // the hidden keep-alive app is still active
                            logError(`app name conflict, an app named ${this.appName} is running`);
                        }
                        /**
                         * TODO:
                         *  1. oldApp必是unmountApp或preFetchApp，这里还应该考虑沙箱、iframe、样式隔离不一致的情况
                         *  2. unmountApp要不要判断样式隔离、沙箱、iframe，然后彻底删除并再次渲染？(包括handleConnected里的处理，先不改？)
                         * 推荐：if (
                         *  oldApp.url === this.appUrl &&
                         *  oldApp.ssrUrl === this.ssrUrl && (
                         *    oldApp.isUnmounted() ||
                         *    (oldApp.isPrefetch && this.sameCoreOptions(oldApp))
                         *  )
                         * )
                         */
                    }
                    else if (oldApp.url === this.appUrl && oldApp.ssrUrl === this.ssrUrl) {
                        // mount app
                        this.handleMount(oldApp);
                    }
                    else {
                        this.handleCreateApp();
                    }
                }
                else {
                    this.handleCreateApp();
                }
            }
            /**
             * judge the attribute is legal
             * @param name attribute name
             * @param val attribute value
             */
            legalAttribute(name, val) {
                if (!isString$1(val) || !val) {
                    logError(`unexpected attribute ${name}, please check again`, this.appName);
                    return false;
                }
                return true;
            }
            // create app instance
            handleCreateApp() {
                const createAppInstance = () => {
                    var _a;
                    return new CreateApp({
                        name: this.appName,
                        url: this.appUrl,
                        container: (_a = this.shadowRoot) !== null && _a !== void 0 ? _a : this,
                        scopecss: this.useScopecss(),
                        useSandbox: this.useSandbox(),
                        inline: this.getDisposeResult('inline'),
                        iframe: this.getDisposeResult('iframe'),
                        ssrUrl: this.ssrUrl,
                        routerMode: this.getMemoryRouterMode(),
                    });
                };
                /**
                 * Actions for destroy old app
                 * If oldApp exist, it must be 3 scenes:
                 *  1. oldApp is unmounted app (url is is different)
                 *  2. oldApp is prefetch, not prerender (url, scopecss, useSandbox, iframe is different)
                 *  3. oldApp is prerender (url, scopecss, useSandbox, iframe is different)
                 */
                const oldApp = appInstanceMap.get(this.appName);
                if (oldApp) {
                    if (oldApp.isPrerender) {
                        this.unmount(true, createAppInstance);
                    }
                    else {
                        oldApp.actionsForCompletelyDestroy();
                        createAppInstance();
                    }
                }
                else {
                    createAppInstance();
                }
            }
            /**
             * mount app
             * some serious note before mount:
             * 1. is prefetch ?
             * 2. is remount in another container ?
             * 3. is remount with change properties of the container ?
             */
            handleMount(app) {
                app.isPrefetch = false;
                /**
                 * Fix error when navigate before app.mount by microApp.router.push(...)
                 * Issue: https://github.com/micro-zoe/micro-app/issues/908
                 */
                app.setAppState(appStates.BEFORE_MOUNT);
                // exec mount async, simulate the first render scene
                defer(() => this.mount(app));
            }
            /**
             * public mount action for micro_app_element & create_app
             */
            mount(app) {
                var _a;
                app.mount({
                    container: (_a = this.shadowRoot) !== null && _a !== void 0 ? _a : this,
                    inline: this.getDisposeResult('inline'),
                    routerMode: this.getMemoryRouterMode(),
                    baseroute: this.getBaseRouteCompatible(),
                    defaultPage: this.getDefaultPage(),
                    disablePatchRequest: this.getDisposeResult('disable-patch-request'),
                    fiber: this.getDisposeResult('fiber'),
                });
            }
            /**
             * unmount app
             * @param destroy delete cache resources when unmount
             * @param unmountcb callback
             */
            unmount(destroy, unmountcb) {
                const app = appInstanceMap.get(this.appName);
                if (app && !app.isUnmounted()) {
                    app.unmount({
                        destroy: destroy || this.getDestroyCompatibleResult(),
                        clearData: this.getDisposeResult('clear-data'),
                        keepRouteState: this.getDisposeResult('keep-router-state'),
                        unmountcb,
                    });
                }
            }
            // hidden app when disconnectedCallback called with keep-alive
            handleHiddenKeepAliveApp(callback) {
                const app = appInstanceMap.get(this.appName);
                if (app && !app.isUnmounted() && !app.isHidden()) {
                    app.hiddenKeepAliveApp(callback);
                }
            }
            // show app when connectedCallback called with keep-alive
            handleShowKeepAliveApp(app) {
                // must be async
                defer(() => { var _a; return app.showKeepAliveApp((_a = this.shadowRoot) !== null && _a !== void 0 ? _a : this); });
            }
            /**
             * Get configuration
             * Global setting is lowest priority
             * @param name Configuration item name
             */
            getDisposeResult(name) {
                return (this.compatibleProperties(name) || !!microApp.options[name]) && this.compatibleDisableProperties(name);
            }
            // compatible of disableScopecss & disableSandbox
            compatibleProperties(name) {
                if (name === 'disable-scopecss') {
                    return this.hasAttribute('disable-scopecss') || this.hasAttribute('disableScopecss');
                }
                else if (name === 'disable-sandbox') {
                    return this.hasAttribute('disable-sandbox') || this.hasAttribute('disableSandbox');
                }
                return this.hasAttribute(name);
            }
            // compatible of disableScopecss & disableSandbox
            compatibleDisableProperties(name) {
                if (name === 'disable-scopecss') {
                    return this.getAttribute('disable-scopecss') !== 'false' && this.getAttribute('disableScopecss') !== 'false';
                }
                else if (name === 'disable-sandbox') {
                    return this.getAttribute('disable-sandbox') !== 'false' && this.getAttribute('disableSandbox') !== 'false';
                }
                return this.getAttribute(name) !== 'false';
            }
            useScopecss() {
                return !(this.getDisposeResult('disable-scopecss') || this.getDisposeResult('shadowDOM'));
            }
            useSandbox() {
                return !this.getDisposeResult('disable-sandbox');
            }
            /**
             * Determine whether the core options of the existApp is consistent with the new one
             */
            sameCoreOptions(app) {
                return (app.scopecss === this.useScopecss() &&
                    app.useSandbox === this.useSandbox() &&
                    app.iframe === this.getDisposeResult('iframe'));
            }
            /**
             * 2021-09-08
             * get baseRoute
             * getAttribute('baseurl') is compatible writing of versions below 0.3.1
             */
            getBaseRouteCompatible() {
                var _a, _b;
                return (_b = (_a = this.getAttribute('baseroute')) !== null && _a !== void 0 ? _a : this.getAttribute('baseurl')) !== null && _b !== void 0 ? _b : '';
            }
            // compatible of destroy
            getDestroyCompatibleResult() {
                return this.getDisposeResult('destroy') || this.getDisposeResult('destory');
            }
            /**
             * destroy has priority over destroy keep-alive
             */
            getKeepAliveModeResult() {
                return this.getDisposeResult('keep-alive') && !this.getDestroyCompatibleResult();
            }
            /**
             * change ssrUrl in ssr mode
             */
            updateSsrUrl(baseUrl) {
                if (this.getDisposeResult('ssr')) {
                    // TODO: disable-memory-router不存在了，这里需要更新一下
                    if (this.getDisposeResult('disable-memory-router') || this.getDisposeResult('disableSandbox')) {
                        const rawLocation = globalEnv.rawWindow.location;
                        this.ssrUrl = CompletionPath(rawLocation.pathname + rawLocation.search, baseUrl);
                    }
                    else {
                        // get path from browser URL
                        let targetPath = getNoHashMicroPathFromURL(this.appName, baseUrl);
                        const defaultPagePath = this.getDefaultPage();
                        if (!targetPath && defaultPagePath) {
                            const targetLocation = createURL(defaultPagePath, baseUrl);
                            targetPath = targetLocation.origin + targetLocation.pathname + targetLocation.search;
                        }
                        this.ssrUrl = targetPath;
                    }
                }
                else if (this.ssrUrl) {
                    this.ssrUrl = '';
                }
            }
            /**
             * get config of default page
             */
            getDefaultPage() {
                return (router.getDefaultPage(this.appName) ||
                    this.getAttribute('default-page') ||
                    this.getAttribute('defaultPage') ||
                    '');
            }
            /**
             * get config of router-mode
             * @returns router-mode
             */
            getMemoryRouterMode() {
                return getRouterMode(this.getAttribute('router-mode'), 
                // is micro-app element set disable-memory-router, like <micro-app disable-memory-router></micro-app>
                this.compatibleProperties('disable-memory-router') && this.compatibleDisableProperties('disable-memory-router'));
            }
            /**
             * rewrite micro-app.setAttribute, process attr data
             * @param key attr name
             * @param value attr value
             */
            setAttribute(key, value) {
                if (key === 'data') {
                    if (isPlainObject$1(value)) {
                        const cloneValue = {};
                        Object.getOwnPropertyNames(value).forEach((ownKey) => {
                            if (!(isString$1(ownKey) && ownKey.indexOf('__') === 0)) {
                                cloneValue[ownKey] = value[ownKey];
                            }
                        });
                        this.data = cloneValue;
                    }
                    else if (value !== '[object Object]') {
                        logWarn('property data must be an object', this.appName);
                    }
                }
                else {
                    globalEnv.rawSetAttribute.call(this, key, value);
                }
            }
            /**
             * Data from the base application
             */
            set data(value) {
                if (this.appName) {
                    microApp.setData(this.appName, value);
                }
                else {
                    this.cacheData = value;
                }
            }
            /**
             * get data only used in jsx-custom-event once
             */
            get data() {
                if (this.appName) {
                    return microApp.getData(this.appName, true);
                }
                else if (this.cacheData) {
                    return this.cacheData;
                }
                return null;
            }
            /**
             * get publicPath from a valid address,it can used in micro-app-devtools
             */
            get publicPath() {
                return getEffectivePath(this.appUrl);
            }
            /**
             * get baseRoute from attribute,it can used in micro-app-devtools
             */
            get baseRoute() {
                return this.getBaseRouteCompatible();
            }
        }
        globalEnv.rawWindow.customElements.define(tagName, MicroAppElement);
    }

    /**
     * preFetch([
     *  {
     *    name: string,
     *    url: string,
     *    iframe: boolean,
     *    inline: boolean,
     *    'disable-scopecss': boolean,
     *    'disable-sandbox': boolean,
     *    level: number,
     *    'default-page': string,
     *    'disable-patch-request': boolean,
     *  },
     *  ...
     * ])
     * Note:
     *  1: preFetch is async and is performed only when the browser is idle
     *  2: options of prefetch preferably match the config of the micro-app element, although this is not required
     * @param apps micro app options
     * @param delay delay time
     */
    function preFetch(apps, delay) {
        if (!isBrowser) {
            return logError('preFetch is only supported in browser environment');
        }
        requestIdleCallback(() => {
            const delayTime = isNumber$1(delay) ? delay : microApp.options.prefetchDelay;
            /**
             * TODO: remove setTimeout
             * Is there a better way?
             */
            setTimeout(() => {
                // releasePrefetchEffect()
                preFetchInSerial(apps);
            }, isNumber$1(delayTime) ? delayTime : 3000);
        });
        // const handleOnLoad = (): void => {
        //   releasePrefetchEffect()
        //   requestIdleCallback(() => {
        //     preFetchInSerial(apps)
        //   })
        // }
        // const releasePrefetchEffect = (): void => {
        //   window.removeEventListener('load', handleOnLoad)
        //   clearTimeout(preFetchTime)
        // }
        // window.addEventListener('load', handleOnLoad)
    }
    function preFetchInSerial(apps) {
        isFunction$1(apps) && (apps = apps());
        if (isArray$1(apps)) {
            apps.reduce((pre, next) => pre.then(() => preFetchAction(next)), Promise.resolve());
        }
    }
    // sequential preload app
    function preFetchAction(options) {
        return promiseRequestIdle((resolve) => {
            var _a, _b, _c, _d, _e, _f;
            if (isPlainObject$1(options) && navigator.onLine) {
                options.name = formatAppName(options.name);
                options.url = formatAppURL(options.url, options.name);
                if (options.name && options.url && !appInstanceMap.has(options.name)) {
                    const app = new CreateApp({
                        name: options.name,
                        url: options.url,
                        isPrefetch: true,
                        scopecss: !((_b = (_a = options['disable-scopecss']) !== null && _a !== void 0 ? _a : options.disableScopecss) !== null && _b !== void 0 ? _b : microApp.options['disable-scopecss']),
                        useSandbox: !((_d = (_c = options['disable-sandbox']) !== null && _c !== void 0 ? _c : options.disableSandbox) !== null && _d !== void 0 ? _d : microApp.options['disable-sandbox']),
                        inline: (_e = options.inline) !== null && _e !== void 0 ? _e : microApp.options.inline,
                        iframe: (_f = options.iframe) !== null && _f !== void 0 ? _f : microApp.options.iframe,
                        prefetchLevel: options.level && PREFETCH_LEVEL.includes(options.level) ? options.level : microApp.options.prefetchLevel && PREFETCH_LEVEL.includes(microApp.options.prefetchLevel) ? microApp.options.prefetchLevel : 2,
                    });
                    const oldOnload = app.onLoad;
                    const oldOnLoadError = app.onLoadError;
                    app.onLoad = (onLoadParam) => {
                        if (app.isPrerender) {
                            assign(onLoadParam, {
                                defaultPage: options['default-page'],
                                /**
                                 * TODO: 预渲染支持disable-memory-router，默认渲染首页即可，文档中也要保留
                                 * 问题：
                                 *  1、如何确保子应用进行跳转时不影响到浏览器地址？？pure？？
                                 */
                                routerMode: getRouterMode(options['router-mode']),
                                baseroute: options.baseroute,
                                disablePatchRequest: options['disable-patch-request'],
                            });
                        }
                        resolve();
                        oldOnload.call(app, onLoadParam);
                    };
                    app.onLoadError = (...rests) => {
                        resolve();
                        oldOnLoadError.call(app, ...rests);
                    };
                }
                else {
                    resolve();
                }
            }
            else {
                resolve();
            }
        });
    }
    /**
     * load global assets into cache
     * @param assets global assets of js, css
     */
    function getGlobalAssets(assets) {
        if (isPlainObject$1(assets)) {
            requestIdleCallback(() => {
                fetchGlobalResources(assets.js, 'js', sourceCenter.script);
                fetchGlobalResources(assets.css, 'css', sourceCenter.link);
            });
        }
    }
    // TODO: requestIdleCallback for every file
    function fetchGlobalResources(resources, suffix, sourceHandler) {
        if (isArray$1(resources)) {
            const effectiveResource = resources.filter((path) => isString$1(path) && path.includes(`.${suffix}`) && !sourceHandler.hasInfo(path));
            const fetchResourcePromise = effectiveResource.map((path) => fetchSource(path));
            // fetch resource with stream
            promiseStream(fetchResourcePromise, (res) => {
                const path = effectiveResource[res.index];
                if (suffix === 'js') {
                    if (!sourceHandler.hasInfo(path)) {
                        sourceHandler.setInfo(path, {
                            code: res.data,
                            isExternal: false,
                            appSpace: {},
                        });
                    }
                }
                else {
                    if (!sourceHandler.hasInfo(path)) {
                        sourceHandler.setInfo(path, {
                            code: res.data,
                            appSpace: {}
                        });
                    }
                }
            }, (err) => {
                logError(err);
            });
        }
    }

    /**
     * if app not prefetch & not unmount, then app is active
     * @param excludeHiddenApp exclude hidden keep-alive app, default is false
     * @param excludePreRender exclude pre render app
     * @returns active apps
     */
    function getActiveApps({ excludeHiddenApp = false, excludePreRender = false, } = {}) {
        const activeApps = [];
        appInstanceMap.forEach((app, appName) => {
            if (!app.isUnmounted() &&
                (!app.isPrefetch || (app.isPrerender && !excludePreRender)) &&
                (!excludeHiddenApp ||
                    !app.isHidden())) {
                activeApps.push(appName);
            }
        });
        return activeApps;
    }
    // get all registered apps
    function getAllApps() {
        return Array.from(appInstanceMap.keys());
    }
    /**
     * unmount app by appName
     * @param appName
     * @param options unmountAppOptions
     * @returns Promise<void>
     */
    function unmountApp(appName, options) {
        const app = appInstanceMap.get(formatAppName(appName));
        return new Promise((resolve) => {
            if (app) {
                if (app.isUnmounted() || app.isPrefetch) {
                    if (app.isPrerender) {
                        app.unmount({
                            destroy: !!(options === null || options === void 0 ? void 0 : options.destroy),
                            clearData: !!(options === null || options === void 0 ? void 0 : options.clearData),
                            keepRouteState: false,
                            unmountcb: resolve.bind(null, true)
                        });
                    }
                    else {
                        if (options === null || options === void 0 ? void 0 : options.destroy)
                            app.actionsForCompletelyDestroy();
                        resolve(true);
                    }
                }
                else if (app.isHidden()) {
                    if (options === null || options === void 0 ? void 0 : options.destroy) {
                        app.unmount({
                            destroy: true,
                            clearData: true,
                            keepRouteState: true,
                            unmountcb: resolve.bind(null, true)
                        });
                    }
                    else if (options === null || options === void 0 ? void 0 : options.clearAliveState) {
                        app.unmount({
                            destroy: false,
                            clearData: !!options.clearData,
                            keepRouteState: true,
                            unmountcb: resolve.bind(null, true)
                        });
                    }
                    else {
                        resolve(true);
                    }
                }
                else {
                    const container = getRootContainer(app.container);
                    const unmountHandler = () => {
                        container.removeEventListener(lifeCycles.UNMOUNT, unmountHandler);
                        container.removeEventListener(lifeCycles.AFTERHIDDEN, afterhiddenHandler);
                        resolve(true);
                    };
                    const afterhiddenHandler = () => {
                        container.removeEventListener(lifeCycles.UNMOUNT, unmountHandler);
                        container.removeEventListener(lifeCycles.AFTERHIDDEN, afterhiddenHandler);
                        resolve(true);
                    };
                    container.addEventListener(lifeCycles.UNMOUNT, unmountHandler);
                    container.addEventListener(lifeCycles.AFTERHIDDEN, afterhiddenHandler);
                    if (options === null || options === void 0 ? void 0 : options.destroy) {
                        let destroyAttrValue, destoryAttrValue;
                        container.hasAttribute('destroy') && (destroyAttrValue = container.getAttribute('destroy'));
                        container.hasAttribute('destory') && (destoryAttrValue = container.getAttribute('destory'));
                        container.setAttribute('destroy', 'true');
                        container.parentNode.removeChild(container);
                        container.removeAttribute('destroy');
                        isString$1(destroyAttrValue) && container.setAttribute('destroy', destroyAttrValue);
                        isString$1(destoryAttrValue) && container.setAttribute('destory', destoryAttrValue);
                    }
                    else if ((options === null || options === void 0 ? void 0 : options.clearAliveState) && container.hasAttribute('keep-alive')) {
                        const keepAliveAttrValue = container.getAttribute('keep-alive');
                        container.removeAttribute('keep-alive');
                        let clearDataAttrValue = null;
                        if (options.clearData) {
                            clearDataAttrValue = container.getAttribute('clear-data');
                            container.setAttribute('clear-data', 'true');
                        }
                        container.parentNode.removeChild(container);
                        container.setAttribute('keep-alive', keepAliveAttrValue);
                        isString$1(clearDataAttrValue) && container.setAttribute('clear-data', clearDataAttrValue);
                    }
                    else {
                        let clearDataAttrValue = null;
                        if (options === null || options === void 0 ? void 0 : options.clearData) {
                            clearDataAttrValue = container.getAttribute('clear-data');
                            container.setAttribute('clear-data', 'true');
                        }
                        container.parentNode.removeChild(container);
                        isString$1(clearDataAttrValue) && container.setAttribute('clear-data', clearDataAttrValue);
                    }
                }
            }
            else {
                logWarn(`app ${appName} does not exist`);
                resolve(false);
            }
        });
    }
    // unmount all apps in turn
    function unmountAllApps(options) {
        return Array.from(appInstanceMap.keys()).reduce((pre, next) => pre.then(() => unmountApp(next, options)), Promise.resolve(true));
    }
    /**
     * Re render app from the command line
     * microApp.reload(destroy)
     * @param appName app.name
     * @param destroy unmount app with destroy mode
     * @returns Promise<boolean>
     */
    function reload(appName, destroy) {
        return new Promise((resolve) => {
            const app = appInstanceMap.get(formatAppName(appName));
            if (app) {
                const rootContainer = app.container && getRootContainer(app.container);
                if (rootContainer) {
                    resolve(rootContainer.reload(destroy));
                }
                else {
                    logWarn(`app ${appName} is not rendered, cannot use reload`);
                    resolve(false);
                }
            }
            else {
                logWarn(`app ${appName} does not exist`);
                resolve(false);
            }
        });
    }
    /**
     * Manually render app
     * @param options RenderAppOptions
     * @returns Promise<boolean>
     */
    function renderApp(options) {
        return new Promise((resolve) => {
            if (!isPlainObject$1(options))
                return logError('renderApp options must be an object');
            const container = isElement(options.container) ? options.container : isString$1(options.container) ? document.querySelector(options.container) : null;
            if (!isElement(container))
                return logError('Target container is not a DOM element.');
            const microAppElement = pureCreateElement(microApp.tagName);
            for (const attr in options) {
                if (attr === 'onDataChange') {
                    if (isFunction$1(options[attr])) {
                        microAppElement.addEventListener('datachange', options[attr]);
                    }
                }
                else if (attr === 'lifeCycles') {
                    const lifeCycleConfig = options[attr];
                    if (isPlainObject$1(lifeCycleConfig)) {
                        for (const lifeName in lifeCycleConfig) {
                            if (lifeName.toUpperCase() in lifeCycles && isFunction$1(lifeCycleConfig[lifeName])) {
                                microAppElement.addEventListener(lifeName.toLowerCase(), lifeCycleConfig[lifeName]);
                            }
                        }
                    }
                }
                else if (attr !== 'container') {
                    microAppElement.setAttribute(attr, options[attr]);
                }
            }
            const handleMount = () => {
                releaseListener();
                resolve(true);
            };
            const handleError = () => {
                releaseListener();
                resolve(false);
            };
            const releaseListener = () => {
                microAppElement.removeEventListener(lifeCycles.MOUNTED, handleMount);
                microAppElement.removeEventListener(lifeCycles.ERROR, handleError);
            };
            microAppElement.addEventListener(lifeCycles.MOUNTED, handleMount);
            microAppElement.addEventListener(lifeCycles.ERROR, handleError);
            container.appendChild(microAppElement);
        });
    }
    /**
     * get app state
     * @param appName app.name
     * @returns app.state
     */
    function getAppStatus(appName) {
        const app = appInstanceMap.get(formatAppName(appName));
        if (app) {
            return app.getLifeCycleState();
        }
        else {
            logWarn(`app ${appName} does not exist`);
        }
    }
    class MicroApp extends EventCenterForBaseApp {
        constructor() {
            super(...arguments);
            this.tagName = 'micro-app';
            this.hasInit = false;
            this.options = {};
            this.router = router;
            this.preFetch = preFetch;
            this.unmountApp = unmountApp;
            this.unmountAllApps = unmountAllApps;
            this.getActiveApps = getActiveApps;
            this.getAllApps = getAllApps;
            this.reload = reload;
            this.renderApp = renderApp;
            this.getAppStatus = getAppStatus;
        }
        start(options) {
            var _a, _b;
            if (!isBrowser || !window.customElements) {
                return logError('micro-app is not supported in this environment');
            }
            /**
             * TODO: 优化代码和逻辑
             *  1、同一个基座中initGlobalEnv不能被多次执行，否则会导致死循环
             *  2、判断逻辑是否放在initGlobalEnv中合适？--- 不合适
             */
            if (this.hasInit) {
                return logError('microApp.start executed repeatedly');
            }
            this.hasInit = true;
            if (options === null || options === void 0 ? void 0 : options.tagName) {
                if (/^micro-app(-\S+)?/.test(options.tagName)) {
                    this.tagName = options.tagName;
                }
                else {
                    return logError(`${options.tagName} is invalid tagName`);
                }
            }
            initGlobalEnv();
            if (globalEnv.rawWindow.customElements.get(this.tagName)) {
                return logWarn(`element ${this.tagName} is already defined`);
            }
            if (isPlainObject$1(options)) {
                this.options = options;
                options['disable-scopecss'] = (_a = options['disable-scopecss']) !== null && _a !== void 0 ? _a : options.disableScopecss;
                options['disable-sandbox'] = (_b = options['disable-sandbox']) !== null && _b !== void 0 ? _b : options.disableSandbox;
                // load app assets when browser is idle
                options.preFetchApps && preFetch(options.preFetchApps);
                // load global assets when browser is idle
                options.globalAssets && getGlobalAssets(options.globalAssets);
                if (isPlainObject$1(options.plugins)) {
                    const modules = options.plugins.modules;
                    if (isPlainObject$1(modules)) {
                        for (const appName in modules) {
                            const formattedAppName = formatAppName(appName);
                            if (formattedAppName && appName !== formattedAppName) {
                                modules[formattedAppName] = modules[appName];
                                delete modules[appName];
                            }
                        }
                    }
                }
            }
            // define customElement after init
            defineElement(this.tagName);
        }
    }
    const microApp = new MicroApp();

    function bind(fn, thisArg) {
      return function wrap() {
        return fn.apply(thisArg, arguments);
      };
    }

    // utils is a library of generic helper functions non-specific to axios

    const {toString} = Object.prototype;
    const {getPrototypeOf} = Object;
    const {iterator, toStringTag} = Symbol;

    const kindOf = (cache => thing => {
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));

    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type
    };

    const typeOfTest = type => thing => typeof thing === type;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     *
     * @returns {boolean} True if value is an Array, otherwise false
     */
    const {isArray} = Array;

    /**
     * Determine if a value is undefined
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    const isUndefined = typeOfTest('undefined');

    /**
     * Determine if a value is a Buffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    const isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      let result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a String, otherwise false
     */
    const isString = typeOfTest('string');

    /**
     * Determine if a value is a Function
     *
     * @param {*} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    const isFunction = typeOfTest('function');

    /**
     * Determine if a value is a Number
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Number, otherwise false
     */
    const isNumber = typeOfTest('number');

    /**
     * Determine if a value is an Object
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an Object, otherwise false
     */
    const isObject = (thing) => thing !== null && typeof thing === 'object';

    /**
     * Determine if a value is a Boolean
     *
     * @param {*} thing The value to test
     * @returns {boolean} True if value is a Boolean, otherwise false
     */
    const isBoolean = thing => thing === true || thing === false;

    /**
     * Determine if a value is a plain Object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a plain Object, otherwise false
     */
    const isPlainObject = (val) => {
      if (kindOf(val) !== 'object') {
        return false;
      }

      const prototype = getPrototypeOf(val);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(toStringTag in val) && !(iterator in val);
    };

    /**
     * Determine if a value is a Date
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Date, otherwise false
     */
    const isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    const isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Stream
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    const isStream = (val) => isObject(val) && isFunction(val.pipe);

    /**
     * Determine if a value is a FormData
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    const isFormData = (thing) => {
      let kind;
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) || (
          isFunction(thing.append) && (
            (kind = kindOf(thing)) === 'formdata' ||
            // detect form-data instance
            (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
          )
        )
      )
    };

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    const isURLSearchParams = kindOfTest('URLSearchParams');

    const [isReadableStream, isRequest, isResponse, isHeaders] = ['ReadableStream', 'Request', 'Response', 'Headers'].map(kindOfTest);

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     *
     * @returns {String} The String freed of excess whitespace
     */
    const trim = (str) => str.trim ?
      str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     *
     * @param {Boolean} [allOwnKeys = false]
     * @returns {any}
     */
    function forEach(obj, fn, {allOwnKeys = false} = {}) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      let i;
      let l;

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;

        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }

    function findKey(obj, key) {
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }

    const _global = (() => {
      /*eslint no-undef:0*/
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
    })();

    const isContextDefined = (context) => !isUndefined(context) && context !== _global;

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     *
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      const {caseless} = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
          result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
          result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
          result[targetKey] = val.slice();
        } else {
          result[targetKey] = val;
        }
      };

      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     *
     * @param {Boolean} [allOwnKeys]
     * @returns {Object} The resulting value of object a
     */
    const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, {allOwnKeys});
      return a;
    };

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     *
     * @returns {string} content value without BOM
     */
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    };

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     *
     * @returns {void}
     */
    const inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function|Boolean} [filter]
     * @param {Function} [propFilter]
     *
     * @returns {Object}
     */
    const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};

      destObj = destObj || {};
      // eslint-disable-next-line no-eq-null,eqeqeq
      if (sourceObj == null) return destObj;

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    };

    /**
     * Determines whether a string ends with the characters of a specified string
     *
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     *
     * @returns {boolean}
     */
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };


    /**
     * Returns new array from array like object or null if failed
     *
     * @param {*} [thing]
     *
     * @returns {?Array}
     */
    const toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };

    /**
     * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
     * thing passed in is an instance of Uint8Array
     *
     * @param {TypedArray}
     *
     * @returns {Array}
     */
    // eslint-disable-next-line func-names
    const isTypedArray = (TypedArray => {
      // eslint-disable-next-line func-names
      return thing => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

    /**
     * For each entry in the object, call the function with the key and value.
     *
     * @param {Object<any, any>} obj - The object to iterate over.
     * @param {Function} fn - The function to call for each entry.
     *
     * @returns {void}
     */
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[iterator];

      const _iterator = generator.call(obj);

      let result;

      while ((result = _iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };

    /**
     * It takes a regular expression and a string, and returns an array of all the matches
     *
     * @param {string} regExp - The regular expression to match against.
     * @param {string} str - The string to search.
     *
     * @returns {Array<boolean>}
     */
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];

      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }

      return arr;
    };

    /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
    const isHTMLForm = kindOfTest('HTMLFormElement');

    const toCamelCase = str => {
      return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };

    /* Creating a function that will check if an object has a property. */
    const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

    /**
     * Determine if a value is a RegExp object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a RegExp object, otherwise false
     */
    const isRegExp = kindOfTest('RegExp');

    const reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};

      forEach(descriptors, (descriptor, name) => {
        let ret;
        if ((ret = reducer(descriptor, name, obj)) !== false) {
          reducedDescriptors[name] = ret || descriptor;
        }
      });

      Object.defineProperties(obj, reducedDescriptors);
    };

    /**
     * Makes all methods read-only
     * @param {Object} obj
     */

    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        // skip restricted props in strict mode
        if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
          return false;
        }

        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not rewrite read-only method \'' + name + '\'');
          };
        }
      });
    };

    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};

      const define = (arr) => {
        arr.forEach(value => {
          obj[value] = true;
        });
      };

      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

      return obj;
    };

    const noop = () => {};

    const toFiniteNumber = (value, defaultValue) => {
      return value != null && Number.isFinite(value = +value) ? value : defaultValue;
    };

    /**
     * If the thing is a FormData object, return true, otherwise return false.
     *
     * @param {unknown} thing - The thing to check.
     *
     * @returns {boolean}
     */
    function isSpecCompliantForm(thing) {
      return !!(thing && isFunction(thing.append) && thing[toStringTag] === 'FormData' && thing[iterator]);
    }

    const toJSONObject = (obj) => {
      const stack = new Array(10);

      const visit = (source, i) => {

        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }

          if(!('toJSON' in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};

            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });

            stack[i] = undefined;

            return target;
          }
        }

        return source;
      };

      return visit(obj, 0);
    };

    const isAsyncFn = kindOfTest('AsyncFunction');

    const isThenable = (thing) =>
      thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

    // original code
    // https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

    const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
      if (setImmediateSupported) {
        return setImmediate;
      }

      return postMessageSupported ? ((token, callbacks) => {
        _global.addEventListener("message", ({source, data}) => {
          if (source === _global && data === token) {
            callbacks.length && callbacks.shift()();
          }
        }, false);

        return (cb) => {
          callbacks.push(cb);
          _global.postMessage(token, "*");
        }
      })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
    })(
      typeof setImmediate === 'function',
      isFunction(_global.postMessage)
    );

    const asap = typeof queueMicrotask !== 'undefined' ?
      queueMicrotask.bind(_global) : ( typeof process !== 'undefined' && process.nextTick || _setImmediate);

    // *********************


    const isIterable = (thing) => thing != null && isFunction(thing[iterator]);


    var utils$1 = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isReadableStream,
      isRequest,
      isResponse,
      isHeaders,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable,
      setImmediate: _setImmediate,
      asap,
      isIterable
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    function AxiosError$1(message, code, config, request, response) {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack;
      }

      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      if (response) {
        this.response = response;
        this.status = response.status ? response.status : null;
      }
    }

    utils$1.inherits(AxiosError$1, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: utils$1.toJSONObject(this.config),
          code: this.code,
          status: this.status
        };
      }
    });

    const prototype$1 = AxiosError$1.prototype;
    const descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED',
      'ERR_NOT_SUPPORT',
      'ERR_INVALID_URL'
    // eslint-disable-next-line func-names
    ].forEach(code => {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError$1, descriptors);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError$1.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);

      utils$1.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      }, prop => {
        return prop !== 'isAxiosError';
      });

      AxiosError$1.call(axiosError, error.message, code, config, request, response);

      axiosError.cause = error;

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    // eslint-disable-next-line strict
    var httpAdapter = null;

    /**
     * Determines if the given thing is a array or js object.
     *
     * @param {string} thing - The object or array to be visited.
     *
     * @returns {boolean}
     */
    function isVisitable(thing) {
      return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
    }

    /**
     * It removes the brackets from the end of a string
     *
     * @param {string} key - The key of the parameter.
     *
     * @returns {string} the key without the brackets.
     */
    function removeBrackets(key) {
      return utils$1.endsWith(key, '[]') ? key.slice(0, -2) : key;
    }

    /**
     * It takes a path, a key, and a boolean, and returns a string
     *
     * @param {string} path - The path to the current key.
     * @param {string} key - The key of the current object being iterated over.
     * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
     *
     * @returns {string} The path to the current key.
     */
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      }).join(dots ? '.' : '');
    }

    /**
     * If the array is an array and none of its elements are visitable, then it's a flat array.
     *
     * @param {Array<any>} arr - The array to check
     *
     * @returns {boolean}
     */
    function isFlatArray(arr) {
      return utils$1.isArray(arr) && !arr.some(isVisitable);
    }

    const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });

    /**
     * Convert a data object to FormData
     *
     * @param {Object} obj
     * @param {?Object} [formData]
     * @param {?Object} [options]
     * @param {Function} [options.visitor]
     * @param {Boolean} [options.metaTokens = true]
     * @param {Boolean} [options.dots = false]
     * @param {?Boolean} [options.indexes = false]
     *
     * @returns {Object}
     **/

    /**
     * It converts an object into a FormData object
     *
     * @param {Object<any, any>} obj - The object to convert to form data.
     * @param {string} formData - The FormData object to append to.
     * @param {Object<string, any>} options
     *
     * @returns
     */
    function toFormData$1(obj, formData, options) {
      if (!utils$1.isObject(obj)) {
        throw new TypeError('target must be an object');
      }

      // eslint-disable-next-line no-param-reassign
      formData = formData || new (FormData)();

      // eslint-disable-next-line no-param-reassign
      options = utils$1.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils$1.isUndefined(source[option]);
      });

      const metaTokens = options.metaTokens;
      // eslint-disable-next-line no-use-before-define
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
      const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);

      if (!utils$1.isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
      }

      function convertValue(value) {
        if (value === null) return '';

        if (utils$1.isDate(value)) {
          return value.toISOString();
        }

        if (!useBlob && utils$1.isBlob(value)) {
          throw new AxiosError$1('Blob is not supported. Use a Buffer instead.');
        }

        if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
          return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      /**
       * Default visitor.
       *
       * @param {*} value
       * @param {String|Number} key
       * @param {Array<String|Number>} path
       * @this {FormData}
       *
       * @returns {boolean} return true to visit the each prop of the value recursively
       */
      function defaultVisitor(value, key, path) {
        let arr = value;

        if (value && !path && typeof value === 'object') {
          if (utils$1.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            key = metaTokens ? key : key.slice(0, -2);
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (
            (utils$1.isArray(value) && isFlatArray(value)) ||
            ((utils$1.isFileList(value) || utils$1.endsWith(key, '[]')) && (arr = utils$1.toArray(value))
            )) {
            // eslint-disable-next-line no-param-reassign
            key = removeBrackets(key);

            arr.forEach(function each(el, index) {
              !(utils$1.isUndefined(el) || el === null) && formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
                convertValue(el)
              );
            });
            return false;
          }
        }

        if (isVisitable(value)) {
          return true;
        }

        formData.append(renderKey(path, key, dots), convertValue(value));

        return false;
      }

      const stack = [];

      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });

      function build(value, path) {
        if (utils$1.isUndefined(value)) return;

        if (stack.indexOf(value) !== -1) {
          throw Error('Circular reference detected in ' + path.join('.'));
        }

        stack.push(value);

        utils$1.forEach(value, function each(el, key) {
          const result = !(utils$1.isUndefined(el) || el === null) && visitor.call(
            formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers
          );

          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });

        stack.pop();
      }

      if (!utils$1.isObject(obj)) {
        throw new TypeError('data must be an object');
      }

      build(obj);

      return formData;
    }

    /**
     * It encodes a string by replacing all characters that are not in the unreserved set with
     * their percent-encoded equivalents
     *
     * @param {string} str - The string to encode.
     *
     * @returns {string} The encoded string.
     */
    function encode$1(str) {
      const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }

    /**
     * It takes a params object and converts it to a FormData object
     *
     * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
     * @param {Object<string, any>} options - The options object passed to the Axios constructor.
     *
     * @returns {void}
     */
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];

      params && toFormData$1(params, this, options);
    }

    const prototype = AxiosURLSearchParams.prototype;

    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };

    prototype.toString = function toString(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;

      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '').join('&');
    };

    /**
     * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
     * URI encoded counterparts
     *
     * @param {string} val The value to be encoded.
     *
     * @returns {string} The encoded value.
     */
    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @param {?(object|Function)} options
     *
     * @returns {string} The formatted url
     */
    function buildURL(url, params, options) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }
      
      const _encode = options && options.encode || encode;

      if (utils$1.isFunction(options)) {
        options = {
          serialize: options
        };
      } 

      const serializeFn = options && options.serialize;

      let serializedParams;

      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils$1.isURLSearchParams(params) ?
          params.toString() :
          new AxiosURLSearchParams(params, options).toString(_encode);
      }

      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");

        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    }

    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }

      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils$1.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }

    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

    var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

    var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

    var platform$1 = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
      },
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
    };

    const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

    const _navigator = typeof navigator === 'object' && navigator || undefined;

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     *
     * @returns {boolean}
     */
    const hasStandardBrowserEnv = hasBrowserEnv &&
      (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

    /**
     * Determine if we're running in a standard browser webWorker environment
     *
     * Although the `isStandardBrowserEnv` method indicates that
     * `allows axios to run in a web worker`, the WebWorker will still be
     * filtered out due to its judgment standard
     * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
     * This leads to a problem when axios post `FormData` in webWorker
     */
    const hasStandardBrowserWebWorkerEnv = (() => {
      return (
        typeof WorkerGlobalScope !== 'undefined' &&
        // eslint-disable-next-line no-undef
        self instanceof WorkerGlobalScope &&
        typeof self.importScripts === 'function'
      );
    })();

    const origin = hasBrowserEnv && window.location.href || 'http://localhost';

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        hasBrowserEnv: hasBrowserEnv,
        hasStandardBrowserEnv: hasStandardBrowserEnv,
        hasStandardBrowserWebWorkerEnv: hasStandardBrowserWebWorkerEnv,
        navigator: _navigator,
        origin: origin
    });

    var platform = {
      ...utils,
      ...platform$1
    };

    function toURLEncodedForm(data, options) {
      return toFormData$1(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils$1.isBuffer(value)) {
            this.append(key, value.toString('base64'));
            return false;
          }

          return helpers.defaultVisitor.apply(this, arguments);
        }
      }, options));
    }

    /**
     * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
     *
     * @param {string} name - The name of the property to get.
     *
     * @returns An array of strings.
     */
    function parsePropPath(name) {
      // foo[x][y][z]
      // foo.x.y.z
      // foo-x-y-z
      // foo x y z
      return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
        return match[0] === '[]' ? '' : match[1] || match[0];
      });
    }

    /**
     * Convert an array to an object.
     *
     * @param {Array<any>} arr - The array to convert to an object.
     *
     * @returns An object with the same keys and values as the array.
     */
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }

    /**
     * It takes a FormData object and returns a JavaScript object
     *
     * @param {string} formData The FormData object to convert to JSON.
     *
     * @returns {Object<string, any> | null} The converted object.
     */
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index) {
        let name = path[index++];

        if (name === '__proto__') return true;

        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils$1.isArray(target) ? target.length : name;

        if (isLast) {
          if (utils$1.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }

          return !isNumericKey;
        }

        if (!target[name] || !utils$1.isObject(target[name])) {
          target[name] = [];
        }

        const result = buildPath(path, value, target[name], index);

        if (result && utils$1.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }

        return !isNumericKey;
      }

      if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
        const obj = {};

        utils$1.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });

        return obj;
      }

      return null;
    }

    /**
     * It takes a string, tries to parse it, and if it fails, it returns the stringified version
     * of the input
     *
     * @param {any} rawValue - The value to be stringified.
     * @param {Function} parser - A function that parses a string into a JavaScript object.
     * @param {Function} encoder - A function that takes a value and returns a string.
     *
     * @returns {string} A stringified version of the rawValue.
     */
    function stringifySafely(rawValue, parser, encoder) {
      if (utils$1.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils$1.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    const defaults = {

      transitional: transitionalDefaults,

      adapter: ['xhr', 'http', 'fetch'],

      transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils$1.isObject(data);

        if (isObjectPayload && utils$1.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils$1.isFormData(data);

        if (isFormData) {
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (utils$1.isArrayBuffer(data) ||
          utils$1.isBuffer(data) ||
          utils$1.isStream(data) ||
          utils$1.isFile(data) ||
          utils$1.isBlob(data) ||
          utils$1.isReadableStream(data)
        ) {
          return data;
        }
        if (utils$1.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils$1.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if ((isFileList = utils$1.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
            const _FormData = this.env && this.env.FormData;

            return toFormData$1(
              isFileList ? {'files[]': data} : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType ) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
          return data;
        }

        if (data && utils$1.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError$1.from(e, AxiosError$1.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': undefined
        }
      }
    };

    utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
      defaults.headers[method] = {};
    });

    // RawAxiosHeaders whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    const ignoreDuplicateOf = utils$1.toObjectSet([
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ]);

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} rawHeaders Headers needing to be parsed
     *
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = rawHeaders => {
      const parsed = {};
      let key;
      let val;
      let i;

      rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

      return parsed;
    };

    const $internals = Symbol('internals');

    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }

    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }

      return utils$1.isArray(value) ? value.map(normalizeValue) : String(value);
    }

    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;

      while ((match = tokensRE.exec(str))) {
        tokens[match[1]] = match[2];
      }

      return tokens;
    }

    const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

    function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
      if (utils$1.isFunction(filter)) {
        return filter.call(this, value, header);
      }

      if (isHeaderNameFilter) {
        value = header;
      }

      if (!utils$1.isString(value)) return;

      if (utils$1.isString(filter)) {
        return value.indexOf(filter) !== -1;
      }

      if (utils$1.isRegExp(filter)) {
        return filter.test(value);
      }
    }

    function formatHeader(header) {
      return header.trim()
        .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
          return char.toUpperCase() + str;
        });
    }

    function buildAccessors(obj, header) {
      const accessorName = utils$1.toCamelCase(' ' + header);

      ['get', 'set', 'has'].forEach(methodName => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }

    let AxiosHeaders$1 = class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }

      set(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = utils$1.findKey(self, lHeader);

          if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
            self[key || _header] = normalizeValue(_value);
          }
        }

        const setHeaders = (headers, _rewrite) =>
          utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

        if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if(utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
          let obj = {}, dest, key;
          for (const entry of header) {
            if (!utils$1.isArray(entry)) {
              throw TypeError('Object iterator must return a key-value pair');
            }

            obj[key = entry[0]] = (dest = obj[key]) ?
              (utils$1.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]]) : entry[1];
          }

          setHeaders(obj, valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      }

      get(header, parser) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils$1.findKey(this, header);

          if (key) {
            const value = this[key];

            if (!parser) {
              return value;
            }

            if (parser === true) {
              return parseTokens(value);
            }

            if (utils$1.isFunction(parser)) {
              return parser.call(this, value, key);
            }

            if (utils$1.isRegExp(parser)) {
              return parser.exec(value);
            }

            throw new TypeError('parser must be boolean|regexp|function');
          }
        }
      }

      has(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils$1.findKey(this, header);

          return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      }

      delete(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = utils$1.findKey(self, _header);

            if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
              delete self[key];

              deleted = true;
            }
          }
        }

        if (utils$1.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }

        return deleted;
      }

      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;

        while (i--) {
          const key = keys[i];
          if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }

        return deleted;
      }

      normalize(format) {
        const self = this;
        const headers = {};

        utils$1.forEach(this, (value, header) => {
          const key = utils$1.findKey(headers, header);

          if (key) {
            self[key] = normalizeValue(value);
            delete self[header];
            return;
          }

          const normalized = format ? formatHeader(header) : String(header).trim();

          if (normalized !== header) {
            delete self[header];
          }

          self[normalized] = normalizeValue(value);

          headers[normalized] = true;
        });

        return this;
      }

      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }

      toJSON(asStrings) {
        const obj = Object.create(null);

        utils$1.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
        });

        return obj;
      }

      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }

      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
      }

      getSetCookie() {
        return this.get("set-cookie") || [];
      }

      get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
      }

      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }

      static concat(first, ...targets) {
        const computed = new this(first);

        targets.forEach((target) => computed.set(target));

        return computed;
      }

      static accessor(header) {
        const internals = this[$internals] = (this[$internals] = {
          accessors: {}
        });

        const accessors = internals.accessors;
        const prototype = this.prototype;

        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);

          if (!accessors[lHeader]) {
            buildAccessors(prototype, _header);
            accessors[lHeader] = true;
          }
        }

        utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

        return this;
      }
    };

    AxiosHeaders$1.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

    // reserved names hotfix
    utils$1.reduceDescriptors(AxiosHeaders$1.prototype, ({value}, key) => {
      let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
      return {
        get: () => value,
        set(headerValue) {
          this[mapped] = headerValue;
        }
      }
    });

    utils$1.freezeMethods(AxiosHeaders$1);

    /**
     * Transform the data for a request or a response
     *
     * @param {Array|Function} fns A single function or Array of functions
     * @param {?Object} response The response object
     *
     * @returns {*} The resulting transformed data
     */
    function transformData(fns, response) {
      const config = this || defaults;
      const context = response || config;
      const headers = AxiosHeaders$1.from(context.headers);
      let data = context.data;

      utils$1.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
      });

      headers.normalize();

      return data;
    }

    function isCancel$1(value) {
      return !!(value && value.__CANCEL__);
    }

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    function CanceledError$1(message, config, request) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError$1.call(this, message == null ? 'canceled' : message, AxiosError$1.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
    }

    utils$1.inherits(CanceledError$1, AxiosError$1, {
      __CANCEL__: true
    });

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     *
     * @returns {object} The response.
     */
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError$1(
          'Request failed with status code ' + response.status,
          [AxiosError$1.ERR_BAD_REQUEST, AxiosError$1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

    /**
     * Calculate data maxRate
     * @param {Number} [samplesCount= 10]
     * @param {Number} [min= 1000]
     * @returns {Function}
     */
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;

      min = min !== undefined ? min : 1000;

      return function push(chunkLength) {
        const now = Date.now();

        const startedAt = timestamps[tail];

        if (!firstSampleTS) {
          firstSampleTS = now;
        }

        bytes[head] = chunkLength;
        timestamps[head] = now;

        let i = tail;
        let bytesCount = 0;

        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }

        head = (head + 1) % samplesCount;

        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }

        if (now - firstSampleTS < min) {
          return;
        }

        const passed = startedAt && now - startedAt;

        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
      };
    }

    /**
     * Throttle decorator
     * @param {Function} fn
     * @param {Number} freq
     * @return {Function}
     */
    function throttle(fn, freq) {
      let timestamp = 0;
      let threshold = 1000 / freq;
      let lastArgs;
      let timer;

      const invoke = (args, now = Date.now()) => {
        timestamp = now;
        lastArgs = null;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        fn.apply(null, args);
      };

      const throttled = (...args) => {
        const now = Date.now();
        const passed = now - timestamp;
        if ( passed >= threshold) {
          invoke(args, now);
        } else {
          lastArgs = args;
          if (!timer) {
            timer = setTimeout(() => {
              timer = null;
              invoke(lastArgs);
            }, threshold - passed);
          }
        }
      };

      const flush = () => lastArgs && invoke(lastArgs);

      return [throttled, flush];
    }

    const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);

      return throttle(e => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;

        bytesNotified = loaded;

        const data = {
          loaded,
          total,
          progress: total ? (loaded / total) : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event: e,
          lengthComputable: total != null,
          [isDownloadStream ? 'download' : 'upload']: true
        };

        listener(data);
      }, freq);
    };

    const progressEventDecorator = (total, throttled) => {
      const lengthComputable = total != null;

      return [(loaded) => throttled[0]({
        lengthComputable,
        total,
        loaded
      }), throttled[1]];
    };

    const asyncDecorator = (fn) => (...args) => utils$1.asap(() => fn(...args));

    var isURLSameOrigin = platform.hasStandardBrowserEnv ? ((origin, isMSIE) => (url) => {
      url = new URL(url, platform.origin);

      return (
        origin.protocol === url.protocol &&
        origin.host === url.host &&
        (isMSIE || origin.port === url.port)
      );
    })(
      new URL(platform.origin),
      platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
    ) : () => true;

    var cookies = platform.hasStandardBrowserEnv ?

      // Standard browser envs support document.cookie
      {
        write(name, value, expires, path, domain, secure) {
          const cookie = [name + '=' + encodeURIComponent(value)];

          utils$1.isNumber(expires) && cookie.push('expires=' + new Date(expires).toGMTString());

          utils$1.isString(path) && cookie.push('path=' + path);

          utils$1.isString(domain) && cookie.push('domain=' + domain);

          secure === true && cookie.push('secure');

          document.cookie = cookie.join('; ');
        },

        read(name) {
          const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      }

      :

      // Non-standard browser env (web workers, react-native) lack needed support.
      {
        write() {},
        read() {
          return null;
        },
        remove() {}
      };

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     *
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     *
     * @returns {string} The combined URL
     */
    function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    }

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     *
     * @returns {string} The combined full path
     */
    function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
      let isRelativeUrl = !isAbsoluteURL(requestedURL);
      if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }

    const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? { ...thing } : thing;

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     *
     * @returns {Object} New object resulting from merging config2 to config1
     */
    function mergeConfig$1(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      const config = {};

      function getMergedValue(target, source, prop, caseless) {
        if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
          return utils$1.merge.call({caseless}, target, source);
        } else if (utils$1.isPlainObject(source)) {
          return utils$1.merge({}, source);
        } else if (utils$1.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(a, b, prop , caseless) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(a, b, prop , caseless);
        } else if (!utils$1.isUndefined(a)) {
          return getMergedValue(undefined, a, prop , caseless);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(a, b) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(undefined, b);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(a, b) {
        if (!utils$1.isUndefined(b)) {
          return getMergedValue(undefined, b);
        } else if (!utils$1.isUndefined(a)) {
          return getMergedValue(undefined, a);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
          return getMergedValue(a, b);
        } else if (prop in config1) {
          return getMergedValue(undefined, a);
        }
      }

      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        withXSRFToken: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b , prop) => mergeDeepProperties(headersToObject(a), headersToObject(b),prop, true)
      };

      utils$1.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    var resolveConfig = (config) => {
      const newConfig = mergeConfig$1({}, config);

      let {data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth} = newConfig;

      newConfig.headers = headers = AxiosHeaders$1.from(headers);

      newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);

      // HTTP basic authentication
      if (auth) {
        headers.set('Authorization', 'Basic ' +
          btoa((auth.username || '') + ':' + (auth.password ? unescape(encodeURIComponent(auth.password)) : ''))
        );
      }

      let contentType;

      if (utils$1.isFormData(data)) {
        if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
          headers.setContentType(undefined); // Let the browser set it
        } else if ((contentType = headers.getContentType()) !== false) {
          // fix semicolon duplication issue for ReactNative FormData implementation
          const [type, ...tokens] = contentType ? contentType.split(';').map(token => token.trim()).filter(Boolean) : [];
          headers.setContentType([type || 'multipart/form-data', ...tokens].join('; '));
        }
      }

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.

      if (platform.hasStandardBrowserEnv) {
        withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

        if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
          // Add xsrf header
          const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

          if (xsrfValue) {
            headers.set(xsrfHeaderName, xsrfValue);
          }
        }
      }

      return newConfig;
    };

    const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

    var xhrAdapter = isXHRAdapterSupported && function (config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        const _config = resolveConfig(config);
        let requestData = _config.data;
        const requestHeaders = AxiosHeaders$1.from(_config.headers).normalize();
        let {responseType, onUploadProgress, onDownloadProgress} = _config;
        let onCanceled;
        let uploadThrottled, downloadThrottled;
        let flushUpload, flushDownload;

        function done() {
          flushUpload && flushUpload(); // flush events
          flushDownload && flushDownload(); // flush events

          _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

          _config.signal && _config.signal.removeEventListener('abort', onCanceled);
        }

        let request = new XMLHttpRequest();

        request.open(_config.method.toUpperCase(), _config.url, true);

        // Set the request timeout in MS
        request.timeout = _config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders$1.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
            request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError$1('Request aborted', AxiosError$1.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError$1('Network Error', AxiosError$1.ERR_NETWORK, config, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = _config.timeout ? 'timeout of ' + _config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = _config.transitional || transitionalDefaults;
          if (_config.timeoutErrorMessage) {
            timeoutErrorMessage = _config.timeoutErrorMessage;
          }
          reject(new AxiosError$1(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError$1.ETIMEDOUT : AxiosError$1.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils$1.isUndefined(_config.withCredentials)) {
          request.withCredentials = !!_config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = _config.responseType;
        }

        // Handle progress if needed
        if (onDownloadProgress) {
          ([downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true));
          request.addEventListener('progress', downloadThrottled);
        }

        // Not all browsers support upload events
        if (onUploadProgress && request.upload) {
          ([uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress));

          request.upload.addEventListener('progress', uploadThrottled);

          request.upload.addEventListener('loadend', flushUpload);
        }

        if (_config.cancelToken || _config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = cancel => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError$1(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
          if (_config.signal) {
            _config.signal.aborted ? onCanceled() : _config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(_config.url);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError$1('Unsupported protocol ' + protocol + ':', AxiosError$1.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData || null);
      });
    };

    const composeSignals = (signals, timeout) => {
      const {length} = (signals = signals ? signals.filter(Boolean) : []);

      if (timeout || length) {
        let controller = new AbortController();

        let aborted;

        const onabort = function (reason) {
          if (!aborted) {
            aborted = true;
            unsubscribe();
            const err = reason instanceof Error ? reason : this.reason;
            controller.abort(err instanceof AxiosError$1 ? err : new CanceledError$1(err instanceof Error ? err.message : err));
          }
        };

        let timer = timeout && setTimeout(() => {
          timer = null;
          onabort(new AxiosError$1(`timeout ${timeout} of ms exceeded`, AxiosError$1.ETIMEDOUT));
        }, timeout);

        const unsubscribe = () => {
          if (signals) {
            timer && clearTimeout(timer);
            timer = null;
            signals.forEach(signal => {
              signal.unsubscribe ? signal.unsubscribe(onabort) : signal.removeEventListener('abort', onabort);
            });
            signals = null;
          }
        };

        signals.forEach((signal) => signal.addEventListener('abort', onabort));

        const {signal} = controller;

        signal.unsubscribe = () => utils$1.asap(unsubscribe);

        return signal;
      }
    };

    const streamChunk = function* (chunk, chunkSize) {
      let len = chunk.byteLength;

      if (len < chunkSize) {
        yield chunk;
        return;
      }

      let pos = 0;
      let end;

      while (pos < len) {
        end = pos + chunkSize;
        yield chunk.slice(pos, end);
        pos = end;
      }
    };

    const readBytes = async function* (iterable, chunkSize) {
      for await (const chunk of readStream(iterable)) {
        yield* streamChunk(chunk, chunkSize);
      }
    };

    const readStream = async function* (stream) {
      if (stream[Symbol.asyncIterator]) {
        yield* stream;
        return;
      }

      const reader = stream.getReader();
      try {
        for (;;) {
          const {done, value} = await reader.read();
          if (done) {
            break;
          }
          yield value;
        }
      } finally {
        await reader.cancel();
      }
    };

    const trackStream = (stream, chunkSize, onProgress, onFinish) => {
      const iterator = readBytes(stream, chunkSize);

      let bytes = 0;
      let done;
      let _onFinish = (e) => {
        if (!done) {
          done = true;
          onFinish && onFinish(e);
        }
      };

      return new ReadableStream({
        async pull(controller) {
          try {
            const {done, value} = await iterator.next();

            if (done) {
             _onFinish();
              controller.close();
              return;
            }

            let len = value.byteLength;
            if (onProgress) {
              let loadedBytes = bytes += len;
              onProgress(loadedBytes);
            }
            controller.enqueue(new Uint8Array(value));
          } catch (err) {
            _onFinish(err);
            throw err;
          }
        },
        cancel(reason) {
          _onFinish(reason);
          return iterator.return();
        }
      }, {
        highWaterMark: 2
      })
    };

    const isFetchSupported = typeof fetch === 'function' && typeof Request === 'function' && typeof Response === 'function';
    const isReadableStreamSupported = isFetchSupported && typeof ReadableStream === 'function';

    // used only inside the fetch adapter
    const encodeText = isFetchSupported && (typeof TextEncoder === 'function' ?
        ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) :
        async (str) => new Uint8Array(await new Response(str).arrayBuffer())
    );

    const test = (fn, ...args) => {
      try {
        return !!fn(...args);
      } catch (e) {
        return false
      }
    };

    const supportsRequestStream = isReadableStreamSupported && test(() => {
      let duplexAccessed = false;

      const hasContentType = new Request(platform.origin, {
        body: new ReadableStream(),
        method: 'POST',
        get duplex() {
          duplexAccessed = true;
          return 'half';
        },
      }).headers.has('Content-Type');

      return duplexAccessed && !hasContentType;
    });

    const DEFAULT_CHUNK_SIZE = 64 * 1024;

    const supportsResponseStream = isReadableStreamSupported &&
      test(() => utils$1.isReadableStream(new Response('').body));


    const resolvers = {
      stream: supportsResponseStream && ((res) => res.body)
    };

    isFetchSupported && (((res) => {
      ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach(type => {
        !resolvers[type] && (resolvers[type] = utils$1.isFunction(res[type]) ? (res) => res[type]() :
          (_, config) => {
            throw new AxiosError$1(`Response type '${type}' is not supported`, AxiosError$1.ERR_NOT_SUPPORT, config);
          });
      });
    })(new Response));

    const getBodyLength = async (body) => {
      if (body == null) {
        return 0;
      }

      if(utils$1.isBlob(body)) {
        return body.size;
      }

      if(utils$1.isSpecCompliantForm(body)) {
        const _request = new Request(platform.origin, {
          method: 'POST',
          body,
        });
        return (await _request.arrayBuffer()).byteLength;
      }

      if(utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
        return body.byteLength;
      }

      if(utils$1.isURLSearchParams(body)) {
        body = body + '';
      }

      if(utils$1.isString(body)) {
        return (await encodeText(body)).byteLength;
      }
    };

    const resolveBodyLength = async (headers, body) => {
      const length = utils$1.toFiniteNumber(headers.getContentLength());

      return length == null ? getBodyLength(body) : length;
    };

    var fetchAdapter = isFetchSupported && (async (config) => {
      let {
        url,
        method,
        data,
        signal,
        cancelToken,
        timeout,
        onDownloadProgress,
        onUploadProgress,
        responseType,
        headers,
        withCredentials = 'same-origin',
        fetchOptions
      } = resolveConfig(config);

      responseType = responseType ? (responseType + '').toLowerCase() : 'text';

      let composedSignal = composeSignals([signal, cancelToken && cancelToken.toAbortSignal()], timeout);

      let request;

      const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
          composedSignal.unsubscribe();
      });

      let requestContentLength;

      try {
        if (
          onUploadProgress && supportsRequestStream && method !== 'get' && method !== 'head' &&
          (requestContentLength = await resolveBodyLength(headers, data)) !== 0
        ) {
          let _request = new Request(url, {
            method: 'POST',
            body: data,
            duplex: "half"
          });

          let contentTypeHeader;

          if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
            headers.setContentType(contentTypeHeader);
          }

          if (_request.body) {
            const [onProgress, flush] = progressEventDecorator(
              requestContentLength,
              progressEventReducer(asyncDecorator(onUploadProgress))
            );

            data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
          }
        }

        if (!utils$1.isString(withCredentials)) {
          withCredentials = withCredentials ? 'include' : 'omit';
        }

        // Cloudflare Workers throws when credentials are defined
        // see https://github.com/cloudflare/workerd/issues/902
        const isCredentialsSupported = "credentials" in Request.prototype;
        request = new Request(url, {
          ...fetchOptions,
          signal: composedSignal,
          method: method.toUpperCase(),
          headers: headers.normalize().toJSON(),
          body: data,
          duplex: "half",
          credentials: isCredentialsSupported ? withCredentials : undefined
        });

        let response = await fetch(request);

        const isStreamResponse = supportsResponseStream && (responseType === 'stream' || responseType === 'response');

        if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
          const options = {};

          ['status', 'statusText', 'headers'].forEach(prop => {
            options[prop] = response[prop];
          });

          const responseContentLength = utils$1.toFiniteNumber(response.headers.get('content-length'));

          const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
            responseContentLength,
            progressEventReducer(asyncDecorator(onDownloadProgress), true)
          ) || [];

          response = new Response(
            trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
              flush && flush();
              unsubscribe && unsubscribe();
            }),
            options
          );
        }

        responseType = responseType || 'text';

        let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || 'text'](response, config);

        !isStreamResponse && unsubscribe && unsubscribe();

        return await new Promise((resolve, reject) => {
          settle(resolve, reject, {
            data: responseData,
            headers: AxiosHeaders$1.from(response.headers),
            status: response.status,
            statusText: response.statusText,
            config,
            request
          });
        })
      } catch (err) {
        unsubscribe && unsubscribe();

        if (err && err.name === 'TypeError' && /Load failed|fetch/i.test(err.message)) {
          throw Object.assign(
            new AxiosError$1('Network Error', AxiosError$1.ERR_NETWORK, config, request),
            {
              cause: err.cause || err
            }
          )
        }

        throw AxiosError$1.from(err, err && err.code, config, request);
      }
    });

    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter,
      fetch: fetchAdapter
    };

    utils$1.forEach(knownAdapters, (fn, value) => {
      if (fn) {
        try {
          Object.defineProperty(fn, 'name', {value});
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {value});
      }
    });

    const renderReason = (reason) => `- ${reason}`;

    const isResolvedHandle = (adapter) => utils$1.isFunction(adapter) || adapter === null || adapter === false;

    var adapters = {
      getAdapter: (adapters) => {
        adapters = utils$1.isArray(adapters) ? adapters : [adapters];

        const {length} = adapters;
        let nameOrAdapter;
        let adapter;

        const rejectedReasons = {};

        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters[i];
          let id;

          adapter = nameOrAdapter;

          if (!isResolvedHandle(nameOrAdapter)) {
            adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

            if (adapter === undefined) {
              throw new AxiosError$1(`Unknown adapter '${id}'`);
            }
          }

          if (adapter) {
            break;
          }

          rejectedReasons[id || '#' + i] = adapter;
        }

        if (!adapter) {

          const reasons = Object.entries(rejectedReasons)
            .map(([id, state]) => `adapter ${id} ` +
              (state === false ? 'is not supported by the environment' : 'is not available in the build')
            );

          let s = length ?
            (reasons.length > 1 ? 'since :\n' + reasons.map(renderReason).join('\n') : ' ' + renderReason(reasons[0])) :
            'as no adapter specified';

          throw new AxiosError$1(
            `There is no suitable adapter to dispatch the request ` + s,
            'ERR_NOT_SUPPORT'
          );
        }

        return adapter;
      },
      adapters: knownAdapters
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     *
     * @param {Object} config The config that is to be used for the request
     *
     * @returns {void}
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError$1(null, config);
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      config.headers = AxiosHeaders$1.from(config.headers);

      // Transform request data
      config.data = transformData.call(
        config,
        config.transformRequest
      );

      if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
      }

      const adapter = adapters.getAdapter(config.adapter || defaults.adapter);

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );

        response.headers = AxiosHeaders$1.from(response.headers);

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel$1(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      });
    }

    const VERSION$1 = "1.9.0";

    const validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    const deprecatedWarnings = {};

    /**
     * Transitional option validator
     *
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     *
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION$1 + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError$1(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError$1.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    validators$1.spelling = function spelling(correctSpelling) {
      return (value, opt) => {
        // eslint-disable-next-line no-console
        console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
        return true;
      }
    };

    /**
     * Assert object's properties type
     *
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     *
     * @returns {object}
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError$1('options must be an object', AxiosError$1.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
          const value = options[opt];
          const result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError$1('option ' + opt + ' must be ' + result, AxiosError$1.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError$1('Unknown option ' + opt, AxiosError$1.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions,
      validators: validators$1
    };

    const validators = validator.validators;

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     *
     * @return {Axios} A new instance of Axios
     */
    let Axios$1 = class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig || {};
        this.interceptors = {
          request: new InterceptorManager(),
          response: new InterceptorManager()
        };
      }

      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      async request(configOrUrl, config) {
        try {
          return await this._request(configOrUrl, config);
        } catch (err) {
          if (err instanceof Error) {
            let dummy = {};

            Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

            // slice off the Error: ... line
            const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
            try {
              if (!err.stack) {
                err.stack = stack;
                // match without the 2 top stack lines
              } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
                err.stack += '\n' + stack;
              }
            } catch (e) {
              // ignore the case where "stack" is an un-writable property
            }
          }

          throw err;
        }
      }

      _request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig$1(this.defaults, config);

        const {transitional, paramsSerializer, headers} = config;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        if (paramsSerializer != null) {
          if (utils$1.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator.assertOptions(paramsSerializer, {
              encode: validators.function,
              serialize: validators.function
            }, true);
          }
        }

        // Set config.allowAbsoluteUrls
        if (config.allowAbsoluteUrls !== undefined) ; else if (this.defaults.allowAbsoluteUrls !== undefined) {
          config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
        } else {
          config.allowAbsoluteUrls = true;
        }

        validator.assertOptions(config, {
          baseUrl: validators.spelling('baseURL'),
          withXsrfToken: validators.spelling('withXSRFToken')
        }, true);

        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();

        // Flatten headers
        let contextHeaders = headers && utils$1.merge(
          headers.common,
          headers[config.method]
        );

        headers && utils$1.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          (method) => {
            delete headers[method];
          }
        );

        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise;
        let i = 0;
        let len;

        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), undefined];
          chain.unshift.apply(chain, requestInterceptorChain);
          chain.push.apply(chain, responseInterceptorChain);
          len = chain.length;

          promise = Promise.resolve(config);

          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }

          return promise;
        }

        len = requestInterceptorChain.length;

        let newConfig = config;

        i = 0;

        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }

        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        i = 0;
        len = responseInterceptorChain.length;

        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }

        return promise;
      }

      getUri(config) {
        config = mergeConfig$1(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    };

    // Provide aliases for supported request methods
    utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios$1.prototype[method] = function(url, config) {
        return this.request(mergeConfig$1(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });

    utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig$1(config || {}, {
            method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url,
            data
          }));
        };
      }

      Axios$1.prototype[method] = generateHTTPMethod();

      Axios$1.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @param {Function} executor The executor function.
     *
     * @returns {CancelToken}
     */
    let CancelToken$1 = class CancelToken {
      constructor(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        let resolvePromise;

        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });

        const token = this;

        // eslint-disable-next-line func-names
        this.promise.then(cancel => {
          if (!token._listeners) return;

          let i = token._listeners.length;

          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });

        // eslint-disable-next-line func-names
        this.promise.then = onfulfilled => {
          let _resolve;
          // eslint-disable-next-line func-names
          const promise = new Promise(resolve => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message, config, request) {
          if (token.reason) {
            // Cancellation has already been requested
            return;
          }

          token.reason = new CanceledError$1(message, config, request);
          resolvePromise(token.reason);
        });
      }

      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */

      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */

      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }

      toAbortSignal() {
        const controller = new AbortController();

        const abort = (err) => {
          controller.abort(err);
        };

        this.subscribe(abort);

        controller.signal.unsubscribe = () => this.unsubscribe(abort);

        return controller.signal;
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    };

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     *
     * @returns {Function}
     */
    function spread$1(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    }

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     *
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    function isAxiosError$1(payload) {
      return utils$1.isObject(payload) && (payload.isAxiosError === true);
    }

    const HttpStatusCode$1 = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
    };

    Object.entries(HttpStatusCode$1).forEach(([key, value]) => {
      HttpStatusCode$1[value] = key;
    });

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     *
     * @returns {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      const context = new Axios$1(defaultConfig);
      const instance = bind(Axios$1.prototype.request, context);

      // Copy axios.prototype to instance
      utils$1.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

      // Copy context to instance
      utils$1.extend(instance, context, null, {allOwnKeys: true});

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig$1(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    const axios = createInstance(defaults);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios$1;

    // Expose Cancel & CancelToken
    axios.CanceledError = CanceledError$1;
    axios.CancelToken = CancelToken$1;
    axios.isCancel = isCancel$1;
    axios.VERSION = VERSION$1;
    axios.toFormData = toFormData$1;

    // Expose AxiosError class
    axios.AxiosError = AxiosError$1;

    // alias for CanceledError for backward compatibility
    axios.Cancel = axios.CanceledError;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };

    axios.spread = spread$1;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError$1;

    // Expose mergeConfig
    axios.mergeConfig = mergeConfig$1;

    axios.AxiosHeaders = AxiosHeaders$1;

    axios.formToJSON = thing => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

    axios.getAdapter = adapters.getAdapter;

    axios.HttpStatusCode = HttpStatusCode$1;

    axios.default = axios;

    // This module is intended to unwrap Axios default export as named.
    // Keep top-level export same with static properties
    // so that it can keep same with es module or cjs
    const {
      Axios,
      AxiosError,
      CanceledError,
      isCancel,
      CancelToken,
      VERSION,
      all,
      Cancel,
      isAxiosError,
      spread,
      toFormData,
      AxiosHeaders,
      HttpStatusCode,
      formToJSON,
      getAdapter,
      mergeConfig
    } = axios;

    // 创建容器
    document.body.innerHTML = `
  <div id="app-container">
    <h1>Micro App 主应用</h1>
  </div>    
`;
    // 启动 micro-app
    microApp.start({
       
        fetch(url, options) {
          axios.defaults.headers.common["Accept"] = "*/*";
          return axios({ url, ...options }).then((res) => {
            return res.data;
          });
        },
        excludeAssetFilter (assetUrl) {
          console.log('excludeAssetFilter111', assetUrl);
          if (assetUrl.includes('cocos-js')) {
            return true // 返回true则micro-app不会劫持处理当前文件
          }
          return false
        }
    });


    const container = document.getElementById('app-container');
    const url = location.href.includes('https') ? location.origin + '/testMicro/cocos.html' : location.origin + '/cocos.html';

      microApp.renderApp({
        name: 'subapp',
        url: url,
        inline: true,
        container: container,
        disableSandbox: true,
        destory: true,
        lifeCycles: {
          created: () => {
            console.log('micro-app元素被创建');
          },
          beforemount: () => {
            console.log('即将被渲染');
          },
          mounted: () => {
            console.log('渲染完毕');
          },
          unmount: () => {
            console.log('已经卸载');
          },
          error: (e) => {
            console.log('渲染出错', e);
          },
        },
      });
    // 渲染子应用

})();
//# sourceMappingURL=bundle.sdnafwi3tp.js.map
