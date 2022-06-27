const str = '12312abc1abc)ab12abc'

function test(str){
  let startIndex;
  let endIndex;
  let i;
  let result = false;
  let indexArray = [];
  function waitForA(str){
    if(str === 'a'){
      startIndex = i;
      return waitForB;
    }
    return waitForA
  }
  function waitForB(str){
    if(str === 'b'){
      return waitForC;
    }
    return waitForA
  }
  function waitForC(str){
    if(str === 'c'){
      result = true;
      endIndex = i;
      return end;
    }
    return waitForA
  }
  function end(){
    return end;
  }

  let currentState = waitForA;
  for( i = 0; i < str.length; i++ ){
    currentState = currentState(str[i])
    if( currentState === end ) {
      currentState = waitForA;
      indexArray.push([startIndex, endIndex])
    }
  }
  console.log( indexArray )
  return result;
}

console.log( test(str) )