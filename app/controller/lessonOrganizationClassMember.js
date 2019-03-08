
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const {
	ENTITY_TYPE_ORGANIZATION,
	ENTITY_TYPE_ORGANIZATION_CLASS,

	CLASS_MEMBER_ROLE_ADMIN,
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
} = require("../core/consts.js");

const LessonOrganizationClassMember = class extends Controller {
	get modelName() {
		return "lessonOrganizationClassMembers";
	}

	async teacher() {
		const {organizationId} = this.authenticated();

		const sql = `select memberId from lessonOrganizationClassMembers where organizationId = ${organizationId} and roleId & ${CLASS_MEMBER_ROLE_TEACHER} group by roleId`;
		const memberIds = await this.model.query(sql, {type:this.model.QueryTypes.SELECT});

		if (memberIds.length == 0) return this.success([]);

		const list = await this.model.lessonOrganizationClassMembers.findAll({
			include: [
			{
				as: "users",
				attributes: ["id", "username", "nickname", "portrait"],
				model: this.model.users,
			},
			{
				as: "lessonOrganizationClasses",
				model: this.model.lessonOrganizationClasses,
			}
			],
			where: {
				organizationId,
				memberId: {
					[this.model.Op.in]: memberIds,
				}
			}
		}).then(list => _.map(list, o => o.toJSON()));
		const map = {};
		_.each(list, o => {
			map[o.memberId] = map[o.memberId] || o;
			map[o.memberId].classes = map[o.memberId].classes || [];
			map[o.memberId].classes.push(o.lessonOrganizationClasses);
			map[o.memberId].username = o.users.username;
		});
		const datas = [];
		_.each(map, o => datas.push(o));
		return this.success(datas);
	}

	async student() {
		const {organizationId} = this.authenticated();
		const {classId} = this.validate({classId:"number"});
		const list = await this.model.lessonOrganizationClassMembers.findAll({
			include: [
			{
				as: "users",
				attributes: ["id", "username", "nickname", "portrait"],
				model: this.model.users,
			},
			],
			where: {
				organizationId,
				classId,
			},
		}).then(list => _.filter(list, o => o.roleId & CLASS_MEMBER_ROLE_STUDENT));
		
		return this.success(list);
	}

	async create() {
		const {organizationId, roleId} = this.authenticated();
		const params = this.validate({classId:"number"});
		params.organizationId = organizationId;
		params.roleId = params.roleId || CLASS_MEMBER_ROLE_STUDENT;

		if (!params.memberId) {
			if (!params.memberName) return this.throw(400);
			const user = await this.model.users.findOne({where:{username: params.memberName}}).then(o => o && o.toJSON());
			if (!user) return this.throw(400, "成员不存在");
			params.memberId = user.id;
		}
		if (params.roleId >= roleId) return this.throw(411, "无权限");

		if (roleId < CLASS_MEMBER_ROLE_ADMIN) {
			if (roleId <= CLASS_MEMBER_ROLE_STUDENT)	return this.throw(411, "无权限");
			const organ = await this.model.lessonOrganizations.findOne({where:{id: organizationId}}).then(o => o && o.toJSON());
			if (!organ) return this.throw(500);
			if (organ.privilege && 1 == 0) return this.throw(411, "无权限");
		} 
		
		const member = await this.model.lessonOrganizationClassMembers.create(params);

		return this.success(member);
	}
	
	async destroy() {
		const {organizationId, roleId} = this.authenticated();
		const {id} = this.validate({id: "number"});

		const member = await this.model.lessonOrganizationClassMembers.findOne({where:{organizationId, id}}).then(o => o && o.toJSON());
		if (member.roleId >= roleId) return this.throw(411);

		if (roleId < CLASS_MEMBER_ROLE_ADMIN) {
			if (roleId <= CLASS_MEMBER_ROLE_STUDENT)	return this.throw(411, "无权限");
			const organ = await this.model.lessonOrganizations.findOne({where:{id: organizationId}}).then(o => o && o.toJSON());
			if (!organ) return this.throw(500);
			if (organ.privilege && 2 == 0) return this.throw(411, "无权限");
		} 
		
		const member = await this.model.lessonOrganizationClassMembers.destroy({where:{id}});

		return this.success("OK");
	}

	// 禁止更新
	async update() {
	}
}

module.exports = LessonOrganizationClassMember;