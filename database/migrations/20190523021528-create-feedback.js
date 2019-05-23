'use strict';

const tableName = 'feedbacks';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const {
      BIGINT,
      STRING,
      INTEGER,
      TEXT,
      DATE,
    } = Sequelize;

    return queryInterface.createTable(tableName, {
      id: {
        type: BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: { // 举报用户id
        type: BIGINT,
        defaultValue: 0,
      },

      username: { // 举报用户名
        type: STRING,
        defaultValue: '',
      },

      type: { // 类型 0 -- 其它  1 -- 假冒网站 2 -- 传播病毒 3 -- 反动  4 -- 色情 5 -- 暴力
        type: INTEGER,
        defaultValue: 0,
      },

      url: { // 网址
        type: TEXT,
      },

      description: { // 举报说明
        type: TEXT,
      },

      state: { // 0 -- 未处理   1  -- 已处理
        type: INTEGER,
        defaultValue: 0,
      },

      result: { // 处理方式 0 -- 未处理 1 -- 处理 2 -- 误报 3 -- 重复
        type: INTEGER,
        defaultValue: 0,
      },

      handle: { // 处理人
        type: BIGINT,
        defaultValue: 0,
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
