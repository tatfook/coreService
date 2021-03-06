/* eslint-disable no-magic-numbers */
'use strict';

module.exports = app => {
    const { BIGINT, INTEGER, STRING, JSON } = app.Sequelize;

    const attrs = {
        id: {
            type: BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        userId: {
            // 用户id
            type: BIGINT,
            allowNull: false,
        },

        gameId: {
            // 比赛id
            type: BIGINT,
            allowNull: false,
        },

        projectId: {
            // 项目id
            type: BIGINT,
            allowNull: false,
        },

        worksName: {
            // 作品名称
            type: STRING,
        },

        worksSubject: {
            // 作品主题
            type: STRING,
        },

        worksLogo: {
            // 作品封面
            type: STRING(512),
        },

        worksDescription: {
            // 作品简介
            type: STRING(2048),
        },

        worksRate: {
            // 作品评分
            type: INTEGER,
        },

        worksRateCount: {
            // 作品评分人数
            type: INTEGER,
        },

        win: {
            // 是否获奖
            type: INTEGER,
            defaultValue: 0,
        },

        reward: {
            // 获奖情况
            type: STRING,
        },

        extra: {
            type: JSON,
            defaultValue: {},
        },
    };

    const opts = {
        underscored: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_bin',

        indexes: [
            {
                unique: true,
                fields: [ 'projectId' ],
            },
        ],
    };

    const model = app.model.define('gameWorks', attrs, opts);

    app.model.gameWorks = model;

    model.associate = () => {
        app.model.gameWorks.belongsTo(app.model.games, {
            as: 'games',
            foreignKey: 'gameId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.gameWorks.belongsTo(app.model.projects, {
            as: 'projects',
            foreignKey: 'projectId',
            targetKey: 'id',
            constraints: false,
        });

        app.model.gameWorks.belongsTo(app.model.users, {
            as: 'users',
            foreignKey: 'userId',
            targetKey: 'id',
            constraints: false,
        });
    };

    return model;
};
