'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Nadir Muzaffar

// Thirdparty imports
import { Point }            from 'paper';
import { Path }             from 'paper';
import { Group }            from 'paper';
import { EventEmitter2 }    from 'eventemitter2';

const edgeAttributes = {
    strokeColor: '#287DA5',
    strokeWidth: 0.1
};

const edgeSplitNodeAttributes = {
    radius: 0.25,
    fillColor: '#287DA5',
    opacity: 0.6
};

const inflationEdgeAttributes = {
    fillColor: '#287DA5',
    opacity: 0.4,
};

function calculateMidPoint(p1, p2) { // get rid of this after helpers.getMidPoint is merged in
    return new Point(
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2
    );
}

function isHotKeyActiveForEdgeDrag(e) {
    return (e.modifiers.command || e.modifiers.control) && e.modifiers.shift;
}

export default class EdgeView extends EventEmitter2 {
    constructor(parentGroup, edgeModel, sourceNodeModel, targetNodeModel) {
        super({ maxListeners: 0 });

        this.handleChange = this.handleChange.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseDrag = this.handleMouseDrag.bind(this);
        this.handleClick = this.handleClick.bind(this);

        this.triggerUpdateOnMouseUp = false;
        this.edgeModel = edgeModel;
        this.sourceNodeModel = sourceNodeModel;
        this.targetNodeModel = targetNodeModel;
        this.edgeLength = 0.01;

        this.viewGroup = new Group();
        this.viewGroup.on('mouseup', this.handleMouseUp);
        this.viewGroup.on('mousedrag', this.handleMouseDrag);
        this.viewGroup.on('mouseenter', this.handleMouseEnter);
        this.viewGroup.on('mouseleave', this.handleMouseLeave);
        this.viewGroup.on('mousemove', this.handleMouseMove);
        this.viewGroup.on('click', this.handleClick);

        this.parentGroup = parentGroup;
        this.parentGroup.addChild(this.viewGroup);

        this.linePath = new Path.Line(Object.assign({}, edgeAttributes));
        this.arrowPath = new Path(Object.assign({}, edgeAttributes));

        this.inflationPath = new Path.Rectangle(Object.assign({}, inflationEdgeAttributes, {
            from: [0, 0],
            to: [this.edgeLength, 0.5],
        }));

        this.viewGroup.addChild(this.inflationPath);
        this.viewGroup.addChild(this.arrowPath);
        this.viewGroup.addChild(this.linePath);

        this.handleChange();

        this.sourceNodeModel.on('change', this.handleChange);
        this.targetNodeModel.on('change', this.handleChange);
    }

    handleChange() {
        const sourceNodePoint = this.sourceNodeModel.point;
        const targetNodePoint = this.targetNodeModel.point;
        const linePathVector = targetNodePoint.subtract(sourceNodePoint).normalize(0.3);
        const arrowHeadPoint = targetNodePoint.subtract(linePathVector.normalize(0.27));
        const edgeLength = targetNodePoint.subtract(sourceNodePoint).length;
        const inflationPathPosition = calculateMidPoint(sourceNodePoint, targetNodePoint);

        this.inflationPath.position = inflationPathPosition;
        this.inflationPath.rotation = 0;

        if (edgeLength > 0) {
            this.inflationPath.scale(new Point(edgeLength / this.edgeLength, 1));
            this.edgeLength = edgeLength;
            this.inflationPath.rotation = linePathVector.angle;
        }

        this.linePath.removeSegments();
        this.linePath.addSegments([
            this.sourceNodeModel.point,
            targetNodePoint.subtract(linePathVector.normalize(0.3))
        ]);

        this.arrowPath.removeSegments();
        this.arrowPath.addSegments([
            arrowHeadPoint.add(linePathVector.rotate(135)),
            arrowHeadPoint,
            arrowHeadPoint.add(linePathVector.rotate(-135))
        ]);
    }

    handleClick(e) {
        if ((!e.modifiers.control && !e.modifiers.command) || e.delta.length > 0) {
            return;
        }

        e.stop();

        this.edgeModel.destroy();
    }

    handleMouseDrag(e) {
        if (!isHotKeyActiveForEdgeDrag(e)) {
            return;
        }

        e.stop();

        this.handleMouseLeave();

        this.triggerUpdateOnMouseUp = true;

        const origin = this.viewGroup.globalToLocal(new Point(0, 0));
        const delta = this.viewGroup.globalToLocal(e.delta).subtract(origin);

        const sourcePoint = this.sourceNodeModel.point.add(delta);
        const targetPoint = this.targetNodeModel.point.add(delta);

        this.sourceNodeModel.setProps({ point: sourcePoint });
        this.targetNodeModel.setProps({ point: targetPoint });
    }

    handleMouseUp() {
        if (this.triggerUpdateOnMouseUp) {
            this.emit('update');
        }

        this.triggerUpdateOnMouseUp = false;
    }

    handleMouseEnter(e) {
        if (isHotKeyActiveForEdgeDrag(e) || e.event.buttons > 0) {
            return;
        }

        const mousePoint = this.viewGroup.globalToLocal(e.point);
        this.nearestPointOnPath = this.linePath.getNearestPoint(mousePoint);

        this.edgeSplitNode = Path.Circle(Object.assign(edgeSplitNodeAttributes, {
            center: this.nearestPointOnPath
        }));

        this.viewGroup.addChild(this.edgeSplitNode);
        this.edgeSplitNode.sendToBack();
    }

    handleMouseMove(e) {
        if (!this.edgeSplitNode) {
            return;
        } else if (isHotKeyActiveForEdgeDrag(e)) {
            this.handleMouseLeave();
            return;
        }

        const mousePoint = this.viewGroup.globalToLocal(e.point);
        const nearestPointOnPath = this.linePath.getNearestPoint(mousePoint);
        const delta = nearestPointOnPath.subtract(this.nearestPointOnPath);
        this.nearestPointOnPath = nearestPointOnPath;

        this.edgeSplitNode.translate(delta);
    }

    handleMouseLeave() {
        if (!this.edgeSplitNode) {
            return;
        }

        this.edgeSplitNode.remove();

        this.nearestPointOnPath = null;
        this.edgeSplitNode = null;
    }

    remove() {
        this.sourceNodeModel.off('change', this.handleChange);
        this.targetNodeModel.off('change', this.handleChange);

        this.viewGroup.remove();

        this.removeAllListeners();
    }
}
