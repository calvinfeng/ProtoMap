'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Andrii Buts

// Fetch imports
import AreaPolygonView           from './AreaPolygonView';
import { freeAreaAttributes }    from '../attributes';

function createPolygonForFreeArea(parentGroup, model) {
    return new AreaPolygonView(parentGroup, model, freeAreaAttributes);
}

export default createPolygonForFreeArea;
