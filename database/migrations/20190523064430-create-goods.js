'use strict';

const tableName = 'goods';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      INTEGER,
      STRING,
      JSON,
      DECIMAL,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: { // 记录id
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      goodsId: { // 平台的物品id
        type: BIGINT,
        defaultValue: 0,
      },

      platform: { // 物品所属平台
        type: INTEGER,
        defaultValue: 0,
      },

      thumbnail: { // 缩略图
        type: STRING,
        defaultValue: '',
      },

      subject: { // 商品标题
        type: STRING(64),
      },

      body: { // 商品描述信息
        type: STRING(256),
      },

      min: { // 单次最小购买量
        type: INTEGER,
        defaultValue: 1,
      },

      max: { // 单次最大购买量
        type: INTEGER,
        defaultValue: 1,
      },

      defaultCount: { // 默认购买量
        type: INTEGER,
        defaultValue: 1,
      },

      rmb: { // 人民币价格
        type: DECIMAL(10, 2),
        defaultValue: 0,
      },

      coin: { // 知识币价格
        type: INTEGER,
        defaultValue: 0,
      },

      bean: { // 知识豆价格
        type: INTEGER,
        defaultValue: 0,
      },

      callback: { // 交易成功回调通知 通过缓存解决
        type: STRING(128),
      },

      callbackData: { // 回调Data
        type: JSON,
        defaultValue: {},
      },

      extra: { // 附加信息
        type: JSON,
        defaultValue: {},
      },

      createdAt: {
        type: DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DATE,
        allowNull: false,
      },

    }, {
      underscored: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_bin',
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable(tableName);
  },
};