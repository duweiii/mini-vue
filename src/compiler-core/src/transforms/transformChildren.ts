import { ENodeType } from "../ast";
import { CREATE_TEXT_VNODE } from "../runtimeHelpers";
import { isElement, shouldWrapTextNode } from "../utils";

export function transformChildren(node, context){
  return () => {
    if( isElement(node) ){
      const { children } = node;
      const length = children.length;
      if( length === 1 ){
        /**
         * 如果只有一个child，但是child类型为element，也是需要放到数组中处理的。
         */
        const child = children[0];
        if( isElement(child) ){
          node.addArraySymbol = true;
        }
      }else if ( length > 1 ){
        /**
         * 遍历children，对其中的 text/interpolation/compound,需要用 createTextVNode 包裹
         * 仅对 elementNode.children 中的文本节点添加 createTextVNode 包裹的标记
         * 
         * 因为在runtime-core中，处理children只识别string/array类型，在这里，只有一个string是可以渲染的。
         * 在array类型的children中，遍历到每一个child，去patch，在patch中，只有一个string，就无法正常渲染了，
         * 所以需要通过createTextVNode包裹。
         */
        node.addArrayWrapper = true;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if( shouldWrapTextNode(child) ){
            child.addTextWrapper = true;
            context.helper(CREATE_TEXT_VNODE)
          }
        }
      }
    }
  }
}