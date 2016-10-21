"use strict";

// Thirdparty imports
import request from 'axios';

export const ARTIST_DATA_FETCH_SUCCESS = 'ARTIST_DATA_FETCH_SUCESS';
export const ARTIST_DATA_FETCH_FAIL = 'ARTIST_DATA_FETCH_FAIL';
export const EMPTY_ARTIST_DATA = 'EMPTY_ARTIST_DATA';

export const artistDataFetchSuccess = (data) => {
  return {
    type: ARTIST_DATA_FETCH_SUCCESS,
    artistItems: data.artists.items
  };
};

export const artistDataFetchFail = (error) => {
  return {
    type: ARTIST_DATA_FETCH_FAIL,
    error: error
  }
};

export const emptyArtistData = () => {
  return {
    type: EMPTY_ARTIST_DATA
  }
}

// ES5
// With Redux Thunk, if you dispatch a function, it will receive dispatch as
// an argument
export const artistDataFetch = function(artistName) {
  return function(dispatch) {
    if (artistName.length > 0) {
      request.get(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`)
      .then(res => dispatch(artistDataFetchSuccess(res.data)))
      .catch(error => dispatch(artistDataFetchFail(error)));
    } else {
      dispatch(emptyArtistData());
    }
  }
}

// ES6
// export const artistDataFetch = (artistName) => (dispatch) => {
//   if (artistName.length > 0) {
//     request.get(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`)
//     .then(res => dispatch(artistDataFetchSuccess(res.data)))
//     .catch(error => dispatch(artistDataFetchFail(error)));
//   } else {
//     dispatch(emptyArtistData());
//   }
// };
