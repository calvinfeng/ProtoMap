import {fetchTopTracks, fetchArtists} from '../utils/spotifyApi';
import {receiveArtists} from '../actions/artistActions';

const spotifyMiddleware = ({getState, dispatch}) => next => action => {

  const successCallback = (artists) => {
    dispatch(receiveArtists(artists));
  };

  const errorCallback = (errors) => {
    console.log(errors);
  };

  switch(action.type) {
    case 'RECEIVE_ARTISTS':
      fetchArtists(successCallback, errorCallback);
      return next(action);
    default:
      return next(action);
  }

};

export default spotifyMiddleware;
