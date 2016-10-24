// Thirdparty
import { PaperScope }   from 'paper';
import { Group }        from 'paper';
import { Raster }       from 'paper';
import { Point }        from 'paper';

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

export default class Renderer extends EventEmitter {

  constructor(canvasElement, onUpdateAnnotationData) {
    super({ maxListeners: 0 });
    this.handleTranslateAndRotateView = this.handleTranslateAndRotateView.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
    this.handleAddNode = this.handleAddNode.bind(this);
    this.handleRemoveNode = this.handleRemoveNode.bind(this);
    this.handleAddEdge = this.handleAddEdge.bind(this);
    this.handleRemoveEdge = this.handleRemoveEdge.bind(this);
    this.handleUpdateAnnotationData = this.handleUpdateAnnotationData.bind(this);

    this.onUpdateAnnotationData = onUpdateAnnotationData;
    this.canvasElement = canvasElement;
    this.zoomFactor = 1.05;
    this.visualizationRaster = null;
    this.annotationData = null;

    // initialize views containers
    this.freeAreaViews = Object.create(null);
    this.keepoutAreaViews = Object.create(null);
    this.nodeViews = Object.create(null);
    this.edgeViews = Object.create(null);

    // initialize paper scope
    this.scope = new PaperScope();
    this.scope.settings.applyMatrix = false;
    this.scope.settings.insertItems = false;
    this.scope.setup(this.canvasElement);

    // setup group structure
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

    // free area collections
    this.freeAreaCollection = new Collection(AreaModel);
    this.handleAddFreeArea = this.getAddAreaHandler(
      createRectangleForFreeArea,
      createPolygonForFreeArea,
      this.freeAreaGroup,
      this.freeAreaViews,
      this.freeAreaCollection
    );
    this.freeAreaCollection.on('add', this.handleAddFreeArea);
    this.handleRemoveFreeArea = this.getRemoveAreaHandler(
      this.freeAreaViews
    );
    this.freeAreaCollection.on('remove', this.handleRemoveFreeArea);

    // keepout area collections
    this.keepoutAreaCollection = new Collection(AreaModel);
    this.handleAddKeepoutArea = this.getAddAreaHandler(
      createRectangleForFreeArea,
      createPolygonForKeepoutArea,
      this.keepoutAreaGroup,
      this.keepoutAreaViews,
      this.keepoutAreaCollection
    );
    this.keepoutAreaCollection.on('add', this.handleAddKeepoutArea);
    this.handleRemoveKeepoutArea = this.getRemoveAreaHandler(
      this.keepoutAreaViews
    );
    this.keepoutAreaCollection.on('remove', this.handleRemoveKeepoutArea);

    // node collections
    this.nodeCollection = new Collection(NodeModel);
    this.nodeCollection.on('add', this.handleAddNode);
    this.nodeCollection.on('remove', this.handleRemoveNode);

    // edge collections
    this.edgeCollection = new Collection(EdgeModel);
    this.edgeCollection.on('add', this.handleAddEdge);
    this.edgeCollection.on('remove', this.handleRemoveEdge);

    // initialize tools
    // free areas
    this.handleCreateFreeArea = this.getCreateAreaHandler(this.freeAreaCollection);
    this.freeAreaRectangleTool = new CreateAreaRectangleTool(this, createRectangleForFreeArea, 'FREE_ZONE');
    this.freeAreaRectangleTool.on('create', this.handleCreateFreeArea);
    this.freeAreaPolygonTool = new CreateAreaPolygonTool(this, createPolygonForFreeArea, freeAreaGuideAttributes, 'FREE_ZONE');
    this.freeAreaPolygonTool.on('create', this.handleCreateFreeArea);

    // keepout area
    this.handleCreateKeepoutArea = this.getCreateAreaHandler(this.keepoutAreaCollection);
    this.keepoutAreaRectangleTool = new CreateAreaRectangleTool(this, createRectangleForKeepoutArea, 'KEEPOUT_ZONE');
    this.keepoutAreaRectangleTool.on('create', this.handleCreateKeepoutArea);
    this.keepoutAreaPolygonTool = new CreateAreaPolygonTool(this, createPolygonForKeepoutArea, keepoutAreaGuideAttributes, 'KEEPOUT_ZONE');
    this.keepoutAreaPolygonTool.on('create', this.handleCreateKeepoutArea);

    this.canvasElement.addEventListener('wheel', this.handleZoom);
    this.enableViewControlsTool();
  }

  disableActiveTool() {
    this.project.view.off('mousedown');
    this.project.view.off('mousemove');
    this.project.view.off('mouseup');
    this.project.view.off('click');
    this.project.view.off('mousedrag');
  }

  enableViewControlsTool() {
    this.disableActiveTool();
    this.project.view.on('mousedrag', this.handleTranslateAndRotateView);
  }

  enableCreateFreeAreaRectangleTool() {
    this.disableActiveTool();
    this.freeAreaRectangleTool.enableViewEventHandlers();
  }

  enableCreateFreeAreaPolygonTool() {
    this.disableActiveTool();
    this.freeAreaPolygonTool.enableViewEventHandlers();
  }

  enableCreateKeepoutAreaRectangleTool() {
    this.disableActiveTool();
    this.keepoutAreaRectangleTool.enableViewEventHandlers();
  }

  enableCreateKeepoutAreaPolygonTool() {
    this.disableActiveTool();
    this.keepoutAreaPolygonTool.enableViewEventHandlers();
  }

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

  setViewSize(width, height) {
    this.project.view.viewSize.width = width;
    this.project.view.viewSize.height = height;
  }

  destroy() {
    window.removeEventListener('resize', this.handleWindowResize);
    this.freeAreaCollection.removeAllListeners();
    this.keepoutAreaCollection.removeAllListeners();
    this.canvasElement.removeEventListener('wheel', this.handleZoom);
    this.scope.project.remove();
  }

  zoomToFit(rectangle) {
    const view = this.project.view;
    view.center = rectangle.center;
    view.zoom = Math.min(
      view.viewSize.height / rectangle.height,
      view.viewSize.width / rectangle.width
    );
  }

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

  getAddAreaHandler(RectangleViewFactory, PolygonViewFactor, areaViewsGroup, areaViews, collection) {
    return (model) => {
      if (model.shape === 'RECTANGLE') {
        view = RectangleViewFactory(areaViewsGroup, model);
      } else if (model.shape === 'POLYGON') {
        view = PolygonViewFactory(areaViewsGroup, model);
      }
      areaViews[model.id] = view;
      view.on('update', this.handleUpdateAnnotationData);
      model.on('destroy', ({id}) => {
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
    nodeView.on('update', this.handleUpdateAnnotationData);
    nodeModel.on('destroy', ({id}) => {
      this.edgeCollection.forEach((edgeModel) => {
        if (edgeModel.sourceId === id || edgeModel.targetId === id) {
          this.edgeCollection.removeModel(edgeModel.id);
        }
      });
      this.nodeCollection.removeModel(id);
      this.handleUpdateAnnotationData();
    });
  }

  handleRemoveNode(nodeModel) {
    const nodeView = this.nodeViews[nodeModel.id];
    nodeView.remove();
    delete this.nodeViews[nodeModel.id];
  }

  handleAddEdge(edgeModel) {
    const sourceNodeModel = this.nodeCollection.getModel(edgeModel.sourceId);
    const targetNodeModel = this.nodeCollection.getModel(edgeModel.targetId);
    edgeModel.on('destroy', ({id}) => {
      this.edgeCollection.removeModel(id);
      this.handleUpdateAnnotationData();
    });
    const edgeView = new EdgeView(this.edgeGroup, edgeModel, sourceNodeModel, targetNodeModel);
    this.edgeView.on('update', this.handleUpdateAnnotationData);

    let splitNode;

    edgeView.viewGroup.on('mousedown', e => {
      if (e.modifiers.shift || e.modifiers.control || e.modifiers.command) {
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

  handleZoom(e) {
    e.preventDefault();
    const mousePoint = this.project.view.getEventPoint(e);
    this.changeZoom(e.deltaY, mousePoint);
  }

  handleTranslateAndRotateView(e) {
    if (e.modifiers.control || e.modifiers.command) {
      this.rotatePointAboutCenter(e.point, e.delta);
    } else {
      this.mainGroup.translate(e.delta);
    }
  }
}
