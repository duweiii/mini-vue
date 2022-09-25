/**
 * 1. 监听整个对象 🆗
 * 2. 支持传入getter函数，自定义监听的字段 🆗
 * *  监听对象支持ref、reactive、getter，及多个前面对象组成的数组 🆗
 * 3. callback执行时能够拿到oldValue、newValue 🆗
 * 4. 支持options控制立即执行传入的执行函数 🆗
 * 5. 支持options控制回调函数的执行时机，是直接执行还是微任务执行 🆗
 * 6. 支持副作用函数，callback中可在第三个参数接受 🆗
 */

import { effect } from "./effect";
import { isRef } from "./ref";

 // getter的生成逻辑
 const getterCreator = (be_monitored_boy) => {
   if ( typeof be_monitored_boy === 'function' ) {
     return be_monitored_boy;
   } else if( isRef(be_monitored_boy) ) {
     return () => be_monitored_boy.value;
   } else if ( Array.isArray( be_monitored_boy ) ) {
     const getters = be_monitored_boy.map( item => {
       return getterCreator( item );
     })
     return () => {
       getters.forEach( getter => getter() )
     }
   } else {
     return () => traverse(be_monitored_boy)
   }
 }
 
 // 遍历对象，且使用每个字段的值
 const traverse = (params, seen = new Set()) => {
   // 如果当前的参数是个原始值或者没有值，那就不要再继续遍历了
   if( typeof params !== "object" || params === null || seen.has(params)) return ;
   // 标记已读
   seen.add(params)
   // 遍历对象,使用for in处理，因为可能是{}或者[]
   for (const key in params) {
     traverse(params[key], seen)
   }
   return params;
 }
 
 // watch功能
 export const watch = (be_monitored_boy, callback, options?) => {
   // 生成getter
   let getter = getterCreator(be_monitored_boy);
   let oldValue,newValue;
   let cleanup;
 
   const onInvalidate = (exec) => {
     cleanup = exec;
   }
 
   const job = () => {
     newValue = runner();
     if ( cleanup ) {
       cleanup();
     }
     callback(oldValue, newValue, onInvalidate);
     oldValue = newValue;
   }
   // 绑定依赖
   const runner = effect(getter, {
     scheduler(){
       if ( options?.flush === "post" ) {
         let p = Promise.resolve();
         p.then( job )
       } else {
         job();
       }
     }
   })
   if( options?.immediately ){
     job();
   }else{
     oldValue = runner();
   }
 }
