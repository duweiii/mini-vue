import { effect } from "../reactiviy/effect";
import { EShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./createVNode";

export function createRenderer(options){
  const {createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert} = options;

  function render(vnode, container, parent){
    patch(null, vnode, container, parent);
  }
  function patch(n1, n2, container, parent){
    const { type } = n2;
    switch( type ){
      case Fragment:
        processFragment(n1, n2, container, parent);
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if(n2.shapeFlag & EShapeFlags.ELEMENT){
          processElement(n1, n2, container, parent)
        }else if ( n2.shapeFlag & EShapeFlags.STATEFUL_COMPONENT ){
          propcessComponent(n1, n2, container, parent)
        }
        break;
    }
  }
  function processFragment(n1, n2, container, parent){
    mountChildren(n2.children, container, parent)
  }
  function processText(n1, n2, container){
    const { children } = n2;
    const textNode = ( n2.el = document.createTextNode( children ))
    hostInsert(textNode, container)
  }
  function processElement(n1, n2, container, parent){
    if( !n1 ){
      mountElement(n2, container, parent)
    } else {
      patchElement(n1, n2, container, parent);
    }
  }
  function patchElement(n1, n2, container, parent){
    console.log("哈哈哈哈")
    console.log(n1)
    console.log(n2)
  }
  function mountElement(vnode, container, parent){
    let el = ( vnode.el = hostCreateElement(vnode.type));
  
    const { props } = vnode;
    for (const attr in props) {
      const value = props[attr];
      hostPatchProp(el, attr, null, value)
    }
  
    const { children } = vnode;
    if( vnode.shapeFlag & EShapeFlags.TEXT_CHILDREN ){
      el.innerText = children;
    }else if ( vnode.shapeFlag & EShapeFlags.ARRAY_CHILDREN ){
      mountChildren(children, el, parent)
    }
    hostInsert(el, container)
  }
  function mountChildren(children, container, parent){
    children.forEach(child => patch(null, child, container, parent))
  }
  function propcessComponent(n1, n2, container, parent){
    mountComponent(n2, container, parent);
  }
  function mountComponent(n2, container, parent){
    const instance = createComponentInstance(n2, parent);
    setupComponent(instance);
    setupRenderEffect(instance, container);
  }
  function setupRenderEffect(instance, container){
    effect(()=>{
      if( !instance.isMounted ){
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        patch(null, subTree, container, instance );
        instance.vnode.el = subTree.el;
        instance.subTree = subTree;
        instance.isMounted = true;
      }else{
        const { proxy } = instance;
        const newTree = instance.render.call(proxy);
        const oldTree = instance.subTree;
        patch(oldTree, newTree, container, instance );
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}