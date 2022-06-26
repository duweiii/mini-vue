import { ENodeType } from "../src/ast"
import { baseParse } from "../src/parse"

describe('happy path', () => { 
  describe('parse mustache', () => { 
    it('parse', ()=>{
      const str = '{{message}}'
      const ast = baseParse(str)
      expect(ast.children[0]).toStrictEqual({
        type: ENodeType.INTERPOLATION,
        content: {
          type: ENodeType.SIMPLE_EXPRESSION,
          content: 'message'
        }
      })
    })
  })
  describe("parse element" , () => {
    it('parse', () => {
      const str = '<div></div>'
      const ast = baseParse(str)
      expect(ast.children[0]).toStrictEqual({
        type: ENodeType.ELEMENT,
        tag: 'div'
      })
    })
  })
})