import { ENodeType } from "./ast";

export function isText(node){
  return node.type === ENodeType.TEXT || node.type === ENodeType.INTERPOLATION;
}

export function isElement(node){
  return node.type === ENodeType.ELEMENT;
}

export function shouldWrapTextNode(node){
  return isText(node) || isCompound(node);
}

export function isCompound(node){
  return node.type === ENodeType.COMPOUND_EXPRESSION;
}