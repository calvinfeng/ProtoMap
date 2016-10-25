import {EventEmitter2} from 'eventemitter2';
import {Point}         from 'paper';

export default class AreaModel extends EventEmitter2 {
    constructor(data) {
        super({maxListeners: 0});

        this.id = data.uuid;
        this.annotationType = data.annotation_type;
        this.points = (data.points || []).map(({x, y}) => new Point(x, y));
        this.shape = data.shape;
    }

    setProps({points}) {
        this.points = points.map(point => new Point(point));
        this.emit('change', points);
    }

    destroy() {
        this.emit('destroy', this); // do this before removing all listeners so they get the event first
        this.removeAllListeners();
    }

    toJSON() {
        return {
            uuid: this.id,
            annotation_type: this.annotationType,
            shape: this.shape,
            coordinates: {
                north_east: {x: 0, y: 0},
                south_west: {x: 0.1, y: 0.1}
            },
            points: this.points.map(({x, y}) => ({x, y}))
        };
    }
}
