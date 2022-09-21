import { effect } from "./effect";

/**
 * watch支持三个参数
 * 1. 监听对象 (响应式数据)
 *      1. 可以是某个原始值
 *      2. 可以是整个对象
 *      3. 可以是对象的某个字段
 *      4. 可以是一个函数，在函数中返回 2(整个对象) 或者 3(对象的某个字段 )
 *      5. 还可以同时监听多个，使用方式 => watch( [1/2/3/4, 1/2/3/4] , params2)
 * 2. 回调函数
 *      1. 回调函数中可以接收
 *          1.1 旧的值
 *          1.2 新的值
 *          1.3 onInvalidate，上次回调失效执行onInvalidate
 * 3. options
 *      1. immediate，支持控制回调是否直接执行
 */
export const watch = (firstParam, callback, options?) => {
    // 先支持ref
    const getter = () => firstParam?.value;
    effect(getter, {
        scheduler: callback
    })
}