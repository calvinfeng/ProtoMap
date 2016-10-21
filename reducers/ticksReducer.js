import { TICK }   from '../actions/asynActions';
import { UNTICK } from '../actions/asynActions';

const ticksReducer = (state = 0, action) => {
  let nextState = state;
  switch (action.type) {
    case TICK:
      nextState += 1;
      return nextState;

    case UNTICK:
      nextState -= 1;
      return nextState;

    default:
      return state;
  }
};

export default ticksReducer;
