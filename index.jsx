import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers/rootReducer';
import Avatar from './components/Avatar';

const store = createStore(rootReducer);
class SpotifyApp extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Avatar pagename="Engineering"></Avatar>
      </Provider>
    );
  }
}

document.addEventListener("DOMContentLoaded", function() {
  ReactDOM.render(<SpotifyApp/>, document.getElementById("application"));
});
