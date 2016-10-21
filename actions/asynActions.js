export const TICK = 'TICK';
export const UNTICK = 'UNTICK';

export const tickPerSecond = function() {
  return function(dispatch) {
    dispatch({ type: TICK });
    setInterval(() => {
      dispatch({ type: TICK });
    }, 100);
  }
}
