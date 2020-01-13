'use strict';

const Controller = require('../core/controller.js');

// api for lesson
const Lesson = class extends Controller {
    // -----------api for lesson-api project--------------------
    get validateRules() {
        return this.app.validator.lesson;
    }
    get lessonApiKey(){
        return this.app.config.self.INTERNAL_API_KEY;
    }

    async getUserDatas() {
        const { id, apiKey } = this.validate({ id: 'int' });
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const res = await this.model.userdatas.get(id);

        return this.success(res);
    }

    async setUserDatas() {
        const { id, apiKey, ...params } = this.validate({ id: 'int' });
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const res = await this.model.userdatas.set(id, params);

        return this.success(res);
    }

    async update() {
        const { condition, params, apiKey } = this.validate();
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const resourceName = params.resources || '';
        this.resource = this.ctx.model[resourceName];

        const res = await this.resource.update(params, { where: condition });

        return this.success(res);
    }

    async accountsAndRoles() {
        const { userId, apiKey } = this.validate();
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const [ account = {}, allianceMember, tutor ] = await Promise.all([
            this.model.accounts.getByUserId(userId),
            this.model.roles.getAllianceMemberByUserId(userId),
            this.model.roles.getTutorByUserId(userId),
        ]);

        return this.success([ account, allianceMember, tutor ]);
    }

    async accountsIncrement() {
        const { incrementObj, userId, apiKey } = this.validate();
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const ret = await this.model.accounts.increment(incrementObj, {
            where: { userId },
        });

        return this.success(ret);
    }

    async getAccounts() {
        const { userId, apiKey } = this.validate();
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const ret = await this.model.accounts.findOne({ where: { userId } });
        return this.success(ret);
    }

    async createRecord() {
        const { params, apiKey } = this.validate();
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const resourceName = params.resources || '';
        this.resource = this.ctx.model[resourceName];

        const ret = await this.resource.create(params);
        return this.success(ret);
    }

    async truncate() {
        const { params, apiKey } = this.validate();
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const resourceName = params.resources || '';
        this.resource = this.ctx.model[resourceName];

        const ret = await this.resource.truncate();
        return this.success(ret);
    }

    async getAllPrjects() {
        const { condition, apiKey, order } = this.validate();
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const ret = await this.ctx.model.projects.findAll({
            order,
            where: condition,
        });
        return this.success(ret);
    }

    async getUserById() {
        const { id, apiKey } = this.validate({ id: 'int' });
        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const user = await this.service.lesson.getUserById(id);
        if (!user) {
            // eslint-disable-next-line no-magic-numbers
            return this.fail(12);
        }
        return this.success(user);
    }

    async updateUserById() {
        const { id, apiKey, params } = this.validate({ id: 'int' });
        if (apiKey !== this.lessonApiKey) return this.fail(-1);
        const user = await this.service.lesson.getUserById(id);
        if (!user) {
            // eslint-disable-next-line no-magic-numbers
            return this.fail(12);
        }
        // 如果教师等级低于用户的教师等级则不更新
        if (params.tLevel && params.tLevel < user.tLevel) {
            delete params.tLevel;
        }
        const result = await this.service.lesson.updateUserById(id, params);
        return this.success(result);
    }

    // 获取用户的项目数
    async getUserProjectCount() {
        const { userIds, apiKey } = this.getParams();

        await this.ctx.validate(this.validateRules.userProjectCount, {
            userIds,
            apiKey,
        });

        if (apiKey !== this.lessonApiKey) return this.fail(-1);

        const ret = await this.ctx.model.userRanks.findAll({
            where: { userId: { $in: userIds } },
        });
        return this.success(ret);
    }
    // -----------api for lesson-api project--------------------
};

module.exports = Lesson;
