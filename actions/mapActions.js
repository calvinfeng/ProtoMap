export const MAP_NAME_FETCH_SUCCESS = 'MAP_NAME_FETCH_SUCCESS';
export const MAP_NAME_FETCH_FAIL = 'MAP_NAME_FETCH_FAIL';
export const MAP_IMAGE_FETCH_SUCCESS = 'MAP_IMAGE_FETCH_SUCCESS';
export const MAP_IMAGE_FETCH_FAIL = 'MAP_IMAGE_FETCH_FAIL';

const mapNameFetchSuccess = () => {
  return {
    type: MAP_NAME_FETCH_SUCCESS,
    mapId: '20161021map'
  };
}

const mapImageFetchSuccess = () => {
  const imageElement = new Image();
  imageElement.src = "https://phosgene.files.wordpress.com/2011/01/lost-temple.jpg";
  const visualizationImageData = {
    dataUrl: "https://phosgene.files.wordpress.com/2011/01/lost-temple.jpg",
    imageElement: imageElement
  };
  return {
    type: MAP_IMAGE_FETCH_SUCCESS,
    mapImage: imageElement
  };
}

export const fetchDefaultMapName = function() {
  return function(dispatch) {
    dispatch({
      type: MAP_NAME_FETCH_SUCCESS,
      mapId: '20161021map'
    });
  };
}

export const fetchMapImage = function() {
  return function(dispatch) {
    dispatch(mapImageFetchSuccess());
  };
}
