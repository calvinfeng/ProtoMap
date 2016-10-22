import artistsReducer from './artistsReducer';
import ticksReducer   from './ticksReducer';
import mapsReducer    from './mapsReducer';
// Thirdparty
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  artists: artistsReducer,
  count: ticksReducer,
  maps: mapsReducer
});

export default rootReducer;
