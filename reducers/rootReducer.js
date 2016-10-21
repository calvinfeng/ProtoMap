import artistsReducer from './artistsReducer';
import ticksReducer   from './ticksReducer';
// Thirdparty
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  artists: artistsReducer,
  count: ticksReducer
});

export default rootReducer;
