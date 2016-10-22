"use strict";

import AreaPolygonView from './AreaPolygonView';
import { freeAreaAttributes } from '../attributes';

 function createPolygonForFreeArea(parentGroup, model) {
   return new AreaPolygonView(parentGroup, model, freeAreaAttributes);
 }

 export default createPolygonForFreeArea;
