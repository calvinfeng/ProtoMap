"use strict";
import { Point }    from 'paper';
import { Color }    from 'paper';

export const handleAttributes = {
    radius: 0.18,
    fillColor: '#ddd',
    shadowColor: '#333',
    shadowBlur: 0.01,
    shadowOffset: new Point(0.001, -0.001)
};

export const areaAttributes = {
    closed: true,
    strokeWidth: 0.18,
    strokeJoin: 'round'
};

export const freeAreaAttributes = Object.assign({}, areaAttributes, {
    fillColor: new Color(0, 0.5, 0, 0.7),
    strokeColor: new Color(0, 0.5, 0)
});

export const keepoutAreaAttributes = Object.assign({}, areaAttributes, {
    fillColor: new Color(1, 0.32, 0.24, 0.7),
    strokeColor: new Color(1, 0.32, 0.24)
});

export const guideAttributes = {
    strokeWidth: 0.05,
    dashArray: [0.8, 0.4]
};

export const freeAreaGuideAttributes = Object.assign({}, guideAttributes, {
    strokeColor: new Color(0, 0.5, 0)
});

export const keepoutAreaGuideAttributes = Object.assign({}, guideAttributes, {
    strokeColor: new Color(1, 0.32, 0.24)
});
