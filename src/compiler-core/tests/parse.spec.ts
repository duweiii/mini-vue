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
        tag: 'div',
        children: []
      })
    })
  })

  describe("parse text" , () => {
    it('parse', () => {
      const str = 'some thing'
      const ast = baseParse(str)
      expect(ast.children[0]).toStrictEqual({
        type: ENodeType.TEXT,
        content: str
      })
    })
  })

  describe('parse three type', () => { 
    it("three type", ()=>{
      const str = '<div>hi,{{message}}</div>'
      const ast = baseParse(str)
      expect(ast.children[0]).toStrictEqual({
        type: ENodeType.ELEMENT,
        tag: 'div',
        children: [
          {
            type: ENodeType.TEXT,
            content: "hi,"
          },
          {
            type: ENodeType.INTERPOLATION,
            content: {
              type: ENodeType.SIMPLE_EXPRESSION,
              content: 'message'
            }
          }
        ]
      })
    })
   })

})