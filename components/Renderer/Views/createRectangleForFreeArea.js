'use strict';
import AreaRectangleView         from './AreaRectangleView';
import { freeAreaAttributes }    from '../attributes';

function createRectangleForFreeArea(parentGroup, model) {
  return new AreaRectangleView(parentGroup, model, freeAreaAttributes);
}

export default createRectangleForFreeArea;
