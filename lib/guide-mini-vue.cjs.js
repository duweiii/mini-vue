'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createVNode(type, props, children) {
    return {
        type,
        props,
        children,
        el: null
    };
}

const isObject = (value) => {
    return typeof value === 'object';
};

const publicPropertiesMap = {
    $el: instance => instance.vnode.el,
};
const publicComponentHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        // 如果要去取的值在setupState上，直接返回
        if (key in setupState) {
            return setupState[key];
        }
        // 但如果没再setupState中
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
    };
    return instance;
}
function setupComponent(instance) {
    // instance.proxy = new Proxy(instance.ctx, instanceProxyHandlers)
    // initProps
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
        setupResult = setup();
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
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        propcessComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    let el = (vnode.el = document.createElement(vnode.type));
    const { props } = vnode;
    for (const attr in props) {
        const value = props[attr];
        el.setAttribute(attr, value);
    }
    const { children } = vnode;
    if (typeof children === 'string') {
        el.innerText = children;
    }
    else if (Array.isArray(children)) {
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
