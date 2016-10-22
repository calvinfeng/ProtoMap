'use strict';
import AreaPolygonView              from './AreaPolygonView';
import { keepoutAreaAttributes }    from '../attributes';

function createPolygonForKeepoutArea(parentGroup, model) {
  return new AreaPolygonView(parentGroup, model, keepoutAreaAttributes);
}

export default createPolygonForKeepoutArea;
