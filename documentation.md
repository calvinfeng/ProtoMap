# Models

# Views
## NodeView
### Instance methods
* `constructor(parentGroup, model)`
  * Take in an instance of node model and its data
  * Create a viewGroup for itself, which includes a `circlePath`, also add its viewGroup to the parentGroup
* `handleChange(point)`
  * Whenever model has changed, this function will translate the node to the correct location
* `handleClick(e)`
  * When clt is pressed, it should delete the node by deleting its model and emit update
  * __Qestion__: What is listening for update?
  * __Answer__: I think Renderer.js is the primary listener
* `handleMouseDragForViewGroup(e)`
  * When viewGroup has been dragged, it will fire a change to `nodeModel` and then `handleChange` will happen
* `handleMouseUp()`
  * Emit `update`
  * Send information to `handleUpdateAnnotationData` in `Renderer` and then it gets delivered to the server
* `remove()`
  * Turn off `onChange` listener to model
  * remove the `viewGroup`
  * get rid of all listeners

## EdgeView
### Instance methods
* `constructor(parentGroup, edgeModel, sourceNodeModel, targetNodeModel)`
  * It needs three pieces of information, the edge information, source and target information
  * `viewGroup` contains `inflationPath`, `arrowPath`, and `linePath`
  * Give `handleChange` to `sourceNodeModel` and `targetNodeModel` because there is no drag handler on
  edge itself
* `handleChange()`
  * Grab the points from `sourceNodeModel` and `targetNodeModel` then do the math
  * Make some new path some new segments and etc...
* `handleClick(e)`
  * Click to destroy the `edgeModel` which then will get this view removed
* `handleMouseDrag(e)`
  * Dragging the edge will lead to the modification of the `sourceNodeModel` and `targetNodeModel`
* `handleMouseUp()`
  * Emit 'update'
  * Send information to `handleUpdateAnnotationData` in `Renderer` and then it gets delivered to the server
* `handleMouseEnter()`
  * It should add a temporary node
* `handleMouseLeave()`
  * It should destroy the temporary node
* `handleMouseMove()`
  * If there is a temporary node, it should move along as the cursor moves
  * Else if there is a temporary node and it is a drag action then get rid of the temporary node and do nothing
  * Else do nothing
* `remove()`
  * Turn off `change` listener for `sourceNodeModel` and `targetNodeModel`
  * Remove the `viewGroup` from paper
  * Get rid of all listeners

## AreaPolygonView
### Instance methods
__Question__: What are split handle and corner handle?
* `constructor(parentGroup, model, attributes)`
* `addCornerHandles(points)`
* `replaceCornerHandles(points)`
* `addSplitHandles(points)`
* `replaceSplitHandles(points)`
* `setActiveCornerHandle(handle, pointIndex)`
  * It will only set one corner to be active
* `handleChange(points)`
  * Remove all existing segments, re-add them with `points`
  * Call `replaceCornerHandles` and `replaceSplitHandles`
* `handleClick(e)`
  * Destroy the model if it was pressed with control or command
* `handleMouseDragForPolygon(e)`
  * This will move the whole entire area as a group
* `handleMouseDragForCornerHandle(e)`
  * Activate a corner and set it as `this.activeCornerHandle`
* `handleMouseDragForActiveCornerHandle(e)`
* `handleMouseUpForActiveCornerHandle()`
* `handleClickForCornerHandle(e)`
  * Delete a corner and update the model if shift was pressed
* `handleMouseDownForSplitHandle(e)`
  * __NOT SURE__
* `handleMouseUp()`
* `remove()`
  * Get rid of the viewGroup

## AreaRectangleView
### Instance methods

# Collections
It takes in a model class and construct a set of models of that class from raw data
from the back end
## Instance methods
* `constructor(modelClass)`
  * For example: `AreaModel`, `NodeModel`, `EdgeModel` etc...
* `setModelsFromData(modelsData)`
* `getModel(id)`
* `hasModel(id)`
* `addModel(model)`
* `removeModel(id)`
* `forEach(cb)`
* `toJSON()`
