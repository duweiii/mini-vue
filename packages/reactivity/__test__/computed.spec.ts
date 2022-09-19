import { computed } from "../src/computed"
import { reactive } from "../src/reactive"
import { vi } from 'vitest';
describe("computed", () => {
  it("happy path", () => {
    const a = reactive({ foo: 1 });
    const getter = vi.fn(() => a.foo)
    const v = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled()

    // get value and execute getter
    expect(v.value).toBe(1);
    expect(getter).toHaveBeenCalled();

    // cache
    v.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // change value ( a ), should not call getter
    a.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // change value ( a ), and get v.value , should call getter
    v.value;
    expect(getter).toHaveBeenCalledTimes(2);
  })
})