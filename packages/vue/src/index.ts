export * from '@guide-mini-vue/runtime-dom'
import { baseCompile } from '@guide-mini-vue/compiler-core';
import * as runtimeDom from '@guide-mini-vue/runtime-dom';
import { registerCompiler } from '@guide-mini-vue/runtime-dom';

function compileToFunction(template: string){
  const { code } = baseCompile(template);

  const render = new Function('Vue', code)(runtimeDom);

  return render;
}

registerCompiler(compileToFunction);