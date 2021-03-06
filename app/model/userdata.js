'use strict';
module.exports = app => {
    const { BIGINT, JSON } = app.Sequelize;
    // TODO 存储的用户的token信息
    const model = app.model.define(
        'userdatas',
        {
            userId: {
                type: BIGINT,
                primaryKey: true,
            },

            data: {
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

    model.get = async function(userId) {
        const data =
            (await app.model.userdatas
                .findOne({ where: { userId } })
                .then(o => o && o.toJSON())) || {};

        return data.data || {};
    };

    model.set = async function(userId, data) {
        return await app.model.userdatas.upsert({ userId, data });
    };

    app.model.userdatas = model;
    return model;
};
