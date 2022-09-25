import { reactive } from '../src/reactive'
import { ref } from '../src/ref'
import { watch } from '../src/watch'
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
    
})

// Test
// function demoTest(){
 
//   const reactiveValue = reactive({
//       name: 1,
//       age: 2
//   })  
  
//   document.getElementById("ref").addEventListener('click', () => {
//       refValue.value += 1;
//       // console.log(`控制callback的校验时机\n'pre为直接执行'\n'post'为分配到为任务队列执行，也就是执行栈清空后再执行`)
//   })
  
//   document.getElementById("reactive").addEventListener('click', () => {
//       reactiveValue.name = Math.random();
//       // reactiveValue.age = Math.random();
//   })

//   // watch([ () => reactiveValue.name, refValue ], () => {
//   //     console.log("响应式数据更新，执行scheduler")
//   // })
//   watch(
//     refValue,
//     (oldValue, newValue) => {
//       console.log(`oldValue: ${oldValue}, newValue: ${newValue}`)
//     },
//     {
//       immediately: false,
//       flush: 'post'
//     }
//   )
// }
// demoTest();







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
// function timeoutPromise () {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(1)
//     }, 2000)
//   }) 
// }
// onInvalidateTest()