/* eslint-disable no-magic-numbers */
'use strict';
const { ENTITY_TYPE_GROUP } = require('../core/consts.js');

module.exports = app => {
    const { BIGINT, STRING } = app.Sequelize;

    const model = app.model.define(
        'groups',
        {
            id: {
                type: BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },

            userId: {
                type: BIGINT,
                allowNull: false,
            },

            groupname: {
                type: STRING(48),
                allowNull: false,
            },

            description: {
                type: STRING(128),
            },
        },
        {
            underscored: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_bin',
            indexes: [
                {
                    unique: true,
                    fields: ['userId', 'groupname'],
                },
            ],
        }
    );

    model.getById = async function(id, userId) {
        const where = { id };

        if (userId) where.userId = userId;

        const data = await app.model.groups.findOne({ where });

        return data && data.get({ plain: true });
    };

    model.deleteById = async function(id, userId) {
        const group = await this.getById(id, userId);
        if (!group) return;

        await app.model.groups.destroy({ where: { id } });
        await app.model.members.destroy({
            where: { objectId: id, objectType: ENTITY_TYPE_GROUP },
        });
        await app.model.siteGroups.destroy({ where: { groupId: id } });

        return;
    };

    model.getGroupMembers = async function(userId, groupId) {
        return await app.model.members.getObjectMembers(
            groupId,
            ENTITY_TYPE_GROUP
        );
    };

    app.model.groups = model;
    return model;
};
