import { shallowReadonly } from "../reactiviy/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicComponentHandlers } from "./publicComponentHandlers";

export function createComponentInstance(vnode){
  const instance = {
    vnode,
    type: vnode.type,
    el: null,
    setupState: {},
    props: null,
    emit: () => {},
  }

  instance.emit = emit.bind(null, instance) as any;

  return instance;
}

export function setupComponent(instance){
  // instance.proxy = new Proxy(instance.ctx, instanceProxyHandlers)
  initProps(instance, instance.vnode.props)
  // initSlots
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
    setupResult = setup( shallowReadonly(instance.props), { emit: instance.emit } );
    handleSetupResult(instance, setupResult);
  }
}

export function handleSetupResult(instance, setupResult){
  if( typeof setupResult === 'object'){
    instance.setupState = setupResult;
  }
  finishComponent(instance);
}

export function finishComponent(instance){
  const component = instance.type;
  instance.render = component.render;
}
