"use strict";

import { Point }            from 'paper';
import { Path }             from 'paper';
import { Group }            from 'paper';
import { EventEmitter2 }    from 'eventemitter2';

const attributes = {
  radius: 0.25,
  fillColor: '#287DA5',
  shadowColor: '#333',
  shadowBlur: 0.01,
  shadowOffset: new Point(0.001, -0.001)
};

export default class NodeView extends EventEmitter2 {
  constructor(parentGroup, model) {
    super({ maxListeners: 0 });
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDragForViewGroup = this.handleMouseDragForViewGroup.bind(this);

    this.triggerUpdateOnMouseUp = false;
    this.modelClass = model;

    this.point = model.point;
    this.viewGroup = new Group();
    this.viewGroup.on('mouseup', this.handleMouseUp);
    this.viewGroup.on('mousedrag', this.handleMouseDragForViewGroup);
    this.viewGroup.on('click', this.handleClick);

    this.parentGroup = parentGroup;
    this.parentGroup.addChild(this.viewGroup);

    this.circlePath = new Path.Circle(Object.assign(attributes, {
      center: this.modelClass.point
    }));
    this.viewGroup.addChild(this.circlePath);
    this.modelClass.on('change', this.handleChange);
  }

  handleChange(point) {
    const delta = point.subtract(this.point);
    this.point = point;
    this.circlePath.translate(delta);
  }

  handleClick(e) {
    if (!e.modifiers.control && !e.modifiers.command) {
      return;
    }
    this.modelClass.destroy();
    this.emit('update');
  }

  handleMouseDragForViewGroup(e) {
    e.stop();
    this.triggerUpdateOnMouseUp = true;
    const mousePoint = this.viewGroup.globalToLocal(e.point);
    this.modelClass.setProps({ point: mousePoint });
  }

  handleMouseUp() {
    if (this.triggerUpdateOnMouseUp) {
      this.emit('update');
    }
    this.triggerUpdateOnMouseUp = false;
  }
  remove() {
    this.modelClass.off('change', this.handleChange);
    this.viewGroup.remove();
    this.removeAllListeners();
  }
}
