import { ENodeType } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";

describe('transform', () => { 
  it('happy path', () => {
    let ast = baseParse("<div>hi,{{message}}</div>")

    const plugin = (node) => {
      if( node.type === ENodeType.TEXT ){
        node.content += 'mini-vue'
      }
    }

    transform( ast, {
      nodeTransforms:[plugin]
    })

    const node = ast.children[0].children[0];
    expect( node.content).toBe('hi,mini-vue')
  })
 })