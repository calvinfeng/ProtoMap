'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Andrii Buts

// Fetch imports
import AreaRectangleView         from './AreaRectangleView';
import { freeAreaAttributes }    from '../attributes';

function createRectangleForFreeArea(parentGroup, model) {
    return new AreaRectangleView(parentGroup, model, freeAreaAttributes);
}

export default createRectangleForFreeArea;
