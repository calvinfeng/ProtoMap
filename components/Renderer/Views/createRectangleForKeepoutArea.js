'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Andrii Buts

// Fetch imports
import AreaRectangleView            from './AreaRectangleView';
import { keepoutAreaAttributes }    from '../attributes';

function createRectangleForKeepoutArea(parentGroup, model) {
    return new AreaRectangleView(parentGroup, model, keepoutAreaAttributes);
}

export default createRectangleForKeepoutArea;
