import { getCurrentInstance } from "./component";

export function provide(key, value){
  const currentInstance: any = getCurrentInstance();
  let { provides } = currentInstance;
  const parentProvides = currentInstance.parent?.provides;
  if( provides === parentProvides ){
    provides = currentInstance.provides = Object.create(parentProvides);
  } 
  provides[key] = value;
}

export function inject(key, defaultValue){
  const currentInstance: any = getCurrentInstance();
  const { provides } = currentInstance.parent;
  if( key in provides ){
    return provides[key]
  }else if( defaultValue ){
    if( typeof defaultValue === 'function' ){
      return defaultValue();
    }else{
      return defaultValue;
    }
  }
}