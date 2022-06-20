import { createVNode } from "./createVNode"

export function createAppAPI(render){
  return function createApp( rootComponent ){
    return {
      mount(rootContainer){
        const vNode = createVNode(rootComponent);
        render(vNode, rootContainer, null)
      }
    }
  }
}