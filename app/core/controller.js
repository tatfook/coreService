/* eslint-disable no-magic-numbers */
'use strict';
const joi = require('joi');
const _ = require('lodash');
const Controller = require('egg').Controller;

const Err = require('./err.js');

const rules = {
    int: joi.number().required(),
    int_optional: joi.number(),
    number: joi.number().required(),
    number_optional: joi.number(),
    string: joi.string().required(),
    string_optional: joi.string(),
    boolean: joi.boolean().required(),
    boolean_optional: joi.boolean(),
    object: joi.object().required(),
    object_optional: joi.object(),
};

class BaseController extends Controller {
    get model() {
        return this.app.model;
    }

    // get config() {
    // return this.app.config.self;
    // }

    get axios() {
        return this.app.axios;
    }

    get util() {
        return this.app.util;
    }

    get consts() {
        return this.app.consts;
    }

    get queryOptions() {
        return this.ctx.state.queryOptions;
    }

    getParams() {
        return _.merge(
            {},
            this.ctx.request.body,
            this.ctx.query,
            this.ctx.params
        );
    }

    get log() {
        return this.app.log;
    }

    validate(schema, data, options = { allowUnknown: true }) {
        const params = data || this.getParams();

        schema = schema || {};

        _.each(schema, (val, key) => {
            schema[key] = rules[val] || val;
        });

        const result = joi.validate(params, schema, options);

        if (result.error) {
            const errmsg = result.error.details[0].message.replace(/"/g, '');
            this.ctx.throw(400, 'invalid params:' + errmsg);
        }

        _.assignIn(params, result.value);

        return params;
    }

    getUser() {
        return this.ctx.state.user || {};
    }

    getAdmin() {
        return this.ctx.state.admin || {};
    }

    authenticated() {
        // return {userId:300, organizationId:1, roleId:64};
        const user = this.ctx.state.user;
        const admin = this.ctx.state.admin;

        if (!user || user.userId === undefined) {
            if (!admin || admin.userId === undefined) return this.throw(401);
            return admin;
        }

        return user;
    }

    adminAuthenticated() {
        const config = this.config.self;
        const token = this.ctx.state.token;
        let user;
        try {
            user = this.app.util.jwt_decode(
                token || '',
                config.adminSecret,
                false
            );
        } catch (error) {
            return this.throw(401);
        }

        if (!user) return this.throw(401);

        return user;
    }

    success(body = 'OK', status = 200) {
        this.ctx.status = status;
        this.ctx.body = body;
    }

    fail(body, status, data) {
        this.ctx.status = status || 400;
        if (_.isNumber(body)) body = Err.getByCode(body) || body;
        if (_.isObject(body)) body.data = data;
        this.ctx.body = body;
    }

    throw(...args) {
        return this.ctx.throw(...args);
    }

    formatQuery(query) {
        const self = this;
        const Op = this.app.Sequelize.Op;
        for (const key in query) {
            const arr = key.split('-');
            if (arr.length !== 2) continue;

            const val = query[key];
            delete query[key];

            const newkey = arr[0];
            const op = arr[1];
            const oldval = query[newkey];

            if (!_.isPlainObject(oldval)) {
                query[newkey] = {};
                if (oldval) {
                    query[newkey][Op.eq] = oldval;
                }
            }
            query[newkey][Op[op]] = val;
        }

        const replaceOp = function(data) {
            if (!_.isObject(data)) return;
            _.each(data, (val, key) => {
                if (_.isString(key)) {
                    const op = key.substring(1);
                    if (_.startsWith(key, '$') && Op[op]) {
                        data[Op[op]] = val;
                        delete data[key];
                    }
                    if (
                        key === '$model$' &&
                        typeof val === 'string' &&
                        self.model[val]
                    ) {
                        data.model = self.model[val];
                        delete data.$model$;
                    }
                }
                replaceOp(val);
            });
        };

        replaceOp(query);
    }

    async count() {
        const model = this.model[this.modelName];
        const query = this.validate();

        this.formatQuery(query);

        const result = await model.count({
            ...this.queryOptions,
            where: query,
        });

        this.success(result);
    }

    async search() {
        const model = this.model[this.modelName];
        const query = this.validate();

        this.formatQuery(query);

        const result = await model.findAndCountAll({
            ...this.queryOptions,
            where: query,
        });

        this.success(result);
    }

    async _search() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const query = this.validate();
        query.userId = userId;

        this.formatQuery(query);

        const result = await model.findAndCountAll({
            ...this.queryOptions,
            where: query,
        });

        this.success(result);
    }

    async query() {
        const model = this.model[this.modelName];
        const query = this.validate();

        this.formatQuery(query);

        const result = await model.findAndCountAll(query);

        this.success(result);
    }

    async index() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate();
        params.userId = userId;

        this.formatQuery(params);

        const list = await model.findAll({
            ...this.queryOptions,
            where: params,
        });

        return this.success(list);
    }

    async show() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate({ id: 'int' });
        const id = params.id;

        const data = await model.findOne({ where: { id, userId } });
        if (!data) return this.throw(404);

        return this.success(data);
    }

    async update() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate({ id: 'int' });
        const id = params.id;

        delete params.userId;

        const data = await model.update(params, { where: { id, userId } });

        return this.success(data);
    }

    async destroy() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate({ id: 'int' });
        const id = params.id;

        const data = await model.destroy({ where: { id, userId } });

        return this.success(data);
    }

    async create() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate();

        params.userId = userId;

        const data = await model.create(params);

        return this.success(data);
    }

    async upsert() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate();

        params.userId = userId;

        const data = await model.upsert(params);

        return this.success(data);
    }

    async postExtra() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate({ id: 'int' });
        const where = { id: params.id, userId };

        const result = await model.update({ extra: params }, { where });

        return this.success(result);
    }

    async putExtra() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate({ id: 'int' });
        const where = { id: params.id, userId };

        let data = await model.findOne({ where });
        if (!data) this.throw(404);
        data = data.get({ plain: true });

        const extra = data.extra || {};
        _.merge(extra, params);

        const result = await model.update({ extra }, { where });

        this.success(result);
    }

    async getExtra() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate({ id: 'int' });
        const where = { id: params.id, userId };

        let data = await model.findOne({ where });
        if (!data) this.throw(404);
        data = data.get({ plain: true });

        this.success(data.extra || {});
    }

    async deleteExtra() {
        const userId = this.authenticated().userId;
        const model = this.model[this.modelName];
        const params = this.validate({ id: 'int' });
        const where = { id: params.id, userId };

        const result = await model.update({ extra: {} }, { where });

        return this.success(result);
    }
}

module.exports = BaseController;
