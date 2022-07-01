import { isString } from "../../shared/index";
import { ENodeType } from "./ast";
import { CREATE_ELEMENT_VNODE, helperMap, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function generate(node){
  const context = createCodegenContext()
  const { push } = context;
  const functionName = 'render';
  const args = ['_ctx', '_cache'];
  const signature = args.join(',');
  
  if( node.helpers.length > 0 ){
    genFunctionPreamble(node, context)
  }

  push('return function ')
  push(`${functionName}(${signature}){return `)
  genNode(node.codegenNode, context)
  push("}")

  return {
    code: context.code
  }
}

function genFunctionPreamble(node, context){
  const { push } = context;
  const VueBinging = 'Vue';
  const aliasHelpers = (s) => `${helperMap[s]}:_${helperMap[s]}`;
  const helpers = node.helpers;
  const declaration = `const { ${helpers.map(aliasHelpers)} } = ${VueBinging}`
  push(declaration)
  push('\n')
}

function createCodegenContext(){
  const context = {
    code: '',
    push(source){
      context.code += source
    },
    helper(key){
      return `_${helperMap[key]}`;
    }
  }
  return context;
}

function genNode(node, context){
  switch( node.type ){
    case ENodeType.TEXT:
      genText(node, context);
      break;
    case ENodeType.INTERPOLATION:
      genInterpolation(node, context)
      break;
    case ENodeType.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break;
    case ENodeType.ELEMENT:
      genElement(node, context);
      break;
    case ENodeType.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    default:
      break;
  }
}

function genCompoundExpression(node, context){
  const { children } = node;
  const { push } = context;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    if( isString(child) ){
      push(child);
    }else{
      genNode(child, context)
    }
  }
}

function genElement(node, context){
  const { helper, push } = context;
  const { tag, props, children } = node;
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList( genNullable([tag, props, children]), context );
  push(")")
}

function genNullable(args){
  return args.map(arg => arg || 'null');
}

function genNodeList(nodes, context){
  const { push } = context;
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if( isString(node) ){
      push(node);
    }else{
      genNode(node, context);
    }
    if( index < nodes.length - 1 ){
      push(', ')
    }
  }
}

function genText(node, context){
  const { push } = context;
  push(`'${node.content}'`);
}

function genInterpolation(node, context){
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode( node.content, context )
  push(')')
}

function genExpression(node, context){
  const { push } = context;
  push( node.content )
}