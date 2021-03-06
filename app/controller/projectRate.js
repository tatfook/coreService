'use strict';
const Controller = require('../core/controller.js');

const ProjectRates = class extends Controller {
    get modelName() {
        return 'projectRates';
    }

    async create() {
        const { userId } = this.authenticated();
        const { projectId, rate } = this.validate({
            projectId: 'int',
            rate: 'int',
        });

        const data = await this.model.projectRates.create({
            userId,
            projectId,
            rate,
        });
        await this.ctx.service.project.rate(projectId, rate);
        await this.ctx.service.project.worksRate(projectId, rate);

        return this.success(data);
    }
};

module.exports = ProjectRates;
