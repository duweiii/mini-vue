export function transform(root, options = {}){
  const context = createTransformContext(root, options)
  traverseNode( root, context );
  createCodegenNode( root );
}
function createCodegenNode( root ){
  root.codegenNode = root.children[0]
}
function createTransformContext(root, options){
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],    
  }
  return context;
}

function traverseNode(node, context){
  console.log( node )

  const { nodeTransforms } = context;
  for( let i = 0; i < nodeTransforms.length; i++ ){
    const transform = nodeTransforms[i];
    transform(node)
  }

  traverseChildren( node, context );
}

function traverseChildren( node, context ){
  const { children } = node;
  if( children ){
    for( let i = 0; i < children.length ; i++ ){
      const node = children[i]
      traverseNode( node, context)
    }
  }
}