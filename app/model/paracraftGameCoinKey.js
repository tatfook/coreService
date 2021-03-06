/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON, DATE } = app.Sequelize;
    // paracraft嵌入设备
    const model = app.model.define(
        'paracraftGameCoinKeys',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            key: {
                // 激活码
                type: STRING,
                unique: true,
            },

            price: {
                // 价格
                type: INTEGER,
                defaultValue: 0,
            },

            active: {
                // 是否激活
                type: INTEGER,
                defaultValue: false,
            },

            activeTime: {
                // 激活时间
                type: DATE,
            },

            gameCoin: {
                // 游戏币数量
                type: INTEGER,
                defaultValue: 0,
            },

            deviceId: {
                // 激活设备ID
                type: STRING,
                defaultValue: '',
            },

            identity: {
                // 购买者身份
                type: INTEGER,
                defaultValue: 0,
            },

            purchase: {
                // 是否购买
                type: INTEGER,
                defaultValue: false,
            },

            purchaseName: {
                // 购买者姓名
                type: STRING,
                defaultValue: '',
            },

            purchaseCellphone: {
                // 购买者电话
                type: STRING(24),
                defaultValue: '',
            },

            purchaseTime: {
                // 购买时间
                type: DATE,
            },

            description: {
                // 描述
                type: STRING,
                defaultValue: '',
            },

            extra: {
                type: JSON,
                defaultValue: {},
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    app.model.paracraftGameCoinKeys = model;

    model.associate = () => {
        app.model.paracraftGameCoinKeys.belongsTo(app.model.paracraftDevices, {
            as: 'paracraftDevices',
            foreignKey: 'deviceId',
            targetKey: 'deviceId',
            constraints: false,
        });
    };
    return model;
};
