const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const PBlock = class extends Controller {
	get modelName() {
		return "pBlocks";
	}

	async use() {
		const {id} = this.validate({id:"number"});
		
		await this.model.pBlocks.increment({
			useCount:1,
		}, {
			where: {id},
		});

		return this.success();
	}

	async destroy() {
		const {userId} = this.authenticated();
		const {id} = this.validate({id:"number"});
		const config = this.app.config.self;

		const block = await this.model.pBlocks.findOne({where:{id, userId}}).then(o => o && o.toJSON());
		if (!block) return this.success();

		const bucketDomain = config.qiniuPublic.bucketDomain;
		const bucket = config.qiniuPublic.bucketName;

		if (block.previewUrl) {
			const key = block.previewUrl.replace(bucketDomain + "/", "");
			await this.ctx.service.qiniu.delete({key, bucket});
		}

		if (block.fileUrl) {
			const key = block.fileUrl.replace(bucketDomain + "/", "");
			await this.ctx.service.qiniu.delete({key, bucket});
		}

		await this.model.pBlocks.destroy({where:{id, userId}});

		return this.success();
	}
}

module.exports = PBlock;
