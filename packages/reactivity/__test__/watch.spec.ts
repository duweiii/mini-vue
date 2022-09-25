import { reactive } from '../src/reactive'
import { ref } from '../src/ref'
import { watch } from '../src/watch'

function asyncMaker (n = 2) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, n * 1000)
  }) 
}

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
    
    // 3-options.flush
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
})

// function onInvalidateTest(){
//   const refValue = ref(0);
  
//   document.getElementById("ref").addEventListener('click', () => {
//       refValue.value += 1;
//   })

//   watch(
//     refValue,
//     (oldValue, newValue, onInvalidate) => {
//       let control_ = true;

//       onInvalidate(()=>{
//         control_ = false;
//       })

//       timeoutPromise()
//       .then( () => {
//         if( control_ ){
//           console.log("哈哈哈哈", refValue.value )
//         }
//       })
//     }
//   )
// }
// onInvalidateTest()