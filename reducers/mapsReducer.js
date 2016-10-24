import { MAP_NAME_FETCH_SUCCESS }  from '../actions/mapActions';
import { MAP_NAME_FETCH_FAIL }     from '../actions/mapActions';
import { MAP_IMAGE_FETCH_SUCCESS } from '../actions/mapActions';
import { MAP_IMAGE_FETCH_FAIL }    from '../actions/mapActions';
import merge from 'lodash/merge';

const mapsReducer = (state = {mapId: undefined, mapImage: undefined}, action) => {
  let nextState = merge({}, state);
  switch (action.type) {
    case MAP_NAME_FETCH_SUCCESS:
      nextState['mapId'] = action.mapId
      return nextState;

    case MAP_IMAGE_FETCH_SUCCESS:
      nextState['mapImage'] = action.mapImage
      return nextState;

    default:
      return state;
  }
};

export default mapsReducer;
