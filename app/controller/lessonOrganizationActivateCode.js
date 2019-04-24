
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const {
	CLASS_MEMBER_ROLE_STUDENT,
	CLASS_MEMBER_ROLE_TEACHER,
	CLASS_MEMBER_ROLE_ADMIN,
} = require("../core/consts.js");

const LessonOrganizationActivateCode = class extends Controller {
	get modelName() {
		return "lessonOrganizationActivateCodes";
	}

	async create() {
		const {userId, organizationId, roleId} = this.authenticated();
		const {count = 1, classId} = this.validate({count:"number", classId:"number"});

		if (!(roleId & CLASS_MEMBER_ROLE_ADMIN)) return this.throw(411);
		
		const datas = [];
		for (let i = 0; i < count; i++) {
			datas.push({
				organizationId,
				classId,
				key: _.random(0,10) + "" + organizationId + "" + userId + (new Date()).getTime() + _.random(0,10),
			});
		}
		const list = await this.model.lessonOrganizationActivateCodes.bulkCreate(datas);
		return this.success(list);
	}

	async index() {
		const {userId, organizationId, roleId} = this.authenticated();

		if (!(roleId & CLASS_MEMBER_ROLE_ADMIN)) return this.throw(411);

		const where = this.validate();
		where.organizationId = organizationId;

		const data = await this.model.lessonOrganizationActivateCodes.findAndCount({...this.queryOptions, where});

		return this.success(data);
	}

	async activate() {
		const {userId} = this.authenticated();
		const {key, realname} = this.validate({key:"string"});

		const curtime = new Date().getTime();
		const data = await this.model.lessonOrganizationActivateCodes.findOne({where:{key, state:0}}).then(o => o && o.toJSON());
		if (!data) return this.throw(400, "激活码已失效");

		const cls = await this.model.lessonOrganizationClasses.findOne({where:{id: data.classId}}).then(o => o && o.toJSON());
		if (!cls) return this.throw(400);
		const begin = new Date(cls.begin).getTime();
		const end = new Date(cls.end).getTime();
		if (curtime > end) this.throw(400, "班级结束");
		if (curtime < begin) this.throw(400, "班级未开始");

		const organ = await this.model.lessonOrganizations.findOne({where:{id: data.organizationId}}).then(o => o && o.toJSON());
		if (!organ) return this.throw(400);
	
		const usedCount = await this.model.lessonOrganizations.getUsedCount(data.organizationId);
		if (organ.count <= usedCount) return this.throw(400, "人数已达上限");

		await this.model.lessonOrganizationActivateCodes.update({activateTime: new Date(), activateUserId: userId, state:1}, {where:{key}});

		const m = await this.model.lessonOrganizationClassMembers.findOne({where:{organizationId: data.organizationId, classId:data.classId, memberId: userId}}).then(o => o && o.toJSON());
		if (m && m.roleId & CLASS_MEMBER_ROLE_STUDENT) return this.throw(400, "已是班级学生");

		const member = await this.model.lessonOrganizationClassMembers.create({
			organizationId: data.organizationId,
			classId: data.classId,
			memberId: userId,
			roleId: CLASS_MEMBER_ROLE_STUDENT,
			realname,
		});

		return this.success(member);
	}
}

module.exports = LessonOrganizationActivateCode;
