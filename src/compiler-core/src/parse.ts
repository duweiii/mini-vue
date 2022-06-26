import { ENodeType } from "./ast";

export function baseParse(content){
  let context = createContext(content);
  return createRoot( parseChildren(context) )
}
function createRoot(children){
  return {
    children
  }
}
function createContext(content){
  return {
    source: content
  }
}
function parseChildren(context){
  let nodes: any = [];
  let node;
  if( context.source.startsWith("{{")){
    node = parseInterpolation(context)
  }
  nodes.push(node)
  return nodes;
}
function parseInterpolation(context){
  let openDelimiter = "{{"
  let closeDelimiter = "}}"
  
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanced(context, openDelimiter.length)
  let rawLength = closeIndex - openDelimiter.length;
  let rawContent = context.source.slice(0, rawLength)
  let content = rawContent.trim()
  advanced(context, rawLength + closeDelimiter.length)
  return {
    type: ENodeType.INTERPOLATION,
    content: {
      type: ENodeType.SIMPLE_EXPRESSION,
      content,
    }
  }
}
function advanced(context, leng){
  context.source = context.source.slice(leng)
}