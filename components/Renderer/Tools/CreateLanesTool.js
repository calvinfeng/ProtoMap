import { Point }        from 'paper';
import uuid             from 'node-uuid';
import EventEmitter     from 'eventemitter2';

// Fetch
import NodeView     from '../Views/NodeView';
import NodeModel    from '../Models/NodeModel';

export default class CreateLanesTool extends EventEmitter {
  constructor(renderer) {
    super({ maxListeners: 0 });
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.renderer = renderer;
    this.realWorldCoordinatesGroup = renderer.realWorldCoordinatesGroup;
    this.nodeModel = null;
    this.nodeView = null;
  }

  enableViewEventHandlers() {
    this.renderer.project.view.on('mousemove', this.handleMouseMove);
    this.renderer.project.view.on('click', this.handleMouseClick);
  }

  handleMouseMove(e) {
    if (!this.nodeModel) {
      const point = this.realWorldCoordinatesGroup.globalToLocal(e.point);
      this.nodeModel = new NodeModel({
        uuid: uuid.v4(),
        point: point
      });
      this.nodeView = new NodeView(this.realWorldCoordinatesGroup, this.nodeModel);
    } else {
      const point = this.realWorldCoordinatesGroup.globalToLocal(e.point);
      this.nodeModel.setProps({ point });
    }
  }

  handleMouseClick(e) {
    if (e.event.button !== 0) {
      return;
    }
    e.stop();
    this.renderer.nodeCollection.addModel(this.nodeModel);
    this.nodeView.remove();
    this.renderer.project.view.off('mousemove', this.handleMouseMove);
    this.renderer.project.view.off('click', this.handleMouseClick);
    this.renderer.startEdgeExtensionFromNode(this.nodeModel);
    this.nodeModel = null;
    this.nodeView = null;
  }
}
