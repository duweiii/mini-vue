const queue: any = []
let isFlushPending = false;
let p = Promise.resolve();

export function queueJobs(fn){
  if( !queue.includes(fn) ){
    queue.push( fn )
    queueFlush();
  }
}

export function nextTick(fn){
  return fn ? p.then(fn) : p;
}

function queueFlush(){
  // 控制微任务的分配，执行站执行期间只需要分配一次微任务即可。
  // 等到执行栈清空，执行微任务时再打开开关，允许再分配微任务。
  if( isFlushPending ) return ;
  isFlushPending = true;
  nextTick( flushJobs )
}

function flushJobs(){
  isFlushPending = false;
  let job;
  while((job = queue.shift())){
    job && job();
  }
}