import uuid             from 'node-uuid';
import EventEmitter     from 'eventemitter2';
import { Path }         from 'paper';

// Fetch
import AreaModel    from '../Models/AreaModel';

export default class CreateAreaPolygonTool extends EventEmitter {
  constructor(renderer, createView, guideAttributes, annotationType) {
    super({ maxListeners: 0 });
    this.createView = createView;
    this.guideAttributes = guideAttributes;
    this.annotationType = annotationType;
    this.handleClick = this.handleClick.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.renderer = renderer;
    this.realWorldCoordinatesGroup = renderer.realWorldCoordinatesGroup;
  }

  /**
  * Binds all the relevant event handlers for creating Areas to the associated Paper.View.
  */
  enableViewEventHandlers() {
    this.renderer.project.view.on('mousemove', this.mouseMoveHandler);
    this.renderer.project.view.on('click', this.handleClick);
  }

  resetTool() {
    this.currentAreaModel = null;
    this.currentAreaView.remove();
    this.currentAreaView = null;
    this.guideLines.remove();
    this.guideLines = null;
  }

  createHelperLines(point) {
    this.guideLines = new Path(Object.assign({}, this.guideAttributes, {
      segments: [point],
      closed: false
    }));

    this.realWorldCoordinatesGroup.addChild(this.guideLines);
  }

  updateHelperLines(point) {
    const firstPoint = this.currentAreaModel.points[0];
    const lastPoint = this.currentAreaModel.points[this.currentAreaModel.points.length - 1];
    this.guideLines.removeSegments();
    this.guideLines.addSegments([firstPoint, point, lastPoint]);
  }

  createNewModel(point) {
    const points = [{ x: point.x, y: point.y }];
    this.currentAreaModel = new AreaModel({
      uuid: uuid.v4(),
      points: points,
      shape: 'POLYGON',
      annotation_type: this.annotationType
    });
    this.currentAreaView = this.createView(this.realWorldCoordinatesGroup, this.currentAreaModel);
    this.createHelperLines(point);
  }

  updateExistingModel(point) {
    const points = [
      ...this.currentAreaModel.points,
      { x: point.x, y: point.y }
    ];
    this.currentAreaModel.setProps({ points });
  }

  handleClick(e) {
    e.stop();
    const point = this.realWorldCoordinatesGroup.globalToLocal(e.point);
    if (e.modifiers.shift) {
      const areaModel = this.currentAreaModel;
      this.resetTool();
      this.emit('create', areaModel);
      return;
    }

    if (this.currentAreaModel) {
      this.updateExistingModel(point);
    } else {
      this.createNewModel(point);
    }
  }

  mouseMoveHandler(e) {
    if (!this.currentAreaModel) {
      return;
    }
    e.stop();
    const point = this.realWorldCoordinatesGroup.globalToLocal(e.point);
    this.updateHelperLines(point);
  }

}
