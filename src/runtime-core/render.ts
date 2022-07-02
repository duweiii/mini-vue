import { effect } from "../reactiviy/effect";
import { EMPTY_OBJECT } from "../shared/index";
import { EShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./createVNode";
import { queueJobs } from "./schedulers";

export function createRenderer(options){
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp, 
    insert: hostInsert,
    setElementText: hostSetElementText,
    remove: hostRemove
  } = options;

  function render(vnode, container, parent){
    patch(null, vnode, container, parent, null);
  }
  function patch(n1, n2, container, parent, anchor){
    const { type } = n2;
    switch( type ){
      case Fragment:
        processFragment(n1, n2, container, parent);
        break;
      case Text:
        processText(n1, n2, container)
        break;
      default:
        if(n2.shapeFlag & EShapeFlags.ELEMENT){
          processElement(n1, n2, container, parent, anchor)
        }else if ( n2.shapeFlag & EShapeFlags.STATEFUL_COMPONENT ){
          propcessComponent(n1, n2, container, parent)
        }
        break;
    }
  }
  function processFragment(n1, n2, container, parent){
    mountChildren(n2.children, container, parent)
  }
  function processText(n1, n2, container){
    const { children } = n2;
    const textNode = ( n2.el = document.createTextNode( children ))
    hostInsert(textNode, container)
  }
  function processElement(n1, n2, container, parent, anchor){
    if( !n1 ){
      mountElement(n2, container, parent, anchor)
    } else {
      patchElement(n1, n2, container, parent, anchor);
    }
  }
  function patchElement(n1, n2, container, parent, anchor){
    const el = (n2.el = n1.el);
    const oldProps = n1.props || EMPTY_OBJECT;
    const newProps = n2.props || EMPTY_OBJECT;
    patchProps(el, oldProps, newProps)
    patchChildren(n1, n2, el, parent, anchor);
  }
  function patchProps(el, oldProps, newProps) {
    if( oldProps !== newProps ){
      for (const key in newProps) {
        const prevValue = oldProps[key]
        const newValue = newProps[key]
        if ( prevValue !== newValue ) {
          hostPatchProp(el, key, prevValue, newValue)
        }
      }

      if( oldProps !== EMPTY_OBJECT ){
        for (const key in oldProps) {
          if ( !(key in newProps) ) {
              hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
      
    }
  }
  function patchChildren(n1, n2, container, parent, anchor){
    const prevShapflag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    const c1 = n1.children;
    const c2 = n2.children;
    if( shapeFlag & EShapeFlags.TEXT_CHILDREN ){
      if( prevShapflag & EShapeFlags.ARRAY_CHILDREN ){
        unmountChildren(c1)
        hostSetElementText(container, c2)
      }else if( prevShapflag & EShapeFlags.TEXT_CHILDREN ){
        hostSetElementText(container, c2)
      }
    }else if( shapeFlag & EShapeFlags.ARRAY_CHILDREN ){
      if( prevShapflag & EShapeFlags.TEXT_CHILDREN ){
        // 老的children是string，新的是array
        hostSetElementText(container, '')
        mountChildren(c2, container, parent)
      }else if( prevShapflag & EShapeFlags.ARRAY_CHILDREN ){
        patchKeyedChildren(c1, c2, container, parent, anchor)
      }
    }
  }
  function patchKeyedChildren(c1, c2, container, parent, anchor){
    let e1 = c1.length-1;
    let e2 = c2.length-1;
    let i = 0;
    // 1. 双端对比，确定变化范围
    
    // 向右对比
    while( i <= e1 && i <= e2 ){
      const prevChild = c1[i]
      const nextChild = c2[i]
      if( isSameVNodeType(prevChild, nextChild) ){
        patch(prevChild, nextChild, container, parent, anchor)
      }else{
        break;
      }
      i++;
    }

    // 向左对比
    while( i <= e1 && i <= e2 ){
      const prevChild = c1[e1]
      const nextChild = c2[e2]
      if( isSameVNodeType(prevChild, nextChild) ){
        patch(prevChild, nextChild, container, parent, anchor)
      }else{
        break;
      }
      e1--;
      e2--;
    }

    // 现在确定变化范围了，进行处理

    // 首先处理有序的变化，比如单侧的添加删除
    if( i > e1 ){
      if( i <= e2 ){
        // 不改变顺序，纯添加
        /**
         * 确认插入位置, 1. 左侧插入 2. 右侧插入 
         * 插入点应为 e2+1
         * 对于左侧插入 c2[e2+1]自然可以获取到el
         * 但是对于右侧插入， c2[e2+1]的vnode还没有进行渲染，是获取不到el的，el还是初始化时的null
         * 但是还是需要判断的，比如 ab -> abc e2 为c的位置，c2[e2+1]是undefined
         * 修改 insert 方法，换为insertBefore, 此 API 第二个参数如果为null，效果与append相同
         */
        let nextPosition = e2 + 1;
        let anchor = nextPosition < c2.length ? c2[nextPosition].el : null;
        while( i <= e2 ){
          patch(null, c2[i], container, parent, anchor)
          i++;
        }
      }
    }else if( i > e2 && i <= e1 ){
      // 单侧删除
      while( i <= e1 ){
        hostRemove(c1[i].el);
        i++;
      }
    }else{
      /**
       * 这里就是 i < e1 && i < e2 的部分了。
       * 对这部分，
       * 1. 删除oldChildren里有，而newChildren中没有的vnod
       * 2. 处理oldChildren&newChildren都有的且需要改变位置的vnode
       * 3. 创建newChildren里有，而oldChildren中没有的vnode
       */
      let s1 = i;
      let s2 = i;
      let patched = 0;
      let toBePatched = e2 - s2 + 1;
      let newKeyToNewIndexMap = new Map();
      // 初始化newIndex -> oldIndex的映射，( 从0到toBePatched )
      let newIndexToOldIndexMap = new Array(toBePatched).fill(0);
      // 控制是否需要计算最长递增子序列
      let moved = false;
      let maxNewIndex = 0;
      // 先创建一个newChildren中每一个child的key-index的字典，方便后续查找，降低时间复杂度
      for(let i = s2; i <= e2; i++) {
        let nextChild = c2[i];
        newKeyToNewIndexMap.set(nextChild.key, i);
      }

      for( let i = s1; i <= e1; i++ ){
        let prevChild = c1[i];
        if( patched >= toBePatched ){
          hostRemove(prevChild.el)
          continue;
        }
        let newIndex;
        // 对当前的 prevChild，判断他是否也在newChildren中
        if( prevChild.key !== null ){
            newIndex = newKeyToNewIndexMap.get( prevChild.key )
        }else{
          for( let j = s2; j <= e2; j++){
            let nextChild = c2[j];
            if( isSameVNodeType(prevChild, nextChild) ){
              newIndex = j;
              break;
            }
          }
        }
        // 根据newIndex做处理
        if( newIndex === undefined ){
          // 删除
          hostRemove(prevChild.el)
        }else{
          if( newIndex > maxNewIndex ){
            maxNewIndex = newIndex;
          }else{
            moved = true;
          }
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parent, anchor)
          patched++;
        }
      }
      /**
       * 这里是在计算最长递增子序列
       * 比如 [a,b,c] -> [c,a,b] 的变化，
       * 只需要挪动 c 就可以了，而 ab 不用去处理。
       * 所以通过 newIndexToOldIndexMap 去创建一个vnode的 newIndex 对应在 oldChildren 中的一个 oldIndex，
       * 然后去计算最长递增子序列，这个子序列内的vnode就是不用处理的
       * 比如上面的 abc -> cab,
       * newIndexToOldIndexMap: [0: 2,   1: 0,   2: 1]
       * 计算出的最长递增子序列为， [0, 1]
       * 而这两个元素对应的索引就是vnode 在 newChildren 中的索引, [1,2]
       * 也就是说newChildren中索引为[1,2]的元素是不需要处理的。
       */
      let increasingNewIndexSubsequence = moved ? getSequence( newIndexToOldIndexMap ) : [];
      let j = increasingNewIndexSubsequence.length - 1;
      for( let i = toBePatched - 1; i >= 0; i-- ){
        const currentPosition = s2 + i;
        const nextPosition = currentPosition + 1;
        const anchor = nextPosition < c2.length ? c2[nextPosition].el : null;

        if( newIndexToOldIndexMap[i] === 0 ){
          // 新建
          patch(null, c2[currentPosition], container, parent, anchor )
        }else if( moved ){
          if( j < 0 || i !== increasingNewIndexSubsequence[j] ){
            /**
             * 交换位置
             * 但是为什么不在这通过patch交换位置呢，还要对比props和children？
             * 因为这里出现的需要交换位置的都是新老children中都存在的，
             * 而都存在的这个vnode，在遍历oldChildren的过程中，识别到是同一个vnode，就已经去patch了
             * 所以这里只处理顺序
             */
            hostInsert(c2[currentPosition].el, container, anchor)
          }else{
            j--;
          }
        }
      }
    }



  }
  function isSameVNodeType(n1, n2){
    return n1.key === n2.key && n1.type === n2.type;
  }
  function unmountChildren(children){
    children.forEach( child => hostRemove(child.el))
  }
  function mountElement(vnode, container, parent, anchor){
    let el = ( vnode.el = hostCreateElement(vnode.type));
  
    const { props } = vnode;
    for (const attr in props) {
      const value = props[attr];
      hostPatchProp(el, attr, null, value)
    }
  
    const { children } = vnode;
    if( vnode.shapeFlag & EShapeFlags.TEXT_CHILDREN ){
      el.innerText = children;
    }else if ( vnode.shapeFlag & EShapeFlags.ARRAY_CHILDREN ){
      mountChildren(children, el, parent)
    }
    hostInsert(el, container, anchor)
  }
  function mountChildren(children, container, parent){
    children.forEach(child => patch(null, child, container, parent, null))
  }
  function propcessComponent(n1, n2, container, parent){
    if( !n1 ){
      mountComponent(n2, container, parent);
    }else{
      updateComponent(n1, n2, container, parent);
    }
  }
  function mountComponent(n2, container, parent){
    const instance = n2.component = createComponentInstance(n2, parent);
    setupComponent(instance);
    setupRenderEffect(instance, container);
  }
  function updateComponent(n1, n2, container, parent){
    const instance = n2.component = n1.component;
    if( shouldComponentUpdate(n1, n2) ){
      instance.next = n2;
      instance.update()
    }else{
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }
  function shouldComponentUpdate(n1, n2){
    const { props: prevProps } = n1;
    const { props: nextProps } = n2;
    for (const key in prevProps) {
      let prevValue = prevProps[key]
      let nextValue = nextProps[key]
      if ( prevValue !== nextValue ) {
        return true;
      }
    }
    return false;
  }
  function setupRenderEffect(instance, container){
    function handleRender(){
      if( !instance.isMounted ){
        const { proxy } = instance;
        const subTree = instance.render.call(proxy, proxy);
        patch(null, subTree, container, instance, null );
        instance.vnode.el = subTree.el;
        instance.subTree = subTree;
        instance.isMounted = true;
      }else{
        const { proxy } = instance;
        const { next, vnode } = instance;
        if( next ){
          next.el = vnode.el;
          transformProps(instance, next)
        }
        const newTree = instance.render.call(proxy, proxy);
        const oldTree = instance.subTree;
        instance.subTree = newTree;
        patch(oldTree, newTree, container, instance, null );
      }
    }

    instance.update = effect(handleRender, {
      scheduler: () => {
        queueJobs( instance.update )
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}
function transformProps(instance, nextVNode){
  instance.props = nextVNode.props;
  instance.vnode = nextVNode;
  instance.next = null;
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
