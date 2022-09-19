import { extend } from "@guide-mini-vue/shared";

let activeEffect;
let shouldTrack = false;

export class ReactiveEffect {
  private _fn: any;
  active = true;
  deps = [];
  onStop?: () => void;
  constructor(fn, public scheduler?){
    this._fn = fn;
  }
  run(){
    if( !this.active ){
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;
    const result = this._fn();
    shouldTrack = false;
    return result;
  }
  stop(){
    if( this.active ){
      if( this.onStop ){
        this.onStop()
      }
      cleanupEffect(this)
      this.active = false;
    }
  }
}

function cleanupEffect(effect){
  effect.deps.forEach(dep => {
    dep.delete(effect)
  })
  effect.deps = [];
}

let targetMap = new Map();
export function track(target, key){
  if( !isTracking() ) return;

  let depsMap = targetMap.get(target)
  if( !depsMap ){
    depsMap = new Map();
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get( key );
  if( !dep ){
    dep = new Set();
    depsMap.set( key, dep )
  }
  trackEffect(dep);
}
export function trackEffect(dep){
  if( dep.has(activeEffect) ) return ;
  // 通过 target key 找到对应的依赖容器，收集依赖
  dep.add(activeEffect)
  // 反向收集，标注当前的类，存在于哪些集合中
  activeEffect.deps.push( dep )
}

export function isTracking(){
  return activeEffect !== undefined && shouldTrack;
}
export function trigger(target, key){
  let depsMap = targetMap.get(target)
  if( !depsMap ) return ;
  let dep = depsMap.get( key );
  triggerEffect(dep);
}

export function triggerEffect(dep){
  for( const effect of dep ){
    // 这里是为了处理只使用reactive 但不使用effect的情况下
    // 触发get进行依赖收集时，收集到的是个undefined，因为没有effect配合暴露依赖
    if( effect?.scheduler ){
      effect.scheduler()
    }else{
      effect && effect.run()
    }
  }
}

export function effect(fn, option: any = {}){
  let _effect = new ReactiveEffect(fn, option?.scheduler)
  extend(_effect, option)

  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}


export function stop(runner){
  let effect = runner.effect;
  effect.stop();
}