
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
		DATE,
	} = app.Sequelize;

	const model = app.model.define("lessonOrganizationClasses", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		organizationId: {
			type: BIGINT,
			defaultValue: 0,
		},

		name: {
			type: STRING,
		},

		extra: {
			type: JSON,
			defaultValue: {},
		}

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',

		indexes: [
		{
			unique: true,
			fields: ["organizationId", "name"],
		},
		],
	});

	//model.sync({force:true});
	
	app.model.lessonOrganizationClasses = model;

	return model;
};
