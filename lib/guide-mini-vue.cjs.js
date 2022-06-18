'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

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
    patch(vnode);
}
function patch(vnode, container) {
    propcessComponent(vnode);
}
function propcessComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vNode = createVNode(rootComponent);
            render(vNode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
