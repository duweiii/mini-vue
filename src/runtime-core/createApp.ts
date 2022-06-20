import { createVNode } from "./createVNode"
import { render } from "./render";

export function createApp( rootComponent ){
  return {
    mount(rootContainer){
      const vNode = createVNode(rootComponent);
      render(vNode, rootContainer, null)
    }
  }
}