import { shallowReadonly, proxyRefs } from "@guide-mini-vue/reactivity";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { publicComponentHandlers } from "./publicComponentHandlers";
let currentInstance = null;
export function createComponentInstance(vnode, parent){
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
    emit: () => {},
  }

  instance.emit = emit.bind(null, instance) as any;

  return instance;
}

export function setupComponent(instance){
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStateFulComponent(instance)
}

export function setupStateFulComponent(instance){
  instance.proxy = new Proxy({_: instance}, publicComponentHandlers)
  const component = instance.type;
  const setup = component.setup;
  let setupResult;
  if( setup ){
    // const setupContext = createSetupContext(instance);
    // const setupReadonlyProps = shallowReadonly(instance.props)
    // setupResult = setup(setupReadonlyProps, setupContext);
    setCurrentInstance(instance)
    setupResult = setup( shallowReadonly(instance.props), {
      emit: instance.emit
    });
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult);
  }
}

export function handleSetupResult(instance, setupResult){
  if( typeof setupResult === 'object'){
    instance.setupState = proxyRefs(setupResult);
  }
  finishComponentSetup(instance);
}

export function finishComponentSetup(instance){
  const component = instance.type;
  if( compiler && !component.render ){
    if( component.template ){
      component.render = compiler(component.template);
    }
  }
  instance.render = component.render;
}

export function getCurrentInstance(){
  return currentInstance;
}

export function setCurrentInstance(instance){
  currentInstance = instance;
}

let compiler;

export function registerCompiler(_compiler){
  compiler = _compiler;
}