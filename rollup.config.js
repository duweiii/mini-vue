// import typescript from "@rollup/plugin-typescript";
// import pkg from "./package.json";
// export default {
//   input: "./src/index.ts",
//   output: [
//     {
//       format: "cjs",
//       file: pkg.main
//     },
//     {
//       format: "esm",
//       file: pkg.module
//     }
//   ],
//   plugins: [typescript()] 
// }
import typescript from "@rollup/plugin-typescript";
export default {
  input: "./packages/vue/src/index.ts",
  output: [
    {
      format: "cjs",
      file: './packages/vue/dist/guide-mini-vue.cjs.js'
    },
    {
      format: "esm",
      file: "./packages/vue/dist/guide-mini-vue.esm.js"
    }
  ],
  plugins: [typescript()] 
}