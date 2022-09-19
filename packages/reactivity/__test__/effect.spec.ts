import { effect, stop } from "../src/effect";
import { reactive } from "../src/reactive";

describe( 'effect', ()=>{
  it("happy path", ()=> {
    const user = reactive({
      age: 10
    })

    let nextAge;
    effect(()=>{
      nextAge = user.age+1;
    })
    expect(nextAge).toBe(11);
    user.age++;
    expect(nextAge).toBe(12);
  })

  it("should return runner, when call effect",()=>{
    let count = 10;
    const runner = effect(()=>{
      count++;
      return 'foo'
    })
    expect(count).toBe(11)

    const res = runner();
    expect(count).toBe(12);
    expect(res).toBe('foo')
  })

  it('scheduler', () => {
    let dummy;
    let run;
    let obj = reactive({
      foo: 1
    })
    let scheduler = jest.fn(()=>{
      run = runner;
    })
    const runner = effect(()=>{
      dummy = obj.foo;
    }, { scheduler })
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo = 2;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run()
    expect(dummy).toBe(2);
  })

  it("stop", () => {
    let dummy;
    let obj = reactive({ foo: 1});
    let runner = effect(()=>{
      dummy = obj.foo;
    })
    expect(dummy).toBe(1);

    obj.foo = 2;
    expect(dummy).toBe(2);

    stop(runner);
    obj.foo = 3;
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(3)
  })

  it("on stop", () => {
    let dummy;
    let obj = reactive({ foo: 1});
    const runner = effect(()=>{
      dummy = obj.foo;
    },
    { onStop: () => { dummy = 2} }
    )

    expect(dummy).toBe(1);
    stop(runner);
    expect(dummy).toBe(2)
  })

  it("optimize stop", () => {
    let dummy;
    let user = reactive({ foo: 1});
    const runner = effect(()=>{
      dummy = user.foo;
    })
    expect( dummy ).toBe(1);
    user.foo = 2;
    expect( dummy ).toBe(2);
    
    stop( runner );

    user.foo = 3;
    expect(dummy).toBe(2);

    user.foo++;
    // user.foo = user.foo + 1;
    // get -> set -> 重新收集了依赖
    // 但是stop功能希望的是执行之后，以后收集依赖也不会收集runner所属的类了。
    expect( dummy ).toBe(2);
  })
})