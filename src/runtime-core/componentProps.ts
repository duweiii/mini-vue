export function initProps(instance, props){
  // 如果instance.props为undefined
  // 那在调用 setup 时，进行 shallowReadonly 处理就会报错。
  // 所以在这对undefined做兼容处理
  instance.props = props || {};
}