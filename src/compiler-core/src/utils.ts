import { ENodeType } from "./ast";

export function isText(node){
  return node.type === ENodeType.TEXT || node.type === ENodeType.INTERPOLATION;
}

export function isCompound(node){
  return node.type === ENodeType.COMPOUND_EXPRESSION;
}