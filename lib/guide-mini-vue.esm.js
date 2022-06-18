function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

const isObject = (value) => {
    return typeof value === 'object';
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
    let el = document.createElement(vnode.type);
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
    const subTree = instance.render();
    patch(subTree, container);
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

export { createApp, h };
