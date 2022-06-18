import { isProxy, isReadonly, readOnly } from "../reactive";

describe("readonly", ()=>{
  it("happy path", () => {
    let obj = {foo: 1}
    const rea = readOnly(obj)
    expect(rea).not.toBe(obj)
    expect(rea.foo).toBe(1)
    rea.foo = 2;
    expect(rea.foo).toBe(1)
    expect( isProxy(rea) ).toBe(true)
  })

  it("warn on set", () => {
    let obj = readOnly({foo: 1});
    console.warn = jest.fn()
    obj.foo = 2;
    expect(console.warn).toBeCalled()
  })

  it("is readonly", () => {
    let origin = { foo: 1};
    let obj = readOnly(origin);
    expect( isReadonly( obj ) ).toBe(true)
    expect( isReadonly( origin ) ).toBe(false)
  })

  it('deep nesting',() => {
    let obj = readOnly({ a:{b: 2} });
    expect( isReadonly( obj.a )).toBe(true)
  })

})