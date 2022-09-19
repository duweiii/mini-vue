import { ENodeType } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";

export function transform(root, options = {}){
  const context = createTransformContext(root, options)
  traverseNode( root, context );
  createCodegenNode( root );
  createHelpers(root, context);
}
function createHelpers(root, context){
  root.helpers = [...context.helpers.keys()];
}
function createCodegenNode( root ){
  root.codegenNode = root.children[0]
}
function createTransformContext(root, options){
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],    
    helpers: new Map(),
    helper(key){
      context.helpers.set(key, 1)
    }
  }
  return context;
}

function traverseNode(node, context){

  const { nodeTransforms } = context;
  let exitFns: any = [];

  for( let i = 0; i < nodeTransforms.length; i++ ){
    const transform = nodeTransforms[i];
    const cb = transform(node, context)
    cb && exitFns.push(cb);
  }

  switch(node.type){
    case ENodeType.ROOT:
    case ENodeType.ELEMENT:
      traverseChildren( node, context );
      break;
    case ENodeType.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
    default: 
      break;
  }

  let i = exitFns.length;
  while(i--){
    exitFns[i] && exitFns[i]();
  }
}

function traverseChildren( node, context ){
  const { children } = node;
  for( let i = 0; i < children.length ; i++ ){
    const node = children[i]
    traverseNode( node, context)
  }
}