/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON } = app.Sequelize;

    const model = app.model.define(
        'oauthUsers',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                // 文件所属者
                type: BIGINT,
                defaultValue: 0,
            },

            externalId: {
                type: STRING(128),
                allowNull: false,
            },

            externalUsername: {
                type: STRING,
                defaultValue: '',
            },

            type: {
                type: INTEGER,
                allowNull: false,
            },

            token: {
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
            indexes: [
                {
                    unique: true,
                    fields: [ 'externalId', 'type' ],
                },
            ],
        }
    );

    app.model.oauthUsers = model;

    return model;
};
