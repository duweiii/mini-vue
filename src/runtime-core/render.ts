import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container){
  patch(vnode, container);
}

export function patch(vnode, container){
  if(typeof vnode.type === 'string'){
    processElement(vnode, container)
  }else if ( isObject(vnode.type) ){
    propcessComponent(vnode, container)
  }
}

function processElement(vnode, container){
  mountElement(vnode, container)
}
function mountElement(vnode, container){
  let el = document.createElement(vnode.type);

  const { props } = vnode;

  for (const attr in props) {
    const value = props[attr];
    el.setAttribute(attr, value)
  }

  const { children } = vnode;
  if( typeof children === 'string' ){
    el.innerText = children;
  }else if (Array.isArray(children)){
    mountChildren(children, el)
  }

  container.append(el)
}

function mountChildren(children, container){
  children.forEach(child => patch(child, container))
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
