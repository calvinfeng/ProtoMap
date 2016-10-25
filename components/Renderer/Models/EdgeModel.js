'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Nadir Muzaffar

// Thirdparty imports
import { EventEmitter2 } from 'eventemitter2';
import { Point }         from 'paper';

export default class EdgeModel extends EventEmitter2 {
    constructor(data) {
        super({ maxListeners: 0 });

        this.id = data.uuid;
        this.sourceId = data.source_uuid;
        this.targetId = data.target_uuid;
    }

    setProps({ sourceId, targetId }) {
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.emit('change', this.sourceId, this.targetId);
    }

    destroy() {
        this.emit('destroy', this); // do this before removing all listeners so they get the event first
        this.removeAllListeners();
    }

    toJSON() {
        return {
            uuid: this.id,
            source_uuid: this.sourceId,
            target_uuid: this.targetId
        };
    }
}
