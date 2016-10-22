'use strict';
import AreaRectangleView            from './AreaRectangleView';
import { keepoutAreaAttributes }    from '../attributes';

function createRectangleForKeepoutArea(parentGroup, model) {
  return new AreaRectangleView(parentGroup, model, keepoutAreaAttributes);
}

export default createRectangleForKeepoutArea;
