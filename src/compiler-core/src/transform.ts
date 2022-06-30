export function transform(root, options = {}){
  const context = createTransformContext(root, options)
  traverseNode( root, context );
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
    const transf = nodeTransforms[i];
    transf(node)
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