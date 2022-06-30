import { generate } from "../src/codegen";
import { baseParse } from "../src/parse"
import { transform } from "../src/transform";

describe('code generate', () => {
  it('happy path', () => {
    const ast = baseParse('hi');
    transform(ast)
    const { code } = generate( ast );
    expect( code ).toMatchSnapshot();
  })
})