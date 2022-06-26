import { EElementStatus, ENodeType } from "./ast";

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
  }else if( context.source[0] === '<' ){
    if( /[a-z]/i.test( context.source[1] ) ){
      node = parseElement( context )
    }
  }

  if( !node ){
    node = parseText(context)
  }

  nodes.push(node)
  return nodes;
}
function parseElement(context){
  let element = parseTag( context, EElementStatus.START)

  parseTag( context, EElementStatus.END)
  return element;
}
function parseTag(context, type: EElementStatus){
  let match: any = /^<\/?([a-z]*)/i.exec( context.source );
  let tag = match[1];
  advanced(context, match[0].length)
  advanced(context, 1)
  if(type === EElementStatus.END) return ;
  return {
    type: ENodeType.ELEMENT,
    tag,
  }
}
function parseText(context){
  let content = parseTextData(context, context.source.length)
  return {
    type: ENodeType.TEXT,
    content,
  }
}
function parseInterpolation(context){
  let openDelimiter = "{{"
  let closeDelimiter = "}}"
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
  advanced(context, openDelimiter.length)
  let rawLength = closeIndex - openDelimiter.length;
  let rawContent = parseTextData(context, rawLength)
  let content = rawContent.trim()
  advanced(context, closeDelimiter.length)
  return {
    type: ENodeType.INTERPOLATION,
    content: {
      type: ENodeType.SIMPLE_EXPRESSION,
      content,
    }
  }
}
function parseTextData(context, length){
  let content = context.source.slice(0, length);
  advanced(context, length)
  return content;
}
function advanced(context, leng){
  context.source = context.source.slice(leng)
}