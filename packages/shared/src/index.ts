export * from './toDisplayString';
export * from './shapeFlags';
export const extend = Object.assign;

export const isObject = (value) => {
  return typeof value === 'object';
}
export const isString = (value) => {
  return typeof value === 'string';
}
export const EMPTY_OBJECT = {};
export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue);
}

export const hasOwn = (object: {[key: string]: any}, key: string) => {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string ) => {
    return c ? c.toUpperCase() : '';
  })
}
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export const toHandleKey = (str: string): string => {
  return 'on' + capitalize(str);
}