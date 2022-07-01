import { generate } from "../src/codegen";
import { baseParse } from "../src/parse"
import { transform } from "../src/transform";
import { transformElement } from "../src/transforms/transformElement";
import { transformExpression } from "../src/transforms/transformExpression";
import { transformText } from "../src/transforms/transformText";

describe('code generate', () => {
  it('happy path: text node', () => {
    const ast = baseParse('hi');
    transform(ast)
    const { code } = generate( ast );
    expect( code ).toMatchSnapshot();
  })

  it('happy path: interpolation node', () => {
    const ast = baseParse('{{message}}');
    transform(ast, { nodeTransforms: [transformExpression]})
    const { code } = generate( ast );
    expect( code ).toMatchSnapshot();
  })

  it('happy path：element node', () => {
    const ast = baseParse('<div></div>');
    transform(ast, { nodeTransforms: [transformElement]})
    const { code } = generate( ast );
    expect( code ).toMatchSnapshot();
  })

  it("happy path: unit", () => {
    const ast = baseParse("<div>hi,{{message}}</div>")
    transform(ast, { nodeTransforms: [ transformExpression, transformElement, transformText]})

    console.log("哈哈哈", ast)
    const { code } = generate( ast );
    expect( code ).toMatchSnapshot();
  })

})