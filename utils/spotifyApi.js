export const fetchArtists = (success, error) => {
  $.ajax({
    method: 'GET',
    url: "https://api.spotify.com/v1/search?q=elvis&type=artist",
    success: success,
    error: error
  });
};

export const fetchTopTracks = (success, error) => {
  $.ajax({
    method: 'GET',
    url: 'https://api.spotify.com/v1/artists/43ZHCT0cAZBISjO8DG9PnE/top-tracks?country=US',
    success: success,
    error: error
  });
};
