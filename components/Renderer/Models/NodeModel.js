import { EventEmitter2 } from 'eventemitter2';
import { Point }         from 'paper';

export default class NodeModel extends EventEmitter2 {
  constructor(data) {
    super({ maxListeners: 0 });

    this.id = data.uuid;
    this.point = new Point(data.point.x, data.point.y);
  }

  setProps({ point }) {
    this.point = new Point(point);
    this.emit('change', this.point);
  }

  destroy() {
    this.emit('destroy', this); // do this before removing all listeners so they get the event first
    this.removeAllListeners();
  }

  toJSON() {
    return {
      uuid: this.id,
      point: {
        x: this.point.x,
        y: this.point.y
      }
    };
  }
}
