export function generate(node){
  const context = createCodegenContext()
  const { push } = context;
  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(',');

  push('return function ')
  push(`${functionName}(${signature}){return `)
  genNode(node, context)
  push("}")

  return {
    code: context.code
  }
}

function createCodegenContext(){
  const context = {
    code: '',
    push(source){
      context.code += source
    }
  }
  return context;
}

function genNode(node, context){
  const { push } = context;
  push(`'${node.codegenNode.content}'`)
}