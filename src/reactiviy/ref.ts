import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

class Ref {
  private _rawValue;
  private _value;
  private dep;
  public __v_isRef = true;
  constructor(value){
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    trackRefEffect(this.dep);
    return this._value;
  }
  set value(newValue){
    if( hasChanged(this._rawValue, newValue) ){
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffect(this.dep)
    }
  }
}

export function ref( value ){
  return new Ref(value);
}
function trackRefEffect(dep){
  if( isTracking() ){
    trackEffect(dep)
  }
}
function convert(value){
  return isObject(value) ? reactive(value) : value;
}
export function isRef(ref){
  return !!ref.__v_isRef;
}
export function unRef(ref){
  return isRef(ref) ? ref.value : ref;
}
export function proxyRefs(raw){
  return new Proxy(raw, {
    get(target, key){
      let res = Reflect.get(target, key);
      return unRef(res);
    },
    set(target, key, value){
      /**
       * 这里为什么需要进行双重判断 ？
       * 既要target[key]是 ref, 也要value 不是 ref 
       * - - - - - - - - - - -
       * 因为如果 target[key] 是ref，且value也是ref，就会出现 ref.value 还是 ref 的情况
       * 这显然与我们在定义 Ref 时定义的不一样。
       * ref.value 要么是一个原始值，要么是一个对象。而是一个对象的话，也是用reactive处理过后返回的proxy对象
       * 所以只有当 target[key] 是 ref，而 value 不是 ref 时，执行target[key].value = value;
       * 后续不管这个value是原始值，还是对象，都会在Ref的set中被做对应处理。
       * 而在其他情况中，
       *  1. target[key]不是一个ref，那就正常给对象的key赋值；
       *  2. 或者target[key]跟value都是ref，那就用新的ref覆盖旧的ref
       */
      if( isRef(target[key]) && !isRef(value) ){
        return target[key].value = value;
      }else{
        Reflect.set(target, key, value);
      }
      return true;
    }
  })
}