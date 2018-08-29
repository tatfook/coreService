
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const SiteFile = class extends Controller {
	get modelName() {
		return "siteFiles";
	}

	get storage() {
		return this.app.storage;
	}

	ERR(code, data) {
		return this.success({code, data});
	}

	async url() {
		const params = this.validate({
			fileId:"int",
			userId:"int",
			siteId:"int",
		});
		const {userId} = this.authenticated();

		if (userId != params.userId) {
			// 验证访问权限
		}
		
		const where = {
			userId: params.userId,
			siteId: params.siteId,
			fileId: params.fileId,
		};

		let data = await this.model.siteFiles.findOne({where});
		if (!data) data = await this.model.siteFiles.create(where);

		data = data.get({plain: true});

		const url = baseURL + data.id + "/raw";

		return this.ERR(0, url);
	}

	async rawurl() {
		const {id} = this.validate({id:'int'});

		let data = await this.model.siteFiles.findOne({where: {id:id}});
		if (!data) return this.ERR(-1);

		data = data.get({plain:true});

		let file = await this.model.files.findOne({where:{id:data.fileId}});
		if (!file) return this.ERR(-1);
		file = file.get({plain:true});

		const url = this.storage.getDownloadUrl(file.key);

		return this.ERR(0, url);
	}

	async raw() {
		const result = await this.rawurl();

		if (!result.data) {
			return this.throw(404);
		}

		const url = result.data;

		console.log(url);

		this.ctx.redirect(url);
	}

	async index() {
		const params = this.validate();
		const {userId} = this.authenticated();
		params.userId = userId;

		const result = await this.model.siteFiles.findAndCount({where: params});
		const rows = [];
		_.each(result.rows, item => {
			item = item.get({plain:true});
			item.url = baseURL + item.id + "/raw";
			rows.push(item);
		});

		return this.ERR(0, {count:result.count, rows:rows});
	}
}

module.exports = SiteFile;
