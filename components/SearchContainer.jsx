import { artistDataFetch } from '../actions/artistActions';
import { tickPerSecond } from '../actions/asynActions';

// Thirdparty
import React       from 'react';
import { connect } from 'react-redux';

class SearchContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {timeoutId: undefined}
    this.__submitHandler = this.__submitHandler.bind(this);
    this.__clickHandler = this.__clickHandler.bind(this);
    this.__updateInputField = this.__updateInputField.bind(this);
    this.__queryArtist = this.__queryArtist.bind(this);
  }

  componentWillReceiveProps(nextProps) {
  }

  __submitHandler(event) {
    event.preventDefault();
  }

  __clickHandler(event) {
    event.preventDefault();
    this.props.dispatchTick();
  }

  __printArtistNames() {
    if (this.props.artists) {
      let artists = this.props.artists;
      return Object.keys(artists).map((id) => {
        return (
          <li key={id}>
            {artists[id].name}
          </li>
        );
      });
    }
  }

  __queryArtist() {
    let artistName = this.state.inputValue;
    this.props.dispatchArtistDataFetch(artistName);
  }

  __updateInputField(event) {
    event.preventDefault();
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
    let id = setTimeout(this.__queryArtist, 300);
    this.setState({inputValue: event.target.value, timeoutId: id});
  }

  render() {
    return (
      <div className="search-container">
        <form onSubmit={this.__submitHandler}>
          <input width="400" onChange={this.__updateInputField}></input>
          <input type="submit"></input>
          <div>Input value: {this.state.inputValue}</div>
          <div>Count: {this.props.count}</div>
        </form>
        <ul onClick={this.__clickHandler}>
          {this.__printArtistNames()}
        </ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  artists: state.artists,
  count: state.count
});

const mapDispatchToProps = (dispatch) => ({
  dispatchArtistDataFetch: (artistName) => dispatch(artistDataFetch(artistName)),
  dispatchTick: () => dispatch(tickPerSecond())
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);
