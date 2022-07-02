import { generate } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformChildren } from "./transforms/transformChildren";
import { transformElement } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transformExpression";
import { transformText } from "./transforms/transformText";

export function baseCompile(template: string){
  const ast: any = baseParse(template);
  transform(ast, {
    nodeTransforms: [ transformExpression, transformChildren, transformElement, transformText]
  })
  return generate(ast);
}