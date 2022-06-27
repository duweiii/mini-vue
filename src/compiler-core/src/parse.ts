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
  if( startsWithCloseTagAndIsSameTag(context, element.tag) && !loseEndTag(context, ancestor, element.tag) ){
    // 还有 <div> <div> </div> 这种情况需要处理
    // 这时，ancestor栈中的div数量应该比context.source中少一个
    // 所以当 ancestor>div's count === context.source中div的数量-1时，标签才是正常的

    /**
     * 上面说的情况现在的判断也可以捕获到缺少标签。
     * <div><span></div>
     * 这种情况，因为span跟后面的div不匹配，所以肯定不会命中这个if，所以走到else中
     * <div><div></div>
     * 这种情况，中间的div调用startsWithCloseTagAndIsSameTag这个判断，结果为true，
     * 会把后面的父元素的结束标签删掉，
     * 然后父元素在最后需要处理结束标签时，因为 context.source 已经为空字符串了，
     * 所以肯定不会等于element.tag，也会进入else的逻辑报错。
     * 
     * 所以最后的问题就是，进入错误逻辑的本该是子div元素，现在是父div元素。错误定位不准确。
     * 
     * 添加判断 !loseEndTag(context, ancestor, element.tag)
     */
    parseTag( context, EElementStatus.END)
  }else{
    throw new Error(`缺少结束标签${element.tag}`);
  }
  return element;
}
function loseEndTag(context, ancestor, tag){
  const duplicateString = context.source;
  const endTagCountInSourceString = duplicateString.split(tag).length - 1;
  let tagCountInAncestor = 0;
  ancestor.forEach(item => {
    item === tag && tagCountInAncestor++;
  })
  return tagCountInAncestor + 1 !== endTagCountInSourceString;
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