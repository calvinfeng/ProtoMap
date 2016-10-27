// Thirdparty imports
import React                from 'react';
import { Point }            from 'paper';
import { Path }             from 'paper';
import { Group }            from 'paper';
import { EventEmitter2 }    from 'eventemitter2';

// Fetch imports
import { getMidPoints }        from '../helpers';
import { handleAttributes }    from '../attributes';

export default class AreaPolygonView extends EventEmitter2 {
    constructor(parentGroup, model, attributes, dispatchOpenPopup, popupComponent, contextMenuComponent) {
        super({ maxListeners: 0 });

        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDragForPolygon = this.handleMouseDragForPolygon.bind(this);
        this.handleMouseUpForPolygon = this.handleMouseUpForPolygon.bind(this);

        this.handleMouseDragForCornerHandle = this.handleMouseDragForCornerHandle.bind(this);
        this.handleMouseDragForActiveCornerHandle = this.handleMouseDragForActiveCornerHandle.bind(this);
        this.handleMouseUpForActiveCornerHandle = this.handleMouseUpForActiveCornerHandle.bind(this);
        this.handleClickForCornerHandle = this.handleClickForCornerHandle.bind(this);
        this.handleMouseDownForSplitHandle = this.handleMouseDownForSplitHandle.bind(this);

        this.triggerUpdateOnMouseUp = false;
        this.model = model;

        this.viewGroup = new Group();
        this.viewGroup.on('mouseup', this.handleMouseUp);
        this.viewGroup.on('click', this.handleClick);

        this.parentGroup = parentGroup;
        this.parentGroup.addChild(this.viewGroup);
        this.dispatchOpenPopup = dispatchOpenPopup;
        this.popupComponent = popupComponent;
        this.contextMenuComponent = contextMenuComponent;

        const points = this.model.points;

        this.polygonPath = new Path(Object.assign({}, attributes, { segments: points }));
        this.polygonPath.on('mousedrag', this.handleMouseDragForPolygon);
        this.polygonPath.on('mouseup', this.handleMouseUpForPolygon);
        this.viewGroup.addChild(this.polygonPath);

        this.activeCornerHandle = null;
        this.activeCornerPointIndex = null;

        this.cornerHandlesGroup = new Group();
        this.addCornerHandles(points);

        this.splitHandlesGroup = new Group();
        this.viewGroup.addChild(this.splitHandlesGroup);

        // 'cornerHandlesGroup' should be added to the viewGroup after 'splitHandlesGroup', in this case if there
        // will be several same points in the polygon the 'cornerHandle' always will be on the top
        this.viewGroup.addChild(this.cornerHandlesGroup);

        this.addSplitHandles(points);

        this.model.on('change', this.handleChange);
    }

    get popupContent() {
        return (
            <this.popupComponent name={this.model.id} />
        );
    }

    get contextMenuContent() {
        return (
            <this.contextMenuComponent name={this.model.id} deleteHandler={() => this.model.destroy()} />
        );
    }

    addCornerHandles(points) {
        points.forEach((point) => {
            const cornerHandle = new Path.Circle(Object.assign({}, handleAttributes, {
                center: point
            }));

            cornerHandle.on('click', this.handleClickForCornerHandle);
            cornerHandle.on('mousedrag', this.handleMouseDragForCornerHandle);

            this.cornerHandlesGroup.addChild(cornerHandle);
        });
    }

    replaceCornerHandles(points) {
        this.cornerHandlesGroup.removeChildren();
        this.addCornerHandles(points);
    }

    addSplitHandles(points) {
        getMidPoints(points).forEach((midPoint) => {
            const splitHandle = new Path.Circle(Object.assign({}, handleAttributes, {
                center: midPoint,
                opacity: 0.7
            }));

            splitHandle.on('mousedown', this.handleMouseDownForSplitHandle);

            this.splitHandlesGroup.addChild(splitHandle);
        });
    }

    replaceSplitHandles(points) {
        this.splitHandlesGroup.removeChildren();
        this.addSplitHandles(points);
    }

    setActiveCornerHandle(handle, pointIndex) {
        this.activeCornerHandle = handle;
        this.activeCornerHandle.opacity = 1;
        this.activeCornerPointIndex = pointIndex;

        this.activeCornerHandle.off('click');
        this.activeCornerHandle.off('mousedrag');
        this.activeCornerHandle.off('mousedown');

        this.activeCornerHandle.on('mousedrag', this.handleMouseDragForActiveCornerHandle);
        this.activeCornerHandle.on('mouseup', this.handleMouseUpForActiveCornerHandle);
    }

    handleChange(points) {
        this.polygonPath.removeSegments();
        this.polygonPath.addSegments(points);

        this.replaceCornerHandles(points);
        this.replaceSplitHandles(points);
    }

    handleClick(e) {
        if ((!e.modifiers.control && !e.modifiers.command) || e.delta.length > 0) {
            return;
        }

        e.stop();

        this.model.destroy();
    }

    handleMouseDragForPolygon(e) {
        if (e.modifiers.control || e.modifiers.command || e.event.button !== 0) {
            return;
        }

        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const origin = this.viewGroup.globalToLocal(new Point(0, 0));
        const delta = this.viewGroup.globalToLocal(e.delta).subtract(origin);

        const points = this.model.points.map(point => point.add(delta));

        this.model.setProps({ points });
    }

    handleMouseUpForPolygon(e) {
        if (e.delta.length > 0) {
            return;
        }

        e.stop();

        const annotationType = this.model.annotationType;
        const annotationId = this.model.id;
        const isContextMenu = e.event.button === 2; // is right click

        this.dispatchOpenPopup(annotationType, annotationId, e.point, isContextMenu);
    }

    handleMouseDragForCornerHandle(e) {
        e.stop();

        this.setActiveCornerHandle(e.target, e.target.index);
    }

    handleMouseDragForActiveCornerHandle(e) {
        e.stop();

        this.triggerUpdateOnMouseUp = true;

        const origin = this.viewGroup.globalToLocal(new Point(0, 0));
        const delta = this.viewGroup.globalToLocal(e.delta).subtract(origin);
        const points = this.model.points.map((point, i) => {
            if (i === this.activeCornerPointIndex) {
                return point.add(delta);
            }

            return point;
        });

        this.model.setProps({ points });
    }

    handleMouseUpForActiveCornerHandle() {
        this.activeCornerHandle = null;
        this.activeCornerPointIndex = null;
    }


    handleClickForCornerHandle(e) {
        if (!e.modifiers.shift || this.model.points.length <= 3) {
            return;
        }

        const handleIndex = e.target.index;

        const points = [
            ...this.model.points.slice(0, handleIndex),
            ...this.model.points.slice(handleIndex + 1)
        ];

        this.model.setProps({ points });
        this.emit('update');
    }

    handleMouseDownForSplitHandle(e) {
        this.triggerUpdateOnMouseUp = true;

        // Get 'newPointIndex' based on current 'SplitHandle' index in the 'splitHandlesGroup'
        const newPointIndex = e.target.index + 1;

        const handle = e.target;

        const newPointX = handle.position.x;
        const newPointY = handle.position.y;

        const points = [
            ...this.model.points.slice(0, newPointIndex),
            new Point(newPointX, newPointY),
            ...this.model.points.slice(newPointIndex)
        ];

        this.setActiveCornerHandle(handle, newPointIndex);

        this.model.setProps({ points });
    }

    handleMouseUp() {
        if (this.triggerUpdateOnMouseUp) {
            this.emit('update');
        }

        this.triggerUpdateOnMouseUp = false;
    }

    remove() {
        this.viewGroup.remove();
    }
}
