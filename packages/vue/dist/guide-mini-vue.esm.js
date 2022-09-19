function toDisplayString(value) {
    return String(value);
}

var EShapeFlags;
(function (EShapeFlags) {
    EShapeFlags[EShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    EShapeFlags[EShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    EShapeFlags[EShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    EShapeFlags[EShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    EShapeFlags[EShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(EShapeFlags || (EShapeFlags = {}));

const extend = Object.assign;
const isObject = (value) => {
    return typeof value === 'object';
};
const isString = (value) => {
    return typeof value === 'string';
};
const EMPTY_OBJECT = {};
const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue);
};
const hasOwn = (object, key) => {
    return Object.prototype.hasOwnProperty.call(object, key);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandleKey = (str) => {
    return 'on' + capitalize(str);
};

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        component: null,
        key: props && props.key,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= EShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= EShapeFlags.ARRAY_CHILDREN;
    }
    if (vnode.shapeFlag & EShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= EShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? EShapeFlags.ELEMENT : EShapeFlags.STATEFUL_COMPONENT;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, data) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(data));
        }
    }
}

let activeEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            if (this.onStop) {
                this.onStop();
            }
            cleanupEffect(this);
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
    effect.deps = [];
}
let targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return activeEffect !== undefined && shouldTrack;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect === null || effect === void 0 ? void 0 : effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect && effect.run();
        }
    }
}
function effect(fn, option = {}) {
    let _effect = new ReactiveEffect(fn, option === null || option === void 0 ? void 0 : option.scheduler);
    extend(_effect, option);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const reactiveGet = createGetters();
const reactiveSet = createSetters();
const readOnlyGet = createGetters(true);
const shallowReadonlyGet = createGetters(true, true);
function createGetters(isReadonly = false, shallowReadonly = false) {
    return function get(target, key) {
        let res = Reflect.get(target, key);
        if (key === "__v_isReactive") {
            return !isReadonly;
        }
        else if (key === "__v_isReadonlu") {
            return isReadonly;
        }
        if (!isReadonly) {
            track(target, key);
        }
        if (shallowReadonly) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readOnly(res) : reactive(res);
        }
        return res;
    };
}
function createSetters(isReadonly = false) {
    return function set(target, key, value) {
        let res = Reflect.set(target, key, value);
        if (!isReadonly) {
            trigger(target, key);
        }
        return res;
    };
}
const reactiveHandlers = {
    get: reactiveGet,
    set: reactiveSet
};
const readonlyHandlers = {
    get: readOnlyGet,
    set(target, key, value) {
        console.warn(`can't execute set, because this is a readOnly object`);
        return true;
    },
};
const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

var ERactiveFlags;
(function (ERactiveFlags) {
    ERactiveFlags["isReactive"] = "__v_isReactive";
    ERactiveFlags["isReadonly"] = "__v_isReadonlu";
})(ERactiveFlags || (ERactiveFlags = {}));
function reactive(obj) {
    return createActiveObject(obj, reactiveHandlers);
}
function readOnly(obj) {
    return createActiveObject(obj, readonlyHandlers);
}
function shallowReadonly(obj) {
    return createActiveObject(obj, shallowReadonlyHandlers);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function isReactive(obj) {
    let res = obj["__v_isReactive"];
    return !!res;
}
function isReadonly(obj) {
    let res = obj["__v_isReadonlu"];
    return !!res;
}
function createActiveObject(raw, handlers) {
    return new Proxy(raw, handlers);
}

class Ref {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefEffect(this.dep);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffect(this.dep);
        }
    }
}
function ref(value) {
    return new Ref(value);
}
function trackRefEffect(dep) {
    if (isTracking()) {
        trackEffect(dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(raw) {
    return new Proxy(raw, {
        get(target, key) {
            let res = Reflect.get(target, key);
            return unRef(res);
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                Reflect.set(target, key, value);
            }
            return true;
        }
    });
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handlerName = toHandleKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, props) {
    instance.props = props || {};
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & EShapeFlags.SLOT_CHILDREN) {
        normalizeSlotObject(instance, children);
    }
}
function normalizeSlotObject(instance, children) {
    const slots = {};
    for (let key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
    instance.slots = slots;
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

const publicPropertiesMap = {
    $el: instance => instance.vnode.el,
    $slots: instance => instance.slots,
    $props: instance => instance.props,
};
const publicComponentHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        type: vnode.type,
        el: null,
        setupState: {},
        props: null,
        parent,
        update: null,
        subTree: {},
        isMounted: false,
        provides: parent ? parent.provides : {},
        emit: () => { },
    };
    instance.emit = emit.bind(null, instance);
    return instance;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStateFulComponent(instance);
}
function setupStateFulComponent(instance) {
    instance.proxy = new Proxy({ _: instance }, publicComponentHandlers);
    const component = instance.type;
    const setup = component.setup;
    let setupResult;
    if (setup) {
        setCurrentInstance(instance);
        setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (compiler && !component.render) {
        if (component.template) {
            component.render = compiler(component.template);
        }
    }
    instance.render = component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerCompiler(_compiler) {
    compiler = _compiler;
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    let { provides } = currentInstance;
    const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
    if (provides === parentProvides) {
        provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    const { provides } = currentInstance.parent;
    if (key in provides) {
        return provides[key];
    }
    else if (defaultValue) {
        if (typeof defaultValue === 'function') {
            return defaultValue();
        }
        else {
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vNode = createVNode(rootComponent);
                render(vNode, rootContainer, null);
            }
        };
    };
}

const queue = [];
let isFlushPending = false;
let p = Promise.resolve();
function queueJobs(fn) {
    if (!queue.includes(fn)) {
        queue.push(fn);
        queueFlush();
    }
}
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, setElementText: hostSetElementText, remove: hostRemove } = options;
    function render(vnode, container, parent) {
        patch(null, vnode, container, parent, null);
    }
    function patch(n1, n2, container, parent, anchor) {
        const { type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (n2.shapeFlag & EShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parent, anchor);
                }
                else if (n2.shapeFlag & EShapeFlags.STATEFUL_COMPONENT) {
                    propcessComponent(n1, n2, container, parent);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parent) {
        mountChildren(n2.children, container, parent);
    }
    function processText(n1, n2, container) {
        if (!n1) {
            mountText(n1, n2, container);
        }
        else {
            updateText(n1, n2);
        }
    }
    function mountText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        hostInsert(textNode, container);
    }
    function updateText(n1, n2, container) {
        const el = n2.el = n1.el;
        const text = n2.children;
        hostSetElementText(el, text);
    }
    function processElement(n1, n2, container, parent, anchor) {
        if (!n1) {
            mountElement(n2, container, parent, anchor);
        }
        else {
            patchElement(n1, n2, container, parent, anchor);
        }
    }
    function patchElement(n1, n2, container, parent, anchor) {
        const el = (n2.el = n1.el);
        const oldProps = n1.props || EMPTY_OBJECT;
        const newProps = n2.props || EMPTY_OBJECT;
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el, parent, anchor);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevValue = oldProps[key];
                const newValue = newProps[key];
                if (prevValue !== newValue) {
                    hostPatchProp(el, key, prevValue, newValue);
                }
            }
            if (oldProps !== EMPTY_OBJECT) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parent, anchor) {
        const prevShapflag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & EShapeFlags.TEXT_CHILDREN) {
            if (prevShapflag & EShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1);
                hostSetElementText(container, c2);
            }
            else if (prevShapflag & EShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, c2);
            }
        }
        else if (shapeFlag & EShapeFlags.ARRAY_CHILDREN) {
            if (prevShapflag & EShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '');
                mountChildren(c2, container, parent);
            }
            else if (prevShapflag & EShapeFlags.ARRAY_CHILDREN) {
                patchKeyedChildren(c1, c2, container, parent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parent, anchor) {
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        let i = 0;
        while (i <= e1 && i <= e2) {
            const prevChild = c1[i];
            const nextChild = c2[i];
            if (isSameVNodeType(prevChild, nextChild)) {
                patch(prevChild, nextChild, container, parent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        while (i <= e1 && i <= e2) {
            const prevChild = c1[e1];
            const nextChild = c2[e2];
            if (isSameVNodeType(prevChild, nextChild)) {
                patch(prevChild, nextChild, container, parent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                let nextPosition = e2 + 1;
                let anchor = nextPosition < c2.length ? c2[nextPosition].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2 && i <= e1) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            let s1 = i;
            let s2 = i;
            let patched = 0;
            let toBePatched = e2 - s2 + 1;
            let newKeyToNewIndexMap = new Map();
            let newIndexToOldIndexMap = new Array(toBePatched).fill(0);
            let moved = false;
            let maxNewIndex = 0;
            for (let i = s2; i <= e2; i++) {
                let nextChild = c2[i];
                newKeyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                let prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = newKeyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        let nextChild = c2[j];
                        if (isSameVNodeType(prevChild, nextChild)) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex > maxNewIndex) {
                        maxNewIndex = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parent, anchor);
                    patched++;
                }
            }
            let increasingNewIndexSubsequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSubsequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const currentPosition = s2 + i;
                const nextPosition = currentPosition + 1;
                const anchor = nextPosition < c2.length ? c2[nextPosition].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, c2[currentPosition], container, parent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSubsequence[j]) {
                        hostInsert(c2[currentPosition].el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function isSameVNodeType(n1, n2) {
        return n1.key === n2.key && n1.type === n2.type;
    }
    function unmountChildren(children) {
        children.forEach(child => hostRemove(child.el));
    }
    function mountElement(vnode, container, parent, anchor) {
        let el = (vnode.el = hostCreateElement(vnode.type));
        const { props } = vnode;
        for (const attr in props) {
            const value = props[attr];
            hostPatchProp(el, attr, null, value);
        }
        const { children } = vnode;
        if (vnode.shapeFlag & EShapeFlags.TEXT_CHILDREN) {
            el.innerText = children;
        }
        else if (vnode.shapeFlag & EShapeFlags.ARRAY_CHILDREN) {
            mountChildren(children, el, parent);
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parent) {
        children.forEach(child => patch(null, child, container, parent, null));
    }
    function propcessComponent(n1, n2, container, parent) {
        if (!n1) {
            mountComponent(n2, container, parent);
        }
        else {
            updateComponent(n1, n2);
        }
    }
    function mountComponent(n2, container, parent) {
        const instance = n2.component = createComponentInstance(n2, parent);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function updateComponent(n1, n2, container, parent) {
        const instance = n2.component = n1.component;
        if (shouldComponentUpdate(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    function shouldComponentUpdate(n1, n2) {
        const { props: prevProps } = n1;
        const { props: nextProps } = n2;
        for (const key in prevProps) {
            let prevValue = prevProps[key];
            let nextValue = nextProps[key];
            if (prevValue !== nextValue) {
                return true;
            }
        }
        return false;
    }
    function setupRenderEffect(instance, container) {
        function handleRender() {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                patch(null, subTree, container, instance, null);
                instance.vnode.el = subTree.el;
                instance.subTree = subTree;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    transformProps(instance, next);
                }
                const newTree = instance.render.call(proxy, proxy);
                const oldTree = instance.subTree;
                instance.subTree = newTree;
                patch(oldTree, newTree, container, instance, null);
            }
        }
        instance.update = effect(handleRender, {
            scheduler: () => {
                queueJobs(instance.update);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}
function transformProps(instance, nextVNode) {
    instance.props = nextVNode.props;
    instance.vnode = nextVNode;
    instance.next = null;
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevValue, nextValue) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        let eventType = key.slice(2).toLowerCase();
        el.addEventListener(eventType, nextValue);
    }
    else {
        if (nextValue === undefined || nextValue === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextValue);
        }
    }
}
function insert(el, parent, anchor = null) {
    return parent.insertBefore(el, anchor);
}
function setElementText(el, text) {
    el.textContent = text;
}
function remove(el) {
    const parentNode = el.parentNode;
    if (parentNode) {
        parentNode.removeChild(el);
    }
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    setElementText,
    remove
});
function createApp(...args) {
    return renderer.createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    h: h,
    renderSlots: renderSlots,
    createTextVNode: createTextVNode,
    createElementVNode: createVNode,
    getCurrentInstance: getCurrentInstance,
    registerCompiler: registerCompiler,
    provide: provide,
    inject: inject,
    createRenderer: createRenderer,
    nextTick: nextTick,
    toDisplayString: toDisplayString,
    reactive: reactive,
    readOnly: readOnly,
    shallowReadonly: shallowReadonly,
    isReactive: isReactive,
    isProxy: isProxy,
    isReadonly: isReadonly,
    ref: ref,
    isRef: isRef,
    unRef: unRef,
    proxyRefs: proxyRefs,
    effect: effect,
    get EShapeFlags () { return EShapeFlags; },
    extend: extend,
    isObject: isObject,
    isString: isString,
    EMPTY_OBJECT: EMPTY_OBJECT,
    hasChanged: hasChanged,
    hasOwn: hasOwn,
    camelize: camelize,
    capitalize: capitalize,
    toHandleKey: toHandleKey
});

const TO_DISPLAY_STRING = Symbol('toDisplayString');
const CREATE_ELEMENT_VNODE = Symbol('createElementVNode');
const CREATE_TEXT_VNODE = Symbol('createTextVNode');
const helperMap = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [CREATE_ELEMENT_VNODE]: 'createElementVNode',
    [CREATE_TEXT_VNODE]: 'createTextVNode'
};

function generate(node) {
    const context = createCodegenContext();
    const { push } = context;
    const functionName = 'render';
    const args = ['_ctx', '_cache'];
    const signature = args.join(',');
    if (node.helpers.length > 0) {
        genFunctionPreamble(node, context);
    }
    push('return function ');
    push(`${functionName}(${signature}){return `);
    genNode(node.codegenNode, context);
    push("}");
    return {
        code: context.code
    };
}
function genFunctionPreamble(node, context) {
    const { push } = context;
    const VueBinging = 'Vue';
    const aliasHelpers = (s) => `${helperMap[s]}:_${helperMap[s]}`;
    const helpers = node.helpers;
    const declaration = `const { ${helpers.map(aliasHelpers)} } = ${VueBinging}`;
    push(declaration);
    push('\n');
}
function createCodegenContext() {
    const context = {
        code: '',
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMap[key]}`;
        }
    };
    return context;
}
function genNode(node, context) {
    switch (node.type) {
        case "text":
            genText(node, context);
            break;
        case "interpolation":
            genInterpolation(node, context);
            break;
        case "simple_expression":
            genExpression(node, context);
            break;
        case "element":
            genElement(node, context);
            break;
        case "compound_expression":
            genCompoundExpression(node, context);
            break;
    }
}
function genCompoundExpression(node, context) {
    textNodeWrapper(node, context, () => {
        const { children } = node;
        const { push } = context;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (isString(child)) {
                push(child);
            }
            else {
                genNode(child, context);
            }
        }
    });
}
function genElement(node, context) {
    const { helper, push } = context;
    const { tag, props } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    genNodeList(genNullable([tag, props]), context);
    genElementChildren(node, context);
    push(")");
}
function genElementChildren(node, context) {
    const { children } = node;
    const { push } = context;
    if (children.length !== 0) {
        push(', ');
    }
    const { addArrayWrapper } = node;
    addArrayWrapper && push('[');
    const length = children.length;
    for (let i = 0; i < length; i++) {
        const child = children[i];
        genNode(child, context);
        if (i < length - 1) {
            push(', ');
        }
    }
    addArrayWrapper && push(']');
}
function genNullable(args) {
    return args.map(arg => arg || 'null');
}
function genNodeList(nodes, context) {
    const { push } = context;
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        push(node);
        if (index < nodes.length - 1) {
            push(', ');
        }
    }
}
function genText(node, context) {
    textNodeWrapper(node, context, () => {
        const { push } = context;
        push(`'${node.content}'`);
    });
}
function genInterpolation(node, context) {
    textNodeWrapper(node, context, () => {
        const { push, helper } = context;
        push(`${helper(TO_DISPLAY_STRING)}(`);
        genNode(node.content, context);
        push(')');
    });
}
function genExpression(node, context) {
    const { push } = context;
    push(node.content);
}
function textNodeWrapper(node, context, fn) {
    const { addTextWrapper } = node;
    const { push, helper } = context;
    addTextWrapper && push(`${helper(CREATE_TEXT_VNODE)}(`);
    fn();
    addTextWrapper && push(')');
}

function baseParse(content) {
    let context = createContext(content);
    return createRoot(parseChildren(context, []));
}
function createRoot(children) {
    return {
        type: "root",
        children
    };
}
function createContext(content) {
    return {
        source: content
    };
}
function parseChildren(context, ancestor) {
    let nodes = [];
    let node;
    while (!isEnd(context, ancestor)) {
        if (context.source.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (context.source[0] === '<') {
            if (/[a-z]/i.test(context.source[1])) {
                node = parseElement(context, ancestor);
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestor) {
    let s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestor.length - 1; i >= 0; i--) {
            let tag = ancestor[i];
            if (startsWithCloseTagAndIsSameTag(context, tag)) {
                return true;
            }
        }
    }
    return !s;
}
function startsWithCloseTagAndIsSameTag(context, tag) {
    return context.source.startsWith("</") && tag.toLowerCase() === context.source.slice(2, 2 + tag.length).toLowerCase();
}
function parseElement(context, ancestor) {
    let element = parseTag(context, 0);
    ancestor.push(element.tag);
    element.children = parseChildren(context, ancestor);
    ancestor.pop();
    if (startsWithCloseTagAndIsSameTag(context, element.tag) && !loseEndTag(context, ancestor, element.tag)) {
        parseTag(context, 1);
    }
    else {
        throw new Error(`缺少结束标签${element.tag}`);
    }
    return element;
}
function loseEndTag(context, ancestor, tag) {
    const duplicateString = context.source;
    const endTagCountInSourceString = duplicateString.split(`</${tag}>`).length - 1;
    let tagCountInAncestor = 0;
    ancestor.forEach(item => {
        item === tag && tagCountInAncestor++;
    });
    return tagCountInAncestor + 1 !== endTagCountInSourceString;
}
function parseTag(context, type) {
    let match = /^<\/?([a-z]*)/i.exec(context.source);
    let tag = match[1];
    advanced(context, match[0].length);
    advanced(context, 1);
    if (type === 1)
        return;
    return {
        type: "element",
        tag,
    };
}
function parseText(context) {
    let endIndex = context.source.length;
    let endSymbol = ["<", "{{"];
    endSymbol.forEach((item) => {
        let index = context.source.indexOf(item);
        if (index !== -1 && index < endIndex) {
            endIndex = index;
        }
    });
    let content = parseTextData(context, endIndex);
    return {
        type: "text",
        content,
    };
}
function parseInterpolation(context) {
    let openDelimiter = "{{";
    let closeDelimiter = "}}";
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    advanced(context, openDelimiter.length);
    let rawLength = closeIndex - openDelimiter.length;
    let rawContent = parseTextData(context, rawLength);
    let content = rawContent.trim();
    advanced(context, closeDelimiter.length);
    return {
        type: "interpolation",
        content: {
            type: "simple_expression",
            content,
        }
    };
}
function parseTextData(context, length) {
    let content = context.source.slice(0, length);
    advanced(context, length);
    return content;
}
function advanced(context, leng) {
    context.source = context.source.slice(leng);
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    createCodegenNode(root);
    createHelpers(root, context);
}
function createHelpers(root, context) {
    root.helpers = [...context.helpers.keys()];
}
function createCodegenNode(root) {
    root.codegenNode = root.children[0];
}
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}
function traverseNode(node, context) {
    const { nodeTransforms } = context;
    let exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const cb = transform(node, context);
        cb && exitFns.push(cb);
    }
    switch (node.type) {
        case "root":
        case "element":
            traverseChildren(node, context);
            break;
        case "interpolation":
            context.helper(TO_DISPLAY_STRING);
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i] && exitFns[i]();
    }
}
function traverseChildren(node, context) {
    const { children } = node;
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
}

function isText(node) {
    return node.type === "text" || node.type === "interpolation";
}
function isElement(node) {
    return node.type === "element";
}
function shouldWrapTextNode(node) {
    return isText(node) || isCompound(node);
}
function isCompound(node) {
    return node.type === "compound_expression";
}

function transformChildren(node, context) {
    return () => {
        if (isElement(node)) {
            const { children } = node;
            const length = children.length;
            if (length === 1) {
                const child = children[0];
                if (isElement(child)) {
                    node.addArraySymbol = true;
                }
            }
            else if (length > 1) {
                node.addArrayWrapper = true;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (shouldWrapTextNode(child)) {
                        child.addTextWrapper = true;
                        context.helper(CREATE_TEXT_VNODE);
                    }
                }
            }
        }
    };
}

function transformElement(node, context) {
    if (isElement(node)) {
        return () => {
            context.helper(CREATE_ELEMENT_VNODE);
            const vnodeTag = `'${node.tag}'`;
            let vnodeProps;
            node.tag = vnodeTag;
            node.props = vnodeProps;
        };
    }
}

function transformExpression(node) {
    if (node.type === "interpolation") {
        const expressionNode = node.content;
        processExpression(expressionNode);
    }
}
const processExpression = (node) => {
    const rawContent = node.content;
    node.content = `_ctx.${rawContent}`;
};

function transformText(node) {
    if (isElement(node)) {
        return () => {
            const { children } = node;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                if (isText(child)) {
                    for (let j = i + 1; j < children.length; j++) {
                        let next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: "compound_expression",
                                    children: [child]
                                };
                            }
                            currentContainer.children.push(' + ');
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformChildren, transformElement, transformText]
    });
    return generate(ast);
}

function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function('Vue', code)(runtimeDom);
    return render;
}
registerCompiler(compileToFunction);

export { EMPTY_OBJECT, EShapeFlags, camelize, capitalize, createApp, createVNode as createElementVNode, createRenderer, createTextVNode, effect, extend, getCurrentInstance, h, hasChanged, hasOwn, inject, isObject, isProxy, isReactive, isReadonly, isRef, isString, nextTick, provide, proxyRefs, reactive, readOnly, ref, registerCompiler, renderSlots, shallowReadonly, toDisplayString, toHandleKey, unRef };
