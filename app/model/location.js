
const _ = require("lodash");

module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		FLOAT,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		GEOMETRY,
		DECIMAL,
	} = app.Sequelize;

	const model = app.model.define("locations", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {
			type: BIGINT,
			unique: true,
			allowNull: false,
		},
		
		longitude: {                        // 经度
			type: FLOAT(10, 6),
		},

		latitude: {                         // 维度
			type: FLOAT(10, 6),
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true}).then(() => {
		//console.log("create table successfully");
	//});
	
	app.model.locations = model;
	return model;
};




