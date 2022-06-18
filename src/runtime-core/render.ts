import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container){
  patch(vnode, container);
}

export function patch(vnode, container){
  
  propcessComponent(vnode, container)
}

function propcessComponent(vnode, container){
  mountComponent(vnode, container);
}

function mountComponent(vnode, container){
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container){
  const subTree = instance.render();
  patch(subTree, container);
}
