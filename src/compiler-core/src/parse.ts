import { EElementStatus, ENodeType } from "./ast";

export function baseParse(content){
  let context = createContext(content);
  return createRoot( parseChildren(context, []) )
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
function parseChildren(context, ancestor){
  let nodes: any = [];
  let node;
  while( !isEnd(context, ancestor) ){
    if( context.source.startsWith("{{")){
      node = parseInterpolation(context)
    }else if( context.source[0] === '<' ){
      if( /[a-z]/i.test( context.source[1] ) ){
        node = parseElement( context , ancestor)
      }
    }
  
    if( !node ){
      node = parseText(context)
    }
  
    nodes.push(node)
  }
  return nodes;
}
function isEnd(context, ancestor){
  /**
   * 结束的条件
   * 1. context.source 为空
   * 2. 遇到结束标签了
   */
  let s = context.source;
  if( s.startsWith("</") ){
    for( let i = ancestor.length - 1; i >= 0 ; i-- ){
      let tag = ancestor[i];
      if( startsWithCloseTagAndIsSameTag(context, tag) ){
        return true;
      }
    }
  }

  return !s;
}
function startsWithCloseTagAndIsSameTag(context, tag){
  return context.source.startsWith("</") && tag.toLowerCase() === context.source.slice(2, 2 + tag.length).toLowerCase();
}
function parseElement(context, ancestor){
  let element: any = parseTag( context, EElementStatus.START)
  ancestor.push( element.tag )
  element.children = parseChildren(context, ancestor)
  ancestor.pop()
  if( startsWithCloseTagAndIsSameTag(context, element.tag) ){
    parseTag( context, EElementStatus.END)
  }else{
    throw new Error(`缺少结束标签${element.tag}`);
  }
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
  let endIndex = context.source.length;
  let endSymbol = ["<","{{"]

  endSymbol.forEach((item) => {
    let index = context.source.indexOf(item);
    if( index !== -1 && index < endIndex){
      endIndex = index;
    }
  })
  let content = parseTextData(context, endIndex)
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