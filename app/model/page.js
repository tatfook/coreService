/* eslint-disable no-magic-numbers */
'use strict';
module.exports = app => {
    const { BIGINT, INTEGER, STRING, TEXT } = app.Sequelize;
    // del
    const model = app.model.define(
        'pages',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                type: BIGINT,
            },

            siteId: {
                type: BIGINT,
            },

            url: {
                type: STRING(128),
                allowNull: false,
                unique: true,
            },

            folder: {
                type: STRING(128),
                allowNull: false,
            },

            hash: {
                type: STRING(64),
            },

            content: {
                type: TEXT('long'),
                // defaultValue: "",
            },

            keywords: {
                type: STRING,
            },

            title: {
                type: STRING(128),
            },

            description: {
                type: STRING(512),
            },

            visitors: {
                // 访客 id 列表  |1|2|3|
                type: TEXT,
                // defaultValue: "|",
            },

            visitorCount: {
                // 访问量
                type: INTEGER,
                defaultValue: 0,
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
        }
    );

    // model.sync({force:true}).then(() => {
    // console.log("create table successfully");
    // });

    model.getById = async function(id, userId) {
        const where = { id };

        if (userId) where.userId = userId;

        const data = await app.model.pages.findOne({ where });

        return data && data.get({ plain: true });
    };

    model.getByUrl = async function(url) {
        const data = await app.model.pages.findOne({ where: { url } });

        return data && data.get({ plain: true });
    };

    model.visitor = async function(pageId, userId) {
        const page = await this.getById(pageId);
        if (!page) return;

        page.visitorCount++;
        if (userId) {
            let visitors = page.visitors || '|';
            visitors = visitors.replace('|' + userId + '|', '|');
            visitors = '|' + userId + visitors;
            page.visitors = visitors;
        }

        await app.model.pages.update(page, {
            fields: [ 'visitorCount', 'visitors' ],
            where: { id: pageId },
        });

        return;
    };
    app.model.pages = model;
    return model;
};
