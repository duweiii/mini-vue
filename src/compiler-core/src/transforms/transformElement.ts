import { createVNodeCall, ENodeType } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transformElement(node, context){
  if( node.type === ENodeType.ELEMENT ){
    return () => {
      context.helper(CREATE_ELEMENT_VNODE)

      const vnodeTag = `'${node.tag}'`;

      let vnodeProps;

      const vnodeChildren = node.children[0];

      node.codegenNode = createVNodeCall(vnodeTag, vnodeProps, vnodeChildren);
    }
  }
}