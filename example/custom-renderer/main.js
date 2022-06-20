import { createRenderer } from '../../lib/guide-mini-vue.esm.js'
import { App } from './app.js'

let game = new PIXI.Application({
  width: 500,
  height: 500,
})

document.querySelector("#app").append(game.view)

const renderer = createRenderer({
  createElement(type){
    if( type === 'rect' ){
      let rect = new PIXI.Graphics()
      rect.beginFill(0xff0000);
      rect.drawRect(0, 0, 100, 100)
      rect.endFill();
      return rect;
    }
  },
  patchProp(el, key, prevValue, nextValue){
    el[key] = nextValue;
  },
  insert(el, parent){
    parent.addChild(el)
  }
})

// createApp(App).mount(document.querySelector("#app"))
renderer.createApp(App).mount(game.stage)