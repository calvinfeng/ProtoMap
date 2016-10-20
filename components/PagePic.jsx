import React from 'react';
import {addOrange, addFruit} from '../actions/fruitActions';

// use export default if there is only a single export
export default class PagePic extends React.Component {
  constructor(props) {
    super(props);
    this.forceUpdate = this.forceUpdate.bind(this);
    store.subscribe(this.forceUpdate);
  }

  clickHandle(event) {
    event.preventDefault();
    store.dispatch(addFruit("grape"));
  }

  render() {
    return (
      <div>
        <img
          src={"https://graph.facebook.com/" + this.props.pagename + '/picture'}
          onClick={this.clickHandle}
        />
        <ul>
          {store.getState()["fruits"].map((fruit, idx) => (<li key={idx}>{fruit}</li>))}
        </ul>
      </div>
    );
  }
}
