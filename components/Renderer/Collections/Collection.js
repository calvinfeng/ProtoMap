'use strict';

// Copyright 2016 Fetch Robotics, Inc.
// Author(s): Nadir Muzaffar

// Thirdparty imports
import { EventEmitter2 } from 'eventemitter2';
import _                 from 'lodash';

// Fetch imports

export default class Collection extends EventEmitter2 {
    /**
     * Takes a Model class which used to construct Models from raw data.
     * @param modelClass {AreaModel|NodeModel|EdgeModel}
     */
    constructor(modelClass) {
        super({ maxListeners: 0 });

        this.modelClass = modelClass;
        this.modelsMap = Object.create(null);
    }

    /**
     * Takes array of raw data that is parsed as the Model class specified in the Collection constructor.
     * @param {Array.<AreaModel|NodeModel|EdgeModel>} modelsData
     */
    setModelsFromData(modelsData) {
        const currentModels = _.values(this.modelsMap);
        const newModels = modelsData.map(data => new this.modelClass(data));

        const updated = _.intersectionBy(newModels, currentModels, 'id');
        const added = _.differenceBy(newModels, currentModels, 'id');
        const removed = _.differenceBy(currentModels, newModels, 'id');

        updated.forEach(model => this.getModel(model.id).setProps(model));
        added.forEach(model => this.addModel(model));
        removed.forEach(model => this.removeModel(model.id));
    }

    /**
     * Returns Model of given id or undefined if it does not exist.
     * @param id
     * @returns {AreaModel|NodeModel|EdgeModel|undefined}
     */
    getModel(id) {
        return this.modelsMap[id];
    }

    /**
     * Returns true if the collection has model of specified id, false otherwise.
     * @param id
     * @returns {boolean}
     */
    hasModel(id) {
        return this.modelsMap[id] !== undefined;
    }

    /**
     * Adds model to collection if it does not exist.
     * @param model {AreaModel|NodeModel|EdgeModel}
     * @returns {AreaModel|NodeModel|EdgeModel}
     */
    addModel(model) {
        if (!this.getModel(model.id)) {
            this.modelsMap[model.id] = model;
            this.emit('add', model);
        }

        return this.modelsMap[model.id];
    }

    /**
     * Removes model from collection if it exists. Returns undefined if it does not exist.
     * @param id
     * @returns {AreaModel|NodeModel|EdgeModel|undefined}
     */
    removeModel(id) {
        if (!this.getModel(id)) {
            return;
        }

        const model = this.getModel(id);
        delete this.modelsMap[id];
        this.emit('remove', model);

        return model;
    }

    /**
     * Call's iteratee on every Model in collection. Order is not guaranteed.
     * @param iteratee {Function}
     */
    forEach(iteratee) {
        _.forEach(this.modelsMap, iteratee);
    }

    /**
     * Return JSON array of objects returns by Model.toJSON().
     * @returns {Array.<AreaModel|NodeModel|EdgeModel>}
     */
    toJSON() {
        return _.map(this.modelsMap, model => model.toJSON());
    }
}
