import merge from 'lodash/merge';

import { ARTIST_DATA_FETCH_SUCCESS } from '../actions/artistActions';
import { ARTIST_DATA_FETCH_FAIL }    from '../actions/artistActions';
import { EMPTY_ARTIST_DATA }         from '../actions/artistActions';

const artistsReducer = (state = {}, action) => {
  //let nextState = merge({}, state);
  let nextState = {};
  switch (action.type) {
    case ARTIST_DATA_FETCH_SUCCESS:
      let items = action.artistItems;
      items.forEach((item) => {
        nextState[item.id] = {
          name: item.name,
          images: item.images,
        }
      });
      return nextState;

    case ARTIST_DATA_FETCH_FAIL:
      console.log(action.error);
      return state;

    case EMPTY_ARTIST_DATA:
      return nextState;

    default:
      return state;
  }
};
export default artistsReducer;
