'use strict';

const tableName = 'userRanks';
const indexes = [
    {
        primary: true,
        fields: [
            {
                attribute: 'id',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'PRIMARY',
    },
    {
        primary: false,
        fields: [
            {
                attribute: 'userId',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'userId',
    },
];

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const {
            BIGINT,
            STRING,
            TEXT,
            BOOLEAN,
            INTEGER,
            DECIMAL,
            FLOAT,
            DOUBLE,
            REAL,
            DATE,
            JSON,
        } = Sequelize;
        await queryInterface.createTable(
            tableName,
            {
                id: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },

                userId: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                project: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                site: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                world: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                follow: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                fans: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                active: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
                },

                extra: {
                    type: JSON,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                createdAt: {
                    type: DATE,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                updatedAt: {
                    type: DATE,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },
            },
            {
                underscored: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_bin',
            }
        );

        for (let i = 0; i < indexes.length; i++) {
            const index = indexes[i];
            if (index.primary) continue;
            await queryInterface.addIndex(tableName, index);
        }

        return;
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.dropTable(tableName);
    },
};
