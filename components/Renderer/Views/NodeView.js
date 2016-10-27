'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Nadir Muzaffar

// Thirdparty imports
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
        this.model = model;

        this.point = model.point;
        this.viewGroup = new Group({id: model.id});

        this.viewGroup.on('mouseup', this.handleMouseUp);
        this.viewGroup.on('mousedrag', this.handleMouseDragForViewGroup);
        this.viewGroup.on('click', this.handleClick);

        this.parentGroup = parentGroup;
        this.parentGroup.addChild(this.viewGroup);

        this.circlePath = new Path.Circle(Object.assign(attributes, {
            center: this.model.point
        }));

        this.viewGroup.addChild(this.circlePath);

        this.model.on('change', this.handleChange);
    }

    handleChange(point) {
        const delta = point.subtract(this.point);
        this.point = point;

        this.circlePath.translate(delta);
    }

    handleClick(e) {
        if ((!e.modifiers.control && !e.modifiers.command) || e.modifiers.shift) {
            return;
        }

        this.model.destroy();
        this.emit('update');
    }

    handleMouseDragForViewGroup(e) {
        if (e.modifiers.shift) {
            return;
        }

        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const mousePoint = this.viewGroup.globalToLocal(e.point);
        this.model.setProps({ point: mousePoint });
    }

    handleMouseUp() {
        if (this.triggerUpdateOnMouseUp) {
            this.emit('update');
        }

        this.triggerUpdateOnMouseUp = false;
    }

    remove() {
        this.model.off('change', this.handleChange);

        this.viewGroup.remove();

        this.removeAllListeners();
    }
}
