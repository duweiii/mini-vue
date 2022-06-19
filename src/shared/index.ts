export const extend = Object.assign;

export const isObject = (value) => {
  return typeof value === 'object';
}

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue);
}

export const hasOwn = (object: {[key: string]: any}, key: string) => {
  return Object.prototype.hasOwnProperty.call(object, key);
}