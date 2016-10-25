'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Andrii Buts

// Fetch imports
import AreaPolygonView              from './AreaPolygonView';
import { keepoutAreaAttributes }    from '../attributes';

function createPolygonForKeepoutArea(parentGroup, model) {
    return new AreaPolygonView(parentGroup, model, keepoutAreaAttributes);
}

export default createPolygonForKeepoutArea;
