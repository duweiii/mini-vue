// import { ref } from '../src/ref'
// import { watch } from '../src/watch'
// describe.only("watch happy path", () => {
//     const refValue = ref(1)
//     const exec = () => { console.log('refValue值更新,回调被执行') };
//     watch(refValue, exec)
//     setTimeout(()=>{
//         refValue.value = 2;
//     },1000)
// })