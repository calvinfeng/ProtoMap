import React                            from 'react';
import ReactDOM                         from 'react-dom';
import thunkMiddleware                  from 'redux-thunk';
import { Provider }                     from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

// Reducers
import rootReducer     from '../reducers/rootReducer';

// Components
import SearchContainer from './SearchContainer';
import Map             from './Map';

class SpotifyApp extends React.Component {
    render() {
        return (
            <div className="app-container">
                <SearchContainer />
                <Map />
            </div>
        );
    }
}

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
document.addEventListener('DOMContentLoaded',
    function() {
        ReactDOM.render(
            <Provider store={store}><SpotifyApp /></Provider>,
            document.getElementById('application')
        );
    }
);
