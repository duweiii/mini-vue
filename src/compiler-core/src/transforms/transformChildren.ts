import { ENodeType } from "../ast";
import { CREATE_TEXT_VNODE } from "../runtimeHelpers";
import { isText } from "../utils";

export function transformChildren(node, context){
  return () => {
    if( node.type === ENodeType.ELEMENT ){
      const { children } = node;
      const length = children.length;
      /**
       * children 
       * 1. 单 text，包括 单个compound节点
       * 2. 单 element
       * 3. 多个节点， text / compound / element
       */
      if( length === 1 ){
        const child = children[0];
        if( child.type === ENodeType.ELEMENT ){
          node.addArraySymbol = true;
        }
      }else if ( length > 1 ){
        // 遍历children，对其中的 text/interpolation/compound,需要用 createTextVNode 包裹
        // 仅对 elementNode.children 中的文本节点添加 createTextVNode 包裹的标记
        /**
         * 因为在runtime-core中，处理children只识别string/array类型，在这里，只有一个string是可以渲染的。
         * 在array类型的children中，遍历到每一个child，去patch，在patch中，只有一个string，就无法正常渲染了，
         * 所以需要通过createTextVNode包裹。
         */
        node.addArrayWrapper = true;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if( isText(child) || child.type === ENodeType.COMPOUND_EXPRESSION ){
            child.addTextWrapper = true;
            context.helper(CREATE_TEXT_VNODE)
          }
        }
      }
    }
  }
}