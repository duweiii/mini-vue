import { effect } from "../src/effect";
import { isReactive, reactive } from "../src/reactive";
import { isRef, proxyRefs, ref, unRef } from "../src/ref"

describe("ref", () => {
  it("happy path", () => {
    let a = ref(1);
    expect(a.value).toBe(1)
  })

  it("track and trigger", () => {
    const a = ref(1)
    let dummy;
    let calls = 0;

    effect(()=>{
      calls++;
      dummy = a.value;
    })

    expect(calls).toBe(1);
    expect(dummy).toBe(1)

    a.value = 2;
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // set 的值没有发生变化， 不触发依赖
    a.value = 2;
    expect(calls).toBe(2)
  })

  it("typeof a.value === object , it should be a reactive object", () => {
    let a = ref({ foo: 1});
    expect( isReactive( a.value ) ).toBe(true) 
  })

  it("isRef", () => {
    const a = ref(1)
    const b = reactive({foo: 1})
    expect( isRef(a) ).toBe(true);
    expect( isRef(1) ).toBe(false) 
    expect( isRef(b) ).toBe(false)
  })

  it("unRef", () => {
    const a = ref(1);
    expect( unRef(a) ).toBe(1);
    expect( unRef(1) ).toBe(1);
  })

  it("proxyRefs", () => {
    const user = {
      name: 'zhangsan',
      age: ref(12)
    }
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(12);
    expect( proxyUser.age ).toBe(12);
    expect( proxyUser.name ).toBe("zhangsan")
  })

})