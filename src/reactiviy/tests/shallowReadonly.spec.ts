import { isReadonly, shallowReadonly } from "../reactive";

describe("shallowReadonly", () => {
  it('happy path', () => {
    let a = {foo: { bar: 1}}
    let obj = shallowReadonly(a);
    expect( isReadonly(obj) ).toBe(true);
    expect( isReadonly(obj.foo) ).toBe(false);
  })
})