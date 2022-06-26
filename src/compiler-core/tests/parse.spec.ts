import { baseParse } from "../src/parse"

describe('happy path', () => { 
  
  describe('parse', () => { 
    it('parse', ()=>{
      const str = '{{message}}'
      const ast = baseParse(str)
      expect(ast.children[0]).toStrictEqual({
        type: 'interpolation',
        content: {
          type: 'simple_expression',
          content: 'message'
        }
      })
    })
  })

})