const joi = require("joi");
const _ = require("lodash");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_PROJECT,

	PROJECT_TYPE_SITE,
	PROJECT_TYPE_PARACRAFT,
} = require("../core/consts.js");
const Controller = require("../core/controller.js");

const Project = class extends Controller {
	get modelName() {
		return "projects";
	}

	// 创建3D 实现3D世界相关的文件的创建  
	// project 对象项目记录对象
	async createWorld(project) {
		const worldName = project.name;  // 世界名
		const projectId = project.id;    // 项目ID
		const userId = project.userId;   // 用户ID

		const data = await this.ctx.service.world.generateDefaultWorld(worldName);
		console.log(data ? `创建世界成功:${worldName}` : `创建世界失败:${worldName}`);
		if (!data) {
			await this.model.projects.destroy({where:{id:projectId}});
			//await this.model.projects.update({where:{id:projectId}});
			return false;
		};
		await this.model.worlds.upsert({worldName, projectId, userId, archiveUrl:data.archiveUrl});
		await this.model.projects.update({status:2}, {where:{id:projectId}});

		return true;
	}

	async destroyWorld(project) {
		const worldName = project.name;  // 世界名
		const projectId = project.id;    // 项目ID
		const userId = project.userId;   // 用户ID
		
		await this.model.worlds.destroy({where:{projectId, userId}});

		await this.ctx.service.world.removeProject(worldName);

		return true;
	}

	async status() {
		const {id} = this.validate({id:"int"});

		let project = await this.model.projects.findOne({where:{id}});
		if (!project) return this.success(0);
		project = project.get({plain:true});

		return this.success(project.status);
	}

	async setProjectUser(list) {
		const userIds = [];

		_.each(list, (o, i) => {
			o = o.get ? o.get({plain:true}) : o;
			userIds.push(o.userId);
			list[i] = o;
		});

		const users = await this.model.users.getUsers(userIds);

		_.each(list, o => {
			o.user = users[o.userId];
		});
	}

	async search() {
		const model = this.model[this.modelName];
		const query = this.validate();

		this.formatQuery(query);

		const result = await model.findAndCount({...this.queryOptions, where:query});
		const rows = result.rows;

		await this.setProjectUser(rows);

		return this.success(result);
	}

	async join() {
		const {userId} = this.authenticated();

		const list = await this.model.projects.getJoinProjects(userId);

		await this.setProjectUser(list);

		return this.success(list);
	}

	async index() {
		const userId = this.authenticated().userId;
		const model = this.model[this.modelName];
		const params = this.validate();
		params.userId = userId;

		this.formatQuery(params);

		const list = await model.findAll({...this.queryOptions, where:params});

		await this.setProjectUser(list);

		return this.success(list);
	}

	async create() {
		const userId = this.authenticated().userId;
		const params = this.validate({type:"int"});

		params.userId = userId;
		params.status = params.type == PROJECT_TYPE_PARACRAFT ? 1 : 2; // 1 - 创建中  2 - 创建完成
		delete params.star;
		delete params.stars;
		delete params.visit;
		delete params.hotNo;
		delete params.choicenessNo;

		const data = await this.model.projects.create(params);
		if (!data) return this.throw(500, "记录创建失败");
		const project = data.get({plain:true});

		if (params.type == PROJECT_TYPE_PARACRAFT) {
			this.createWorld(project);
			//const ok = await this.createWorld(project);
			//if (!ok) {
				//await this.model.projects.destroy({where:{id:project.id}});
				//return this.throw(500, "创建世界失败");
			//}
		}

		return this.success(project);
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"int"});

		const project = await this.model.projects.getById(id, userId);
		if (!project) return this.success("OK");

		if (project.type == PROJECT_TYPE_PARACRAFT) {
			const ok = await this.destroyWorld(project);
			//if (!ok) return this.throw(500, "删除世界失败");
		}

		const data = await this.model.projects.destroy({where:{id, userId}});

		return this.success(data);
	}

	async update() {
		const userId = this.authenticated().userId;
		const params = this.validate({"id":"int"});
		const id = params.id;

		delete params.userId;
		delete params.star;
		delete params.stars;
		delete params.visit;
		delete params.hotNo;
		delete params.choicenessNo;

		const data = await this.model.projects.update(params, {where:{id, userId}});

		return this.success(data);
	}

	async visit() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		
		if (!project) return this.throw(404);

		//project.visit++;
		await this.model.projects.statistics(id, 1, 0, 0);

		//await this.model.projects.update({visit:project.visit}, {where:{id}});

		return this.success(project);
	}

	async isStar() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);

		const index = _.findIndex(project.stars, id => id == userId);

		return this.success(index < 0 ? false : true);
	}

	async star() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);

		project.stars = project.stars || [];
		const index = _.findIndex(project.stars, id => id == userId);
		if (index >= 0) return this.success(project);

		project.stars.push(userId);
		//project.star++;
		await this.model.projects.update(project, {fields:["stars"], where:{id}});

		await this.model.projects.statistics(id, 0, 1, 0);

		return this.success(project);
	}

	async unstar() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);

		project.stars = project.stars || [];
		const index = _.findIndex(project.stars, id => id == userId);
		if (index < 0) return this.success(project);
		project.stars.splice(index, 1);
		await this.model.projects.update(project, {fields:["stars"], where:{id}});

		//project.star--;
		await this.model.projects.statistics(id, 0, -1, 0);

		return this.success(project);
	}

	async detail() {
		const {id} = this.validate({id:'int'});

		const project = await this.model.projects.getById(id);
		if (!project) return this.throw(404);
		
		project.favoriteCount = await this.model.favorites.objectCount(project.id, ENTITY_TYPE_PROJECT);
		if (project.type == PROJECT_TYPE_PARACRAFT) {
			project.world = await this.model.worlds.getByProjectId(project.id);
		}

		return this.success(project);
	}

	async world() {
		//const {id} = this.validate()
	}
}

module.exports = Project;
