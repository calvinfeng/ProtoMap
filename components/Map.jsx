"use strict";

import React       from 'react';
import Renderer    from './Renderer/Renderer';
import Mousetrap   from 'mousetrap';

import { fetchDefaultMapName, fetchMapImage } from '../actions/mapActions';
import { connect } from 'react-redux';

class Map extends React.Component {

  constructor(props) {
    super(props);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleUpdateAnnotationData = this.handleUpdateAnnotationData.bind(this);
    this.handleEnableCreateFreeAreaRectangleTool = this.handleEnableCreateFreeAreaRectangleTool.bind(this);
    this.handleEnableCreateFreeAreaPolygonTool = this.handleEnableCreateFreeAreaPolygonTool.bind(this);
    this.handleEnableCreateKeepoutAreaRectangleTool = this.handleEnableCreateKeepoutAreaRectangleTool.bind(this);
    this.handleEnableCreateKeepoutAreaPolygonTool = this.handleEnableCreateKeepoutAreaPolygonTool.bind(this);
    this.handleEnableViewControlsTool = this.handleEnableViewControlsTool.bind(this);
  }

  componentWillMount() {
    //this.props.dispatchFetchDefaultMapName();
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentDidMount() {
    this.renderer = new Renderer(this.refs.canvas, this.handleUpdateAnnotationData);
    Mousetrap.bind('0', this.handleEnableViewControlsTool);
    Mousetrap.bind('1', this.handleEnableCreateFreeAreaRectangleTool);
    Mousetrap.bind('2', this.handleEnableCreateFreeAreaPolygonTool);
    Mousetrap.bind('3', this.handleEnableCreateKeepoutAreaRectangleTool);
    Mousetrap.bind('4', this.handleEnableCreateKeepoutAreaPolygonTool);
    this.props.dispatchFetchMapImage();
  }

  componentWillReceiveProps(nextProps) {
    this.renderer.setVisualizationMapImage(nextProps.mapImage);
  }

  componentWillUnmount() {
    if (this.renderer) {
      this.renderer.destroy();
    }
    Mousetrap.unbind(['0']);
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleEnableViewControlsTool() {
    console.log("Enabled control tool");
    if (this.renderer) {
      this.renderer.enableViewControlsTool();
    }
  }

  handleEnableCreateFreeAreaRectangleTool() {
    console.log("Enabled free area rectangle tool");
    if (this.renderer) {
      this.renderer.enableCreateFreeAreaRectangleTool();
    }
  }

  handleEnableCreateFreeAreaPolygonTool() {
    console.log("Enabled free area polygon tool");
    if (this.renderer) {
      this.renderer.enableCreateFreeAreaPolygonTool();
    }
  }

  handleEnableCreateKeepoutAreaRectangleTool() {
    console.log("Enabled keepout area rectangle tool")
    if (this.renderer) {
      this.renderer.enableCreateKeepoutAreaRectangleTool();
    }
  }

  handleEnableCreateKeepoutAreaPolygonTool() {
    console.log("Enabled keepout area polygon tool")
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
    console.log("updated annotation data is dispatching to server");
    //return this.props.dispatchMapDataUpdate(this.props.mapId, mapData);
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
    mapId: state.maps.mapId,
    mapImage: state.maps.mapImage
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchFetchDefaultMapName: () => dispatch(fetchDefaultMapName()),
    dispatchFetchMapImage: () => dispatch(fetchMapImage())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
