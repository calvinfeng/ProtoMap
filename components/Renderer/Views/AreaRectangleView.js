'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Nadir Muzaffar

// Thirdparty imports
import { Point }            from 'paper';
import { Path }             from 'paper';
import { Group }            from 'paper';
import { EventEmitter2 }    from 'eventemitter2';
import { Matrix }           from 'paper';

// Fetch imports
import { handleAttributes }    from '../attributes';

export default class AreaRectangleView extends EventEmitter2 {
    constructor(parentGroup, model, attributes) {
        super({ maxListeners: 0 });

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        this.handleMouseDragForViewGroup = this.handleMouseDragForViewGroup.bind(this);

        this.handleMouseDragForRectangle = this.handleMouseDragForRectangle.bind(this);

        this.handleMouseDragForCornerHandleA = this.handleMouseDragForCornerHandleA.bind(this);
        this.handleMouseDragForCornerHandleB = this.handleMouseDragForCornerHandleB.bind(this);
        this.handleMouseDragForCornerHandleC = this.handleMouseDragForCornerHandleC.bind(this);
        this.handleMouseDragForCornerHandleD = this.handleMouseDragForCornerHandleD.bind(this);

        this.triggerUpdateOnMouseUp = false;
        this.model = model;

        this.viewGroup = new Group();
        this.viewGroup.on('mouseup', this.handleMouseUp);
        this.viewGroup.on('mousedrag', this.handleMouseDragForViewGroup);
        this.viewGroup.on('click', this.handleClick);

        this.parentGroup = parentGroup;
        this.parentGroup.addChild(this.viewGroup);

        const points = this.model.points;

        this.rectanglePath = new Path(Object.assign({}, attributes, { segments: points }));
        this.rectanglePath.on('mousedrag', this.handleMouseDragForRectangle);
        this.viewGroup.addChild(this.rectanglePath);

        this.cornerHandleA = new Path.Circle(Object.assign({}, handleAttributes, { center: points[0] }));
        this.cornerHandleA.on('mousedrag', this.handleMouseDragForCornerHandleA);
        this.viewGroup.addChild(this.cornerHandleA);

        this.cornerHandleB = new Path.Circle(Object.assign({}, handleAttributes, { center: points[1] }));
        this.cornerHandleB.on('mousedrag', this.handleMouseDragForCornerHandleB);
        this.viewGroup.addChild(this.cornerHandleB);

        this.cornerHandleC = new Path.Circle(Object.assign({}, handleAttributes, { center: points[2] }));
        this.cornerHandleC.on('mousedrag', this.handleMouseDragForCornerHandleC);
        this.viewGroup.addChild(this.cornerHandleC);

        this.cornerHandleD = new Path.Circle(Object.assign({}, handleAttributes, { center: points[3] }));
        this.cornerHandleD.on('mousedrag', this.handleMouseDragForCornerHandleD);
        this.viewGroup.addChild(this.cornerHandleD);

        this.model.on('change', this.handleChange);
    }

    handleChange(points) {
        this.rectanglePath.removeSegments();
        this.rectanglePath.addSegments(points);

        this.cornerHandleA.position = points[0];
        this.cornerHandleB.position = points[1];
        this.cornerHandleC.position = points[2];
        this.cornerHandleD.position = points[3];
    }

    handleClick(e) {
        if ((!e.modifiers.control && !e.modifiers.command) || e.delta.length > 0) {
            return;
        }

        e.stop();

        this.model.destroy();
    }

    handleMouseDragForViewGroup(e) {
        if (!e.modifiers.control && !e.modifiers.command) {
            return;
        }

        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const mousePoint = this.viewGroup.globalToLocal(e.point);
        const origin = this.viewGroup.globalToLocal(new Point(0, 0));
        const delta = this.viewGroup.globalToLocal(e.delta).subtract(origin);

        const center = this.viewGroup.position;
        const currentLocationVector = mousePoint.subtract(center).normalize();
        const previousLocationVector = mousePoint.subtract(delta).subtract(center).normalize();
        const angle = (-1 * (180 / Math.PI) * Math.asin(currentLocationVector.cross(previousLocationVector))) % 360;

        const rotationMatrix = new Matrix();
        rotationMatrix.rotate(angle, center);

        const points = this.model.points.map(point => rotationMatrix.transform(point));

        this.model.setProps({ points });
    }

    handleMouseDragForRectangle(e) {
        if (e.modifiers.control || e.modifiers.command) {
            return;
        }

        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const origin = this.viewGroup.globalToLocal(new Point(0, 0));
        const delta = this.viewGroup.globalToLocal(e.delta).subtract(origin);

        const points = this.model.points.map(point => point.add(delta));

        this.model.setProps({ points });
    }

    /*
    Author: Calvin Feng
    Validation will go into on('update') instead of onDrag
    */

    handleMouseDragForCornerHandleA(e) {
        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const mousePoint = this.viewGroup.globalToLocal(e.point);

        const points = this.model.points.map(point => new Point(point));

        const axisA = points[1].subtract(points[0]).normalize();
        const axisB = points[3].subtract(points[0]).normalize();

        const mousePointA = mousePoint.project(axisA);
        const mousePointB = mousePoint.project(axisB);

        const adjacentPointA = points[2].project(axisA);
        const adjacentPointB = points[2].project(axisB);

        points[0] = mousePointA.add(mousePointB);
        points[2] = adjacentPointA.add(adjacentPointB);

        points[1] = adjacentPointA.add(mousePointB);
        points[3] = adjacentPointB.add(mousePointA);

        const diffA = mousePointA.subtract(points[1].project(axisA));
        const diffB = mousePointB.subtract(points[3].project(axisB));

        if (diffA.length === 0 && diffB.length === 0) {
            return;
        }

        this.model.setProps({ points });
    }

    handleMouseDragForCornerHandleB(e) {
        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const mousePoint = this.viewGroup.globalToLocal(e.point);

        const points = this.model.points.map(point => new Point(point));

        const axisA = points[0].subtract(points[1]).normalize();
        const axisB = points[2].subtract(points[1]).normalize();

        const mousePointA = mousePoint.project(axisA);
        const mousePointB = mousePoint.project(axisB);

        const adjacentPointA = points[3].project(axisA);
        const adjacentPointB = points[3].project(axisB);

        points[1] = mousePointA.add(mousePointB);
        points[3] = adjacentPointA.add(adjacentPointB);

        points[0] = adjacentPointA.add(mousePointB);
        points[2] = adjacentPointB.add(mousePointA);

        const diffA = mousePointA.subtract(points[0].project(axisA));
        const diffB = mousePointB.subtract(points[2].project(axisB));

        if (diffA.length !== 0 && diffB.length !== 0) {
            this.model.setProps({ points });
        }
    }

    handleMouseDragForCornerHandleC(e) {
        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const mousePoint = this.viewGroup.globalToLocal(e.point);

        const points = this.model.points.map(point => new Point(point));

        const axisA = points[3].subtract(points[2]).normalize();
        const axisB = points[1].subtract(points[2]).normalize();

        const mousePointA = mousePoint.project(axisA);
        const mousePointB = mousePoint.project(axisB);

        const adjacentPointA = points[0].project(axisA);
        const adjacentPointB = points[0].project(axisB);

        points[2] = mousePointA.add(mousePointB);
        points[0] = adjacentPointA.add(adjacentPointB);

        points[3] = adjacentPointA.add(mousePointB);
        points[1] = adjacentPointB.add(mousePointA);

        const diffA = mousePointA.subtract(points[3].project(axisA));
        const diffB = mousePointB.subtract(points[1].project(axisB));

        if (diffA.length !== 0 && diffB.length !== 0) {
            this.model.setProps({ points });
        }
    }

    handleMouseDragForCornerHandleD(e) {
        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const mousePoint = this.viewGroup.globalToLocal(e.point);

        const points = this.model.points.map(point => new Point(point));

        const axisA = points[2].subtract(points[3]).normalize();
        const axisB = points[0].subtract(points[3]).normalize();

        const mousePointA = mousePoint.project(axisA);
        const mousePointB = mousePoint.project(axisB);

        const adjacentPointA = points[1].project(axisA);
        const adjacentPointB = points[1].project(axisB);

        points[3] = mousePointA.add(mousePointB);
        points[1] = adjacentPointA.add(adjacentPointB);

        points[2] = adjacentPointA.add(mousePointB);
        points[0] = adjacentPointB.add(mousePointA);

        const diffA = mousePointA.subtract(points[2].project(axisA));
        const diffB = mousePointB.subtract(points[0].project(axisB));

        if (diffA.length !== 0 && diffB.length !== 0) {
            this.model.setProps({ points });
        }
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
