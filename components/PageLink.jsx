import React from 'react';
// use export default if there is only a single export
export default class PageLink extends React.Component {
  render() {
    return (
      <a href={"https://www.facebook.com/" + this.props.pagename}>
        {this.props.pagename}
      </a>
    );
  }
}
