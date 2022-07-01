import { generate } from "../src/codegen";
import { baseParse } from "../src/parse"
import { transform } from "../src/transform";
import { transformExpression } from "../src/transforms/transformExpression";

describe('code generate', () => {
  it('happy path', () => {
    const ast = baseParse('hi');
    transform(ast)
    const { code } = generate( ast );
    expect( code ).toMatchSnapshot();
  })

  it('happy path', () => {
    const ast = baseParse('{{message}}');
    transform(ast, { nodeTransforms: [transformExpression]})
    const { code } = generate( ast );
    expect( code ).toMatchSnapshot();
  })
})