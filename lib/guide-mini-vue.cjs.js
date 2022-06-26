'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var EShapeFlags;
(function (EShapeFlags) {
    EShapeFlags[EShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    EShapeFlags[EShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    EShapeFlags[EShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    EShapeFlags[EShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
    EShapeFlags[EShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(EShapeFlags || (EShapeFlags = {}));

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
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

const extend = Object.assign;
const isObject = (value) => {
    return typeof value === 'object';
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
    // 通过 target key 找到对应的依赖容器，收集依赖
    dep.add(activeEffect);
    // 反向收集，标注当前的类，存在于哪些集合中
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
        // 这里是为了处理只使用reactive 但不使用effect的情况下
        // 触发get进行依赖收集时，收集到的是个undefined，因为没有effect配合暴露依赖
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
        if (key === "__v_isReactive" /* ERactiveFlags.isReactive */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonlu" /* ERactiveFlags.isReadonly */) {
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

function reactive(obj) {
    return createActiveObject(obj, reactiveHandlers);
}
function readOnly(obj) {
    return createActiveObject(obj, readonlyHandlers);
}
function shallowReadonly(obj) {
    return createActiveObject(obj, shallowReadonlyHandlers);
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
            /**
             * 这里为什么需要进行双重判断 ？
             * 既要target[key]是 ref, 也要value 不是 ref
             * - - - - - - - - - - -
             * 因为如果 target[key] 是ref，且value也是ref，就会出现 ref.value 还是 ref 的情况
             * 这显然与我们在定义 Ref 时定义的不一样。
             * ref.value 要么是一个原始值，要么是一个对象。而是一个对象的话，也是用reactive处理过后返回的proxy对象
             * 所以只有当 target[key] 是 ref，而 value 不是 ref 时，执行target[key].value = value;
             * 后续不管这个value是原始值，还是对象，都会在Ref的set中被做对应处理。
             * 而在其他情况中，
             *  1. target[key]不是一个ref，那就正常给对象的key赋值；
             *  2. 或者target[key]跟value都是ref，那就用新的ref覆盖旧的ref
             */
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
    // 如果instance.props为undefined
    // 那在调用 setup 时，进行 shallowReadonly 处理就会报错。
    // 所以在这对undefined做兼容处理
    instance.props = props || {};
}

function initSlots(instance, children) {
    // 并不是所有的组件实例都需要initSlots
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
};
const publicComponentHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // 如果要去取的值在setupState上，直接返回
        // if( key in setupState){
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // 但如果没再setupState中publicPropertiesMap
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
        // const setupContext = createSetupContext(instance);
        // const setupReadonlyProps = shallowReadonly(instance.props)
        // setupResult = setup(setupReadonlyProps, setupContext);
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
    instance.render = component.render;
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
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
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        hostInsert(textNode, container);
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
                // 老的children是string，新的是array
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
        console.log(c1);
        console.log(c2);
        // 1. 双端对比，确定变化范围
        // 向右对比
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
        // 向左对比
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
        // 现在确定变化范围了，进行处理
        // 首先处理有序的变化，比如单侧的添加删除
        if (i > e1) {
            if (i <= e2) {
                // 不改变顺序，纯添加
                /**
                 * 确认插入位置, 1. 左侧插入 2. 右侧插入
                 * 插入点应为 e2+1
                 * 对于左侧插入 c2[e2+1]自然可以获取到el
                 * 但是对于右侧插入， c2[e2+1]的vnode还没有进行渲染，是获取不到el的，el还是初始化时的null
                 * 但是还是需要判断的，比如 ab -> abc e2 为c的位置，c2[e2+1]是undefined
                 * 修改 insert 方法，换为insertBefore, 此 API 第二个参数如果为null，效果与append相同
                 */
                let nextPosition = e2 + 1;
                let anchor = nextPosition < c2.length ? c2[nextPosition].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2 && i <= e1) {
            // 单侧删除
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            /**
             * 这里就是 i < e1 && i < e2 的部分了。
             * 对这部分，
             * 1. 删除oldChildren里有，而newChildren中没有的vnod
             * 2. 处理oldChildren&newChildren都有的且需要改变位置的vnode
             * 3. 创建newChildren里有，而oldChildren中没有的vnode
             */
            let s1 = i;
            let s2 = i;
            let patched = 0;
            let toBePatched = e2 - s2 + 1;
            let newKeyToNewIndexMap = new Map();
            // 先创建一个newChildren中每一个child的key-index的字典，方便后续查找，降低时间复杂度
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
                // 对当前的 prevChild，判断他是否也在newChildren中
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
                // 根据newIndex做处理
                if (newIndex === undefined) {
                    // 删除
                    hostRemove(prevChild.el);
                }
                else {
                    patch(prevChild, c2[newIndex], container, parent, anchor);
                    patched++;
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
        mountComponent(n2, container, parent);
    }
    function mountComponent(n2, container, parent) {
        const instance = createComponentInstance(n2, parent);
        setupComponent(instance);
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                patch(null, subTree, container, instance, null);
                instance.vnode.el = subTree.el;
                instance.subTree = subTree;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const newTree = instance.render.call(proxy);
                const oldTree = instance.subTree;
                instance.subTree = newTree;
                patch(oldTree, newTree, container, instance, null);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
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

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.reactive = reactive;
exports.ref = ref;
exports.renderSlots = renderSlots;
