import { effect } from "../effect";
import { isProxy, isReactive, reactive } from "../reactive";

describe("reactive", ()=>{
  it("happy path", ()=>{
    const origin = {
      age: 10
    }
    const user = reactive( origin )
    expect(user).not.toBe(origin)
    expect(user.age).toBe(10)
    user.age = 11;
    expect(user.age).toBe(11)
    expect( isProxy(user) ).toBe(true)
  })

  it("is reactive", () => {
    let origin = { foo: 1};
    let obj = reactive(origin);
    expect( isReactive( obj ) ).toBe(true)
    expect( isReactive( origin ) ).toBe(false)
  })

  it('deep nesting',() => {
    let dummy;
    let obj = reactive({ a:{b: 2} });
    expect( isReactive( obj.a )).toBe(true)

    effect(() => {
      dummy = obj.a.b;
    })
    expect(dummy).toBe(2)

    obj.a.b = 4;
    expect(dummy).toBe(4)
  })
})