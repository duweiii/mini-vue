'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var EShapeFlags;
(function (EShapeFlags) {
    EShapeFlags[EShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    EShapeFlags[EShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    EShapeFlags[EShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    EShapeFlags[EShapeFlags["ARRAY_CHILDREN"] = 8] = "ARRAY_CHILDREN";
})(EShapeFlags || (EShapeFlags = {}));

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= EShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= EShapeFlags.ARRAY_CHILDREN;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? EShapeFlags.ELEMENT : EShapeFlags.STATEFUL_COMPONENT;
}

const isObject = (value) => {
    return typeof value === 'object';
};
const hasOwn = (object, key) => {
    return Object.prototype.hasOwnProperty.call(object, key);
};

let targetMap = new Map();
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

function initProps(instance, props) {
    // 如果instance.props为undefined
    // 那在调用 setup 时，进行 shallowReadonly 处理就会报错。
    // 所以在这对undefined做兼容处理
    instance.props = props || {};
}

const publicPropertiesMap = {
    $el: instance => instance.vnode.el,
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

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        el: null,
        setupState: {},
        props: null,
    };
    return instance;
}
function setupComponent(instance) {
    // instance.proxy = new Proxy(instance.ctx, instanceProxyHandlers)
    initProps(instance, instance.vnode.props);
    // initSlots
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
        setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponent(instance);
}
function finishComponent(instance) {
    const component = instance.type;
    instance.render = component.render;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (vnode.shapeFlag & EShapeFlags.ELEMENT) {
        processElement(vnode, container);
    }
    else if (vnode.shapeFlag & EShapeFlags.STATEFUL_COMPONENT) {
        propcessComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    let el = (vnode.el = document.createElement(vnode.type));
    const { props } = vnode;
    const isOn = (key) => /^on[A-Z]/.test(key);
    for (const attr in props) {
        const value = props[attr];
        if (isOn(attr)) {
            let eventType = attr.slice(2).toLowerCase();
            el.addEventListener(eventType, value);
        }
        else {
            el.setAttribute(attr, value);
        }
    }
    const { children } = vnode;
    if (vnode.shapeFlag & EShapeFlags.TEXT_CHILDREN) {
        el.innerText = children;
    }
    else if (vnode.shapeFlag & EShapeFlags.ARRAY_CHILDREN) {
        mountChildren(children, el);
    }
    container.append(el);
}
function mountChildren(children, container) {
    children.forEach(child => patch(child, container));
}
function propcessComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const { proxy } = instance;
    window.self = proxy;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    instance.vnode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vNode = createVNode(rootComponent);
            render(vNode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
