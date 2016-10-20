import { combineReducers } from 'redux';
import fruitsReducer from './fruitsReducer';
import farmersReducer from './farmersReducer';

const rootReducer = combineReducers({
  fruits: fruitsReducer,
  farmers: farmersReducer
});

export default rootReducer;
