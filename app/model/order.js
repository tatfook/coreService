
module.exports = app => {
	const {
		BIGINT,
		INTEGER,
		STRING,
		TEXT,
		BOOLEAN,
		JSON,
	} = app.Sequelize;

	const model = app.model.define("orders", {
		id: {
			type: BIGINT,
			autoIncrement: true,
			primaryKey: true,
		},
		
		userId: {                    // 用户ID
			type: BIGINT,
			allowNull:  false,
		},
		
		orderNo: {
			type: STRING(64),        // 交易号
			unique: true,
		},

		amount: {                    // 金额
			type: INTEGER,
		},

		state: {
			type: BIGINT,            // 交易状态
		},

		channel: {                   // 支付渠道
			type: STRING(16),
		},

		tradeId: {                   // 交易ID
			type: BIGINT,            
			defaultValue: 0,
		},

		chargeId: {
			type: STRING(64), // pingppId
		},

		refundId: {
			type: STRING(64), // pingppId
		},

		extra: {
			type: JSON,
			defaultValue: {},
		},

	}, {
		underscored: false,
		charset: "utf8mb4",
		collate: 'utf8mb4_bin',
	});

	//model.sync({force:true});
	
	app.model.orders = model;
	
	return model;
};

