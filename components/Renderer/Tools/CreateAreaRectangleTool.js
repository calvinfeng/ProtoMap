import { Point }        from 'paper';
import uuid             from 'node-uuid';
import EventEmitter     from 'eventemitter2';

// Fetch
import AreaModel    from '../Models/AreaModel';

export default class CreateAreaRectangleTool extends EventEmitter {
  constructor(renderer, createView, annotationType) {
    super({ maxListeners: 0 });
    this.createView = createView;
    this.annotationType = annotationType;
    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);
    this.renderer = renderer;
    this.realWorldCoordinatesGroup = renderer.realWorldCoordinatesGroup;
  }

  /**
  * Binds all the relevant event handlers for creating Areas to the associated Paper.View.
  */
  enableViewEventHandlers() {
    this.renderer.project.view.on('mousedown', this.mouseDownHandler);
    this.renderer.project.view.on('mousemove', this.mouseMoveHandler);
    this.renderer.project.view.on('mouseup', this.mouseUpHandler);
  }

  mouseDownHandler(e) {
    e.stop();
    const from = this.from = this.realWorldCoordinatesGroup.globalToLocal(e.point);
    const points = [
      { x: from.x, y: from.y },
      { x: from.x + 0.01, y: from.y },
      { x: from.x + 0.01, y: from.y - 0.01 },
      { x: from.x, y: from.y + 0.01 }
    ];
    this.areaModel = new AreaModel({
      uuid: uuid.v4(),
      points: points,
      shape: 'RECTANGLE',
      annotation_type: this.annotationType
    });
    this.areaView = this.createView(this.realWorldCoordinatesGroup, this.areaModel);
  }

  mouseMoveHandler(e) {
    if (!this.areaModel) {
      return;
    }
    e.stop();
    const from = this.from;
    const to = this.realWorldCoordinatesGroup.globalToLocal(e.point);
    const points = [
      from,
      new Point(to.x, from.y),
      to,
      new Point(from.x, to.y)
    ];
    this.areaModel.setProps({ points });
  }

  mouseUpHandler(e) {
    if (!this.areaModel) {
      return;
    }
    e.stop();
    this.areaView.remove();
    const areaModel = this.areaModel;
    delete this.areaModel;
    delete this.areaView;
    debugger
    this.emit('create', areaModel);
  }
}
