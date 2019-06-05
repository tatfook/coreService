
const { app, mock, assert  } = require('egg-mock/bootstrap');
const initData = require("../data.js");

describe("项目", () => {
	before(async () => {
		await initData(app);
	});

	it("001 项目增删改查", async ()=> {
		const token = await app.httpRequest().post("/api/v0/users/login").send({
			username:"user001",
			password:"123456",
		}).expect(res => assert(res.statusCode == 200)).then(res => res.body.token);
		assert.ok(token);

		// 创建项目
		let project = await app.httpRequest().post("/api/v0/projects").send({
			name:"projectname1",
			type:0,
		}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(project.id);
		const projectId = project.id;
		
		// 更新项目
		await app.httpRequest().put(`/api/v0/projects/${projectId}`).send({description:"test"}).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);

		// 获取指定项目
		project = await app.httpRequest().get(`/api/v0/projects/${projectId}`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(project);
		assert(project.id == projectId);
		assert(project.description == "test");

		// 获取项目列表
		let projects = await app.httpRequest().get(`/api/v0/projects`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(projects.length == 1);

		// 获取参与项目
		projects = await app.httpRequest().get(`/api/v0/projects/join?exclude=true`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(projects.length == 0);

		// 访问项目
		let data = await app.httpRequest().get(`/api/v0/projects/${projectId}/visit`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.model.projects.findOne({where: {id: projectId}});
		assert.equal(data.id, 1);
		assert.equal(data.visit, 1);
		
		// 点赞项目  访问项目
		data = await app.httpRequest().post(`/api/v0/projects/${projectId}/star`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.httpRequest().get(`/api/v0/projects/${projectId}/visit`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.model.projects.findOne({where: {id: projectId}});
		assert.equal(data.visit, 2);
		assert.equal(data.star, 1);

		// 是否点赞
		data = await app.httpRequest().get(`/api/v0/projects/${projectId}/star`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		assert(data);

		// 取消点赞 访问项目
		data = await app.httpRequest().post(`/api/v0/projects/${projectId}/unstar`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.httpRequest().get(`/api/v0/projects/${projectId}/visit`).set("Authorization", `Bearer ${token}`).expect(res => assert(res.statusCode == 200)).then(res => res.body);
		data = await app.model.projects.findOne({where: {id: projectId}});
		assert.equal(data.visit, 3);
		assert.equal(data.star, 0);
	});
});
