export const MAP_NAME_FETCH_SUCCESS = 'MAP_NAME_FETCH_SUCCESS';
export const MAP_NAME_FETCH_FAIL = 'MAP_NAME_FETCH_FAIL';
export const MAP_IMAGE_FETCH_SUCCESS = 'MAP_NAME_FETCH_SUCCESS';
export const MAP_IMAGE_FETCH_FAIL = 'MAP_IMAGE_FETCH_FAIL';

const mapNameFetchSuccess = () => {
  return {
    type: MAP_NAME_FETCH_SUCCESS,
    mapId: '20161021map'
  };
}

const mapImageFetchSuccess = () => {
  return {
    type: MAP_IMAGE_FETCH_SUCCESS,
    mapImage: "https://phosgene.files.wordpress.com/2011/01/lost-temple.jpg"
  };
}

export const fetchDefaultMapName = function() {
  return function(dispatch) {
    setTimeout(dispatch(mapNameFetchSuccess()),1000);
  };
}

export const fetchMapImage = function() {
  return function(dispatch) {
    setTimeout(dispatch(mapImageFetchSuccess()), 1000);
  };
}
