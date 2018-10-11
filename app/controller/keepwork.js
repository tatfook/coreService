
const _ = require("lodash");
const Controller = require("../core/controller.js");

const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
	ENTITY_TYPE_PROJECT,

	PROJECT_PRIVILEGE_RECRUIT_ENABLE,
	PROJECT_PRIVILEGE_RECRUIT_DISABLE,

	PROJECT_TYPE_PARACRAFT,
	PROJECT_TYPE_SITE
} = require("../core/consts.js");

class Keepwork extends Controller {
	async statistics() {
		const {app} = this;

		const paracraftCount = await app.model.projects.count({where:{type:PROJECT_TYPE_PARACRAFT}});
		const siteCount = await app.model.projects.count({where:{type:PROJECT_TYPE_SITE}});
		const projectCount = paracraftCount + siteCount;

		const sql = `select count(*) count from projects where privilege & :recuritValue`;
		const list = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				recuritValue: PROJECT_PRIVILEGE_RECRUIT_ENABLE,
			}
		});
		const recuritCount = list[0] ? list[0].count : 0;
		const userCount = await app.model.users.count({});

		const data = {paracraftCount, siteCount, recuritCount, userCount, projectCount}

		return this.success(data);
	}

	async test() {
		const cache = this.app.cache.get("test");

		if (!cache) this.app.cache.put("test", "hello world", 1000 * 60 * 10);

		const caches = this.model.caches;

		await caches.destroy({where:{key:"key"}});
		await caches.destroy({where:{key:"key1"}});
		console.log("---------------create cache-------------");
		await caches.create({key:"key", value:"value"});
		console.log("---------------update cache-------------");
		await caches.update({key:"key", value:{key:1}}, {where:{key:"key"}});
		console.log("--------------upsert caceh----------------");
		await caches.upsert({key:"key", value:"value"});
		await caches.upsert({key:"key1", value:"value1"});
		console.log("--------------destroy cache---------------");
		await caches.destroy({where:{key:"key"}});
		await caches.destroy({where:{key:"key1"}});
		return this.success(cache);
	}
}

module.exports = Keepwork;
