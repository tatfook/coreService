
const {
	ENTITY_TYPE_USER,
	ENTITY_TYPE_SITE,
	ENTITY_TYPE_PAGE,
} = require("../core/consts.js");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("favorites", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},

		userId: {
			type: BIGINT,
			allowNull: false,
		},

		objectId: {
			type: BIGINT,
			allowNull: false,
		},

		objectType: {
			type: INTEGER,
			allowNull: false,
		},

		extra: {
			type:JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["userId", "objectId", "objectType"],
		},
		],
	});

	//model.sync({force:true});

	model.getById = async function(id, userId) {
		const where = {id};

		if (userId) where.userId = userId;

		const data = await app.model.domains.findOne({where: where});

		return data && data.get({plain:true});
	}
	
	// 获取粉丝
	model.getFollows = async function(objectId, objectType = ENTITY_TYPE_USER) {
		const sql = `select users.id, users.username, users.nickname, users.portrait 
			from favorites, users
			where favorites.userId = users.id and objectType = :objectType and favorites.objectId = :objectId`;

		const result = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType,
				objectId,
			}
		});

		return result;
	}

	// 关注
	model.getFollowing = async function(userId) {
		const sql = `select users.id, users.username, users.nickname, users.portrait 
			from favorites, users
			where favorites.objectId = users.id and objectType = :objectType and favorites.userId = :userId`;

		const result = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType: ENTITY_TYPE_USER,
				userId: userId,
			}
		});

		return result;
	}

	// 获取收藏的站点
	model.getFavoriteSites = async function(userId) {
		const sql = `select sites.*
			from favorites, sites 
			where favorites.objectId = sites.id and objectType = :objectType and favorites.userId = :userId`;

		const result = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType: ENTITY_TYPE_SITE,
				userId: userId,
			}
		});

		return result;
	}

	// 获取收藏的页面
	model.getFavoritePages = async function(userId) {
		const sql = `select pages.*
			from favorites, pages 
			where favorites.objectId = pages.id and objectType = :objectType and favorites.userId = :userId`;

		const result = await app.model.query(sql, {
			type: app.model.QueryTypes.SELECT,
			replacements: {
				objectType: ENTITY_TYPE_PAGE,
				userId: userId,
			}
		});

		return result;
	}

	model.favorite = async function(userId, objectId, objectType) {
		return await app.model.favorites.create({userId, objectId, objectType});
	}

	model.unfavorite = async function(userId, objectId, objectType) {
		return await app.model.favorites.destroy({where:{userId, objectId, objectType}});
	}

	model.objectCount = async function(objectId, objectType) {
		return await app.model.favorites.count({where:{objectId, objectType}});
	}

	model.getStatistics = async function(userId) {
		// 粉丝
		const followsCount = await this.model.count({where:{
			objectId:userId,
			objectType:ENTITY_TYPE_USER,
		}});

		// 关注
		const followingCount = await this.model.count({where:{
			userId,
			objectType:ENTITY_TYPE_USER,
		}});

		// 站点
		const siteFavoriteCount = await this.model.count({where:{
			userId,
			objectType:ENTITY_TYPE_SITE,
		}});
		
		// 页面
		const pageFavoriteCount = await this.model.count({where:{
			userId,
			objectType:ENTITY_TYPE_PAGE,
		}});

		// 返回统计信息
		return {
			followsCount,
			followingCount,
			siteFavoriteCount,
			pageFavoriteCount,
		}
	}

	app.model.favorites = model;
	return model;
};
