import PageLink from './PageLink';
import PagePic from './PagePic';
import React from 'react';

export default class Avatar extends React.Component {
  render() {
    return (
      <div>
        <PagePic pagename={this.props.pagename} />
        <PageLink pagename={this.props.pagename} />
      </div>
    )
  }
}
