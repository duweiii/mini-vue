export * from './runtime-dom/index'
export * from './reactiviy/index'

import { baseCompile } from './compiler-core/src/compile';
import * as runtimeDom from './runtime-dom/index';
import { registerCompiler } from './runtime-dom/index';

function compileToFunction(template: string){
  const { code } = baseCompile(template);

  const render = new Function('Vue', code)(runtimeDom);

  return render;
}

registerCompiler(compileToFunction);