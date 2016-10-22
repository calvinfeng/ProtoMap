"use strict";

import React       from 'react';
import Renderer    from './Renderer/Renderer';
import Mousetrap   from 'mousetrap';

import { connect } from 'react-redux';

class Map extends React.Component {

  constructor(props) {
    super(props);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleUpdateAnnotationData = this.handleUpdateAnnotationData.bind(this);
    this.handleEnableFreeAreaRectangleTool = this.handleEnableFreeAreaRectangleTool.bind(this);
    this.handleEnableCreateFreeAreaPolygonTool = this.handleEnableCreateFreeAreaPolygonTool.bind(this);
    this.handleEnableCreateKeepoutAreaRectangleTool = this.handleEnableCreateKeepoutAreaRectangleTool.bind(this);
    this.handleEnableCreateKeepoutAreaPolygonTool = this.handleEnableCreateKeepoutAreaPolygonTool.bind(this);
    this.handleEnableViewControlsTool = this.handleEnableViewControlsTool.bind(this);
  }

  componentWillMount() {
    this.props.dispatchFetchDefaultMapName();
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentDidMount() {
    if (this.props.mapId) {
      this.props.dispatchFetchMapImage(this.props.mapId);
      this.renderer = new Renderer(this.refs.canvas, this.handleUpdateAnnotationData);
    }
    Mousetrap.bind('0', this.handleEnableViewControlsTool);
    Mousetrap.bind('1', this.handleEnableCreateFreeAreaRectangleTool);
    Mousetrap.bind('2', this.handleEnableCreateFreeAreaPolygonTool);
    Mousetrap.bind('3', this.handleEnableCreateKeepoutAreaRectangleTool);
    Mousetrap.bind('4', this.handleEnableCreateKeepoutAreaPolygonTool);
  }

  componentWillReceiveProps(nextProps) {
    //Doesn't really need to do anything
  }

  componentWillUnmount() {
    if (this.renderer) {
      this.renderer.destroy();
    }
    Mousetrap.unbind(['0']);
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleEnableViewControlsTool() {
    if (this.renderer) {
      this.renderer.enableViewControlsTool();
    }
  }

  handleEnableCreateFreeAreaRectangleTool() {
    if (this.renderer) {
      this.renderer.enableCreateFreeAreaRectangleTool();
    }
  }

  handleEnableCreateFreeAreaPolygonTool() {
    if (this.renderer) {
      this.renderer.enableCreateFreeAreaPolygonTool();
    }
  }

  handleEnableCreateKeepoutAreaRectangleTool() {
    if (this.renderer) {
      this.renderer.enableCreateKeepoutAreaRectangleTool();
    }
  }

  handleEnableCreateKeepoutAreaPolygonTool() {
    if (this.renderer) {
      this.renderer.enableCreateKeepoutAreaPolygonTool();
    }
  }

  handleWindowResize() {
    if (this.renderer) {
      this.renderer.setViewSize(this.refs.container.offsetWidth, this.refs.container.offsetHeight);
    }
  }

  handleUpdateAnnotationData(annotationData) {
    const mapData = { annotations: annotationData };
    return this.props.dispatchMapDataUpdate(this.props.mapId, mapData);
  }

  render() {
    return (
      <div ref="container" className="map">
        <canvas ref="canvas" data-resize="true"></canvas>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    mapId: state.mapId,
    mapImage: state.mapImage
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchFetchDefaultMapName: () => dispatch(fetchDefaultMapName()),
    dispatchFetchMapImage: () => dispatch(fetchMapImage())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
