'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Authors: Andrii Buts

// Thirdparty imports
import { Point }    from 'paper';

export function getMidPoint(pointA, pointB) {
    return new Point(
        (pointA.x + pointB.x) / 2,
        (pointA.y + pointB.y) / 2
    );
}

export function getMidPoints(points) {
    return points.reduce((midPoints, currentPoint, i, pointsArray) => {
        const nextPoint = pointsArray[(i + 1) % pointsArray.length];

        midPoints.push(getMidPoint(currentPoint, nextPoint));

        return midPoints;
    }, []);
}
