const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} = require("../core/consts.js");

const Favorite = class extends Controller {
	get modelName() {
		return "favorites";
	}
	
	async index() {
		const {model, ctx} = this;
		const {userId, objectType} = this.validate({
			objectType: joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE).required(),
			userId: joi.number().required(),
		});

		let list = [];
		if (objectType == ENTITY_TYPE_USER) {
			list = await model.favorites.getFollowing(userId);
		} else if (objectType == ENTITY_TYPE_SITE) {
			list = await model.favorites.getFavoriteSites(userId);
		} else if (objectType == ENTITY_TYPE_PAGE) {
			list = await model.favorites.getFavoritePages(userId);
		}

		return this.success(list);
	}

	async create() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			objectId: "int", 
			objectType: joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE).required(),
		});

		const data = await model.favorites.favorite(userId, params.objectId, params.objectType);

		return this.success(data);
	}

	async destroy() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			objectId: "int", 
			objectType: joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE).required(),
		});

		const data = await model.favorites.unfavorite(userId, params.objectId, params.objectType);
		return this.success(data);
	}

	async exist() {
		const {model, ctx} = this;
		const userId = this.authenticated().userId;
		const params = this.validate({
			objectId: "int", 
			objectType: joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE).required(),
		});
		const data = await model.favorites.findOne({where:{
			userId,
			objectId: params.objectId,
			objectType: params.objectType,
		}});

		const ok = data ? true : false;

		return this.success(ok);
	}

	async follows() {
		const {model, ctx} = this;
		const {objectId, objectType} = this.validate({
			objectId: "int", 
			objectType: joi.number().valid(ENTITY_TYPE_USER, ENTITY_TYPE_SITE,ENTITY_TYPE_PAGE).required(),
		});
	
		const list = await model.favorites.getFollows(objectId, objectType);
		return this.success(list);
	}
}

module.exports = Favorite;
