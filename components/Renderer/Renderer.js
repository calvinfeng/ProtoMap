'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Nadir Muzaffar

// Thirdparty
import { PaperScope }   from 'paper';
import { Group }        from 'paper';
import { Raster }       from 'paper';
import { Point }        from 'paper';
import { HitResult }    from 'paper';
import uuid             from 'node-uuid';
import EventEmitter     from 'eventemitter2';

// Fetch
import Collection                        from './Collections';

import AreaModel                         from './Models/AreaModel';
import NodeModel                         from './Models/NodeModel';
import EdgeModel                         from './Models/EdgeModel';

import createRectangleForFreeArea        from './Views/createRectangleForFreeArea';
import createPolygonForFreeArea          from './Views/createPolygonForFreeArea';
import createRectangleForKeepoutArea     from './Views/createRectangleForKeepoutArea';
import createPolygonForKeepoutArea       from './Views/createPolygonForKeepoutArea';
import NodeView                          from './Views/NodeView';
import EdgeView                          from './Views/EdgeView';

import CreateLanesTool                   from './Tools/CreateLanesTool';
import CreateAreaRectangleTool           from './Tools/CreateAreaRectangleTool';
import CreateAreaPolygonTool             from './Tools/CreateAreaPolygonTool';

import { freeAreaGuideAttributes }       from './attributes';
import { keepoutAreaGuideAttributes }    from './attributes';

/**
 * Renderer controls everything drawn to the canvas for the Map annotator. Each renderer creates a new Paper.PaperScope
 * and associates itself with a single Paper.Project which is associated with a single Paper.View.
 */
export default class Renderer extends EventEmitter {
    /**
     * Binds itself to the provided canvasElement.
     *
     * @param {HTMLCanvasElement} canvasElement
     * @param {Function} onUpdateAnnotationData
     */
    constructor(canvasElement, onUpdateAnnotationData) {
        super({ maxListeners: 0 });

        // bind methods to instance
        this.handleTranslateAndRotateView = this.handleTranslateAndRotateView.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this)
        this.handleAddNode = this.handleAddNode.bind(this);
        this.handleRemoveNode = this.handleRemoveNode.bind(this);
        this.handleAddEdge = this.handleAddEdge.bind(this);
        this.handleRemoveEdge = this.handleRemoveEdge.bind(this);
        this.handleUpdateAnnotationData = this.handleUpdateAnnotationData.bind(this);

        this.onUpdateAnnotationData = onUpdateAnnotationData;
        this.canvasElement = canvasElement;
        this.zoomFactor = 1.05;
        this.visualizationRaster = null;
        this.annotationData = null; // this will go away as soon as all collections are implemented

        // initialize views containers
        // =====================================================================
        this.freeAreaViews = Object.create(null);
        this.keepoutAreaViews = Object.create(null);
        this.nodeViews = Object.create(null);
        this.edgeViews = Object.create(null);

        // initialize paper scope
        this.scope = new PaperScope();
        this.scope.settings.applyMatrix = false;
        this.scope.settings.insertItems = false;
        this.scope.setup(this.canvasElement);

        this.project = this.scope.project;
        this.project.activate();

        // setup group structure
        // =====================================================================
        this.mainGroup = new Group();
        this.project.activeLayer.addChild(this.mainGroup);

        this.imageGroup = new Group();
        this.mainGroup.addChild(this.imageGroup);

        this.realWorldCoordinatesGroup = new Group();
        this.mainGroup.addChild(this.realWorldCoordinatesGroup);
        this.realWorldCoordinatesGroup.scale(1, -1);
        this.realWorldCoordinatesGroup.scale(1 / 0.05, 1 / 0.05);

        this.freeAreaGroup = new Group();
        this.realWorldCoordinatesGroup.addChild(this.freeAreaGroup);

        this.keepoutAreaGroup = new Group();
        this.realWorldCoordinatesGroup.addChild(this.keepoutAreaGroup);

        this.lanesGroup = new Group();
        this.realWorldCoordinatesGroup.addChild(this.lanesGroup);

        this.edgeGroup = new Group();
        this.lanesGroup.addChild(this.edgeGroup);

        this.nodeGroup = new Group();
        this.lanesGroup.addChild(this.nodeGroup);

        // initialize models containers such as collections
        // =====================================================================
        // ---------------------------------------------------------------------
        this.freeAreaCollection = new Collection(AreaModel);
        // Create a handler that will handle update and submit new changes to server
        this.handleAddFreeArea = this.getAddAreaHandler(
            createRectangleForFreeArea,
            createPolygonForFreeArea,
            this.freeAreaGroup,
            this.freeAreaViews,
            this.freeAreaCollection
        );
        this.freeAreaCollection.on('add', this.handleAddFreeArea);

        this.handleRemoveFreeArea = this.getRemoveAreaHandler(this.freeAreaViews);
        this.freeAreaCollection.on('remove', this.handleRemoveFreeArea);

        // ---------------------------------------------------------------------
        this.keepoutAreaCollection = new Collection(AreaModel);
        // Create a handler that will handle update and submit new changes to server
        this.handleAddKeepoutArea = this.getAddAreaHandler(
            createRectangleForKeepoutArea,
            createPolygonForKeepoutArea,
            this.keepoutAreaGroup,
            this.keepoutAreaViews,
            this.keepoutAreaCollection
        );
        this.keepoutAreaCollection.on('add', this.handleAddKeepoutArea);

        this.handleRemoveKeepoutArea = this.getRemoveAreaHandler(this.keepoutAreaViews);
        this.keepoutAreaCollection.on('remove', this.handleRemoveKeepoutArea);

        // ---------------------------------------------------------------------
        this.nodeCollection = new Collection(NodeModel);
        this.nodeCollection.on('add', this.handleAddNode);
        this.nodeCollection.on('remove', this.handleRemoveNode);
        // ---------------------------------------------------------------------
        this.edgeCollection = new Collection(EdgeModel);
        this.edgeCollection.on('add', this.handleAddEdge);
        this.edgeCollection.on('remove', this.handleRemoveEdge);

        // initialize tools
        // =====================================================================
        this.handleCreateFreeArea = this.getCreateAreaHandler(this.freeAreaCollection);

        this.freeAreaRectangleTool = new CreateAreaRectangleTool(this, createRectangleForFreeArea, 'FREE_ZONE');
        this.freeAreaRectangleTool.on('create', this.handleCreateFreeArea);

        this.freeAreaPolygonTool = new CreateAreaPolygonTool(
            this,
            createPolygonForFreeArea,
            freeAreaGuideAttributes,
            'FREE_ZONE'
        );
        this.freeAreaPolygonTool.on('create', this.handleCreateFreeArea);

        this.handleCreateKeepoutArea = this.getCreateAreaHandler(this.keepoutAreaCollection);

        this.keepoutAreaRectangleTool = new CreateAreaRectangleTool(
            this,
            createRectangleForKeepoutArea,
            'KEEPOUT_ZONE'
        );
        this.keepoutAreaRectangleTool.on('create', this.handleCreateKeepoutArea);

        this.keepoutAreaPolygonTool = new CreateAreaPolygonTool(
            this,
            createPolygonForKeepoutArea,
            keepoutAreaGuideAttributes,
            'KEEPOUT_ZONE'
        );
        this.keepoutAreaPolygonTool.on('create', this.handleCreateKeepoutArea);


        this.lanesTool = new CreateLanesTool(this);

        // bind to DOM element events
        this.canvasElement.addEventListener('wheel', this.handleZoom);
        this.canvasElement.addEventListener('contextmenu', e => e.preventDefault());

        // enable view tool
        this.enableViewControlsTool();
    }

    /**
     * Removes event handler for the currently active tool.
     */
    disableActiveTool() {
        this.project.view.off('mousedown');
        this.project.view.off('mousemove');
        this.project.view.off('mouseup');
        this.project.view.off('click');
        this.project.view.off('mousedrag');
    }

    /**
     * Enable view controls tool for panning and rotating the view.
     *
     * Disable's the previously active tool.
     */
    enableViewControlsTool() {
        this.disableActiveTool();
        this.project.view.on('mousedrag', this.handleTranslateAndRotateView);
    }

    /**
     * Enables tool for creating Free Area Rectangles.
     * This tool remains active until another tool is enabled or the active tool is disabled.
     *
     * Disable's the previously active tool.
     */
    enableCreateFreeAreaRectangleTool() {
        this.disableActiveTool();
        this.freeAreaRectangleTool.enableViewEventHandlers();
    }

    /**
     * Enables tool for creating Free Area Polygons.
     * This tool remains active until another tool is enabled or the active tool is disabled.
     *
     * Disable's the previously active tool.
     */
    enableCreateFreeAreaPolygonTool() {
        this.disableActiveTool();
        this.freeAreaPolygonTool.enableViewEventHandlers();
    }

    /**
     * Enables tool for creating Keep Out Area Rectangles.
     * This tool remains active until another tool is enabled or the active tool is disabled.
     *
     * Disable's the previously active tool.
     */
    enableCreateKeepoutAreaRectangleTool() {
        this.disableActiveTool();
        this.keepoutAreaRectangleTool.enableViewEventHandlers();
    }

    /**
     * Enables tool for creating Keep Out Area Polygons.
     * This tool remains active until another tool is enabled or the active tool is disabled.
     *
     * Disable's the previously active tool.
     */
    enableCreateKeepoutAreaPolygonTool() {
        this.disableActiveTool();
        this.keepoutAreaPolygonTool.enableViewEventHandlers();
    }

    /**
     * Enables tool for creating and editing Lanes. This tool remains active until another tool is enabled or the
     * active tool is disabled.
     *
     * Disable's the previously active tool.
     */
    enableLanesTool() {
        this.disableActiveTool();
        this.lanesTool.enableViewEventHandlers();
    }

    /**
     * Creates a new Raster to render the provided imageElement. If one already existed, it removes
     * it before creating a new one.
     *
     * @param {HTMLImageElement} imageElement
     */
    setVisualizationMapImage(imageElement) {
        if (this.visualizationRaster) {
            this.visualizationRaster.remove();
        }

        this.visualizationRaster = new Raster(imageElement);
        this.imageGroup.addChild(this.visualizationRaster);
        const centerPosition = new Point(imageElement.naturalWidth / 2, -imageElement.naturalHeight / 2);
        this.imageGroup.position = this.mainGroup.globalToLocal(centerPosition);

        this.visualizationRaster.onLoad = () => this.zoomToFit(this.mainGroup.bounds);
    }

    /**
     * Takes a hash map with arrays of annotation types and updates the view with the new data.
     *
     * @param {Object} annotationData
     */
    setAnnotationData(annotationData) {
        if (!annotationData) {
            return;
        }

        this.annotationData = annotationData;

        this.freeAreaCollection.setModelsFromData(annotationData.free_zones);
        this.keepoutAreaCollection.setModelsFromData(annotationData.keepout_zones);
        this.nodeCollection.setModelsFromData(annotationData.nodes);
        this.edgeCollection.setModelsFromData(annotationData.edges);
    }

    /**
     * Sets the viewSize of the underlying {Paper.View} to the specified width and height.
     * @param {Number} width
     * @param {Number} height
     */
    setViewSize(width, height) {
        this.project.view.viewSize.width = width;
        this.project.view.viewSize.height = height;
    }

    /**
     * Unbinds itself from the canvasElement passed in as parameters to the constructor.
     * It also removes any event listeners to the window object used to resize the canvas element.
     *
     * This method must be called on each instance of this class to properly free its resources.
     */
    destroy() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.freeAreaCollection.removeAllListeners();
        this.keepoutAreaCollection.removeAllListeners();
        this.canvasElement.removeEventListener('wheel', this.handleZoom);
        this.scope.project.remove();
    }

    /**
     * Centers and scales the view to fit the specified Rectangle.
     *
     * @param {Paper.Rectangle} rectangle
     */
    zoomToFit(rectangle) {
        const view = this.project.view;
        view.center = rectangle.center;
        view.zoom = Math.min(
            view.viewSize.height / rectangle.height,
            view.viewSize.width / rectangle.width
        );
    }

    /**
     * Adjusts zoom while keeping the specified point fixed. Either zooms in out depending on whether delta is positive
     * or negative.
     *
     * @param {Number} delta
     * @param {Paper.Point} point
     */
    changeZoom(delta, point) {
        const view = this.project.view;
        const newZoom = delta < 0 ? view.zoom * this.zoomFactor : view.zoom / this.zoomFactor;
        const beta = view.zoom / newZoom;
        const pointRelativeToCenter = point.subtract(view.center);
        const offset = point.subtract(pointRelativeToCenter.multiply(beta)).subtract(view.center);

        view.zoom = newZoom;
        view.center = view.center.add(offset);

        view.draw();
    }

    /**
     * Rotates the point around the center by an angle computed using the delta.
     *
     * @param {Paper.Point} point
     * @param {Number} delta
     */
    rotatePointAboutCenter(point, delta) {
        const center = this.project.view.center;
        const currentLocationVector = point.subtract(center).normalize();
        const previousLocationVector = point.subtract(delta).subtract(center).normalize();
        const angle = -1 * Math.asin(currentLocationVector.cross(previousLocationVector));

        this.mainGroup.rotate(angle * 180 / Math.PI, center);
    }

    getCreateAreaHandler(collection) {
        return (model) => {
            collection.addModel(model);
            this.handleUpdateAnnotationData();
        };
    }

    getAddAreaHandler(RectangleViewFactory, PolygonViewFactory, areaViewsGroup, areaViews, collection) {
        return (model) => {
            let view;

            if (model.shape === 'RECTANGLE') {
                view = RectangleViewFactory(areaViewsGroup, model);
            } else if (model.shape === 'POLYGON') {
                view = PolygonViewFactory(areaViewsGroup, model);
            }

            areaViews[model.id] = view;

            view.on('update', this.handleUpdateAnnotationData);

            model.on('destroy', ({ id }) => {
                collection.removeModel(id);

                this.handleUpdateAnnotationData();
            });
        };
    }

    getRemoveAreaHandler(areaViews) {
        return (model) => {
            const view = areaViews[model.id];
            view.remove();

            delete areaViews[model.id];
        };
    }

    handleAddNode(nodeModel) {
        const nodeView = new NodeView(this.nodeGroup, nodeModel);
        this.nodeViews[nodeModel.id] = nodeView;

        nodeModel.on('destroy', ({ id }) => {
            // we have to delete the edges before deleting node, because the server will enforce the constraint
            // that edges can't point to nodes that do not exist
            this.edgeCollection.forEach((edgeModel) => {
                if (edgeModel.sourceId === id || edgeModel.targetId === id) {
                    this.edgeCollection.removeModel(edgeModel.id);
                }
            });

            this.nodeCollection.removeModel(id);

            this.handleUpdateAnnotationData();
        });

        nodeView.on('update', this.handleUpdateAnnotationData);

        nodeView.viewGroup.on('mousedown', (e) => {
            if (!e.modifiers.shift) {
                return;
            }

            e.stop();

            this.startEdgeExtensionFromNode(nodeModel);
        });
    }

    startEdgeExtensionFromNode(sourceNodeModel) {
        this.disableActiveTool();

        let hitResultNodeModel = null;

        const extensionNodeModel = new NodeModel({
            uuid: uuid.v4(),
            point: sourceNodeModel.point
        });

        const extensionEdgeModel = new EdgeModel({
            uuid: uuid.v4(),
            source_uuid: sourceNodeModel.id,
            target_uuid: extensionNodeModel.id
        });

        const extensionNodeView = new NodeView(this.realWorldCoordinatesGroup, extensionNodeModel);

        const extensionEdgeView = new EdgeView(
            this.realWorldCoordinatesGroup,
            extensionEdgeModel,
            sourceNodeModel,
            extensionNodeModel
        );

        const mousemoveHandler = (e) => {
            e.stop();

            const point = this.nodeGroup.globalToLocal(e.point);

            // check to see if we're "snapping"/"joinging" this edge with an existing node
            const hitMatcher = (hit) => this.nodeCollection.hasModel(hit.item.name);
            const hitResult = this.nodeGroup.hitTest(point, { fill: true, match: hitMatcher });

            if (hitResult) {
                hitResultNodeModel = this.nodeCollection.getModel(hitResult.item.name);
                extensionNodeModel.setProps({ point: hitResultNodeModel.point });
            } else {
                hitResultNodeModel = null;
                extensionNodeModel.setProps({ point });
            }
        };

        const clickHandler = (e) => {
            e.stop();

            this.project.view.off('mousemove', mousemoveHandler);
            this.project.view.off('click', clickHandler);

            extensionNodeView.remove();
            extensionEdgeView.remove();

            const isClickEventOnSourceNode =
                hitResultNodeModel &&
                hitResultNodeModel.id === sourceNodeModel.id;

            if (e.event.button === 0 && !isClickEventOnSourceNode) {
                if (hitResultNodeModel) {
                    this.edgeCollection.addModel(new EdgeModel({
                        uuid: uuid.v4(),
                        source_uuid: sourceNodeModel.id,
                        target_uuid: hitResultNodeModel.id
                    }));
                } else {
                    this.nodeCollection.addModel(extensionNodeModel);
                    this.edgeCollection.addModel(extensionEdgeModel);
                }

                this.handleUpdateAnnotationData();

                if (hitResultNodeModel) {
                    this.startEdgeExtensionFromNode(hitResultNodeModel);
                } else {
                    this.startEdgeExtensionFromNode(extensionNodeModel);
                }


            } else {
                this.enableViewControlsTool();
            }
        }

        this.project.view.on('mousemove', mousemoveHandler);
        this.project.view.on('click', clickHandler);
    }

    handleRemoveNode(nodeModel) {
        const nodeView = this.nodeViews[nodeModel.id];
        nodeView.remove();

        delete this.nodeViews[nodeModel.id];
    }

    handleAddEdge(edgeModel) {
        const sourceNodeModel = this.nodeCollection.getModel(edgeModel.sourceId);
        const targetNodeModel = this.nodeCollection.getModel(edgeModel.targetId);

        edgeModel.on('destroy', ({ id }) => {
            this.edgeCollection.removeModel(id);

            this.handleUpdateAnnotationData();
        });

        const edgeView = new EdgeView(this.edgeGroup, edgeModel, sourceNodeModel, targetNodeModel);
        this.edgeViews[edgeModel.id] = edgeView;

        edgeView.on('update', this.handleUpdateAnnotationData);

        let splitNode;

        edgeView.viewGroup.on('mousedown', (e) => {
            if (e.modifiers.control || e.modifiers.command) {
                return;
            }

            const splitAtPoint = this.nodeGroup.globalToLocal(e.point);

            splitNode = new NodeModel({
                uuid: uuid.v4(),
                point: splitAtPoint
            });

            this.nodeCollection.addModel(splitNode);

            const edgeFromSourceNodeToSplitNode = new EdgeModel({
                uuid: uuid.v4(),
                source_uuid: sourceNodeModel.id,
                target_uuid: splitNode.id
            });

            const edgeFromSplitNodeToTargetNode = new EdgeModel({
                uuid: uuid.v4(),
                source_uuid: splitNode.id,
                target_uuid: targetNodeModel.id
            });

            this.edgeCollection.addModel(edgeFromSourceNodeToSplitNode);
            this.edgeCollection.addModel(edgeFromSplitNodeToTargetNode);

            this.edgeCollection.removeModel(edgeModel.id);

            if (e.modifiers.shift) {
                const extendEdgeFromNode = splitNode;
                splitNode = null;
                this.startEdgeExtensionFromNode(extendEdgeFromNode);
            }
        });

        edgeView.viewGroup.on('mousedrag', e => {
            if (!splitNode) {
                return;
            }

            e.stop();

            const point = this.nodeGroup.globalToLocal(e.point);
            splitNode.setProps({ point });
        });

        edgeView.viewGroup.on('mouseup', () => {
            if (splitNode) {
                this.handleUpdateAnnotationData();
            }
        });
    }

    handleRemoveEdge(edgeModel) {
        const edgeView = this.edgeViews[edgeModel.id];
        edgeView.remove();

        delete this.edgeViews[edgeModel.id];
    }

    handleUpdateAnnotationData() {
        const annotationData = Object.assign({}, this.annotationData, {
            free_zones: this.freeAreaCollection.toJSON(),
            keepout_zones: this.keepoutAreaCollection.toJSON(),
            nodes: this.nodeCollection.toJSON(),
            edges: this.edgeCollection.toJSON()
        });

        this.onUpdateAnnotationData(annotationData);
    }

    handleContextMenu(e) {
        e.preventDefault();
    }

    /**
     * Either zooms in or zooms out based on the sign of the mousewheel delta.
     *
     * @param {WheelEvent} e
     */
    handleZoom(e) {
        e.preventDefault();
        const mousePoint = this.project.view.getEventPoint(e);
        this.changeZoom(e.deltaY, mousePoint);
    }

    /**
     * Rotates the view if the 'control' or 'command' modifier is depressed, pans the view otherwise.
     *
     * @param {Paper.MouseEvent} e
     */
    handleTranslateAndRotateView(e) {
        if (e.modifiers.control || e.modifiers.command) {
            this.rotatePointAboutCenter(e.point, e.delta);
        } else {
            this.mainGroup.translate(e.delta);
        }
    }
}
