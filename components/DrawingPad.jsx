import React from 'react';
import { Point, Path, PaperScope } from 'paper'

const canvasStyle = {
  width: 1000,
  height: 500,
  border: "1px solid black"
}

class DrawingPad extends React.Component {

  constructor() {
    super();
    this.scope = new PaperScope();
    this.scope.settings.applyMatrix = false;
    this.scope.settings.InsertItems = false;
    this.state = {isDrawing: false};
    this.__enableHandlers = this.__enableHandlers.bind(this);
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
  }

  componentDidMount() {
    let canvas = document.getElementById('myCanvas');
    this.scope.setup(canvas);
    this.project = this.scope.project;
    this.project.activate();
    this.__enableHandlers();
  }
  __enableHandlers() {
    this.project.view.on('mousedown', this.mouseDownHandler);
    this.project.view.on('mousemove', this.mouseMoveHandler);
    this.project.view.on('mouseup', this.mouseUpHandler);
  }

  mouseDownHandler(event) {
    event.stop();
    if (this.path === undefined) {
      this.startPoint = new Point(event.point);
    } else {
      this.path.add(event.point);
    }
  }

  mouseMoveHandler(event) {
    if (this.path) {
      for (let i = 0; i < this.path.curves.length; i++) {
        if (event.point.y > 250) {
          this.path.curves[i].handle1.y += 10;
          this.path.curves[i].handle2.y += 10;
        } else {
          this.path.curves[i].handle1.y -= 10;
          this.path.curves[i].handle2.y -= 10;
        }
      }
    }
  }

  mouseUpHandler(event) {
    if (this.path === undefined) {
      this.path = new Path();
      this.path.strokeColor = "black";
      this.path.fullySelected = true;
      this.path.closed = true;
      this.path.add(this.startPoint);
    }
    this.path.insert(1, event.point);
  }

  render() {
    return (
      <div className="canvasContainer">
        <canvas style = {canvasStyle} id="myCanvas" onClick={this.__clickHandle}>
        </canvas>
      </div>
    )
  }

}

export default DrawingPad;
