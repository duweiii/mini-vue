import { ENodeType } from "../ast";

export function transformExpression(node){
  if( node.type === ENodeType.INTERPOLATION){
    const expressionNode = node.content;
    processExpression(expressionNode)
  }
}

const processExpression = (node) => {
  const rawContent = node.content;
  node.content = `_ctx.${rawContent}`
}