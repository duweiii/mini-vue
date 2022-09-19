import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";
import { isElement } from "../utils";

export function transformElement(node, context){
  if( isElement(node) ){
    return () => {
      context.helper(CREATE_ELEMENT_VNODE)

      const vnodeTag = `'${node.tag}'`;

      let vnodeProps;

      // const vnodeChildren = node.children[0];

      // node.codegenNode = createVNodeCall(vnodeTag, vnodeProps, vnodeChildren);
      node.tag = vnodeTag;
      node.props = vnodeProps;
    }
  }
}