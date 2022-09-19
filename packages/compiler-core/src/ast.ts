export const enum ENodeType {
  INTERPOLATION = 'interpolation',
  SIMPLE_EXPRESSION = 'simple_expression',
  ELEMENT = 'element',
  TEXT = 'text',
  ROOT = 'root',
  COMPOUND_EXPRESSION = 'compound_expression'
}

export const enum EElementStatus {
  START,
  END
}

export function createVNodeCall(tag, props, children){
    return {
      type: ENodeType.ELEMENT,
      tag,
      props,
      children,
    }
}