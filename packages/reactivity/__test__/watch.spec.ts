import { reactive } from '../src/reactive'
import { ref } from '../src/ref'
import { watch } from '../src/watch'
import { vi } from 'vitest'
describe("watch happy path", () => {
    // 1-监听对象的几种case
    it('happy path 1 - ref', () => {
      const refValue = ref(0);
      let count = 0;
      watch(
        refValue,
        () => count++
      )
      refValue.value += 1;
      expect(count).toBe(1)
    })
    it('happy path 1 - reactive', () => {
      const reactiveValue = reactive({
        name: 1,
        age: 1,
      });
      let count = 0;
      watch(
        reactiveValue,
        () => count++
      )
      reactiveValue.name += 1;
      expect(count).toBe(1)
      reactiveValue.age += 1;
      expect(count).toBe(2)
    })
    it('happy path 1 - getter', () => {
      const reactiveValue = reactive({
        name: 1
      });
      let count = 0;
      watch(
        () => reactiveValue.name,
        () => count++
      )
      reactiveValue.name += 1;
      expect(count).toBe(1)
    })
    it('happy path 1 - reactivityUnitArray', () => {
      const reactiveValue = reactive({
        name: 1
      });
      const refValue = ref(0)
      let count = 0;
      watch(
        [refValue, () => reactiveValue.name],
        () => count++
      )
      reactiveValue.name += 1;
      expect(count).toBe(1)
      refValue.value += 1;
      expect(count).toBe(2)
    })
    
    // 2-callback中可以接收新值旧值
    it('oldValue&newValue', () => {
      const num = ref(0);
      let oldV,newV;
      watch(
        num,
        (oldValue, newValue) => {
          oldV = oldValue;
          newV = newValue;
        }
      )

      num.value += 1;
      expect(oldV).toBe(0)
      expect(newV).toBe(1)
      num.value += 1;
      expect(oldV).toBe(1)
      expect(newV).toBe(2)
    })

    // 3-options.immediately
    it('execute callback immediately', () => {
      const num = ref(0);
      let count = 0;
      watch(
        num,
        () => {
          count++;
        },
        {
          immediately: true
        }
      )
      expect(count).toBe(1)
    })
    
    // 4-options.flush
    it('occasion of trigger callback 1 - pre', () => {
      const num = ref(0);
      let count = 0;
      watch(
        num,
        () => {
          count = 5;
        },
        { flush: 'pre' }
      )
      num.value += 1;
      expect(count).toBe(5)
    })
    it('occasion of trigger callback 2 - post', () => {
      const num = ref(0);
      let count = 0;
      watch(
        num,
        () => {
          count = 5;
        },
        { flush: 'post' }
      )
      num.value += 1;

      expect(count).toBe(0)

      Promise.resolve()
      .then(()=>{
        expect(count).toBe(5)
      })
    })

    // 5-支持清除副作用函数
    it('cleanup function - 1 - normal', () => {
      const r = ref(0);
      let count = 0;
      watch(
        r,
        (oldv,newv, onInvalidate) => {
          let control = true;
          Promise.resolve().then(() => {
            if( control ){
              count = 5;
            }
          })
        }
      )
      r.value = 1;
      expect(count).toBe(0)
      Promise.resolve().then( () => expect(count).toBe(5) )
    })

    it('cleanup function - 2 - use cleanup', () => {
      const r = ref(0);
      let count = 0;
      watch(
        r,
        (oldv,newv, onInvalidate) => {
          let control = true;
          onInvalidate(() => {
            count = 2;
            control = false;
          })
          Promise.resolve().then(() => {
            if( control ){
              console.log("当前log只执行一次(第一次没命中判断，第二次命中),因为当第二次更新ref值时，执行第一次的cleanup，第一次的control修改为false，无法进入判断分支了。")
              count = 5;
            }
          })
        }
      )
      r.value = 1;
      expect(count).toBe(0)
      r.value = 2;
      expect(count).toBe(2)

      Promise.resolve().then( () => {
        expect(count).toBe(5)
      } )

    })
})