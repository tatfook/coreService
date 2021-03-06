'use strict';

const tableName = 'gameWorks';
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
                attribute: 'projectId',
                order: 'ASC',
            },
        ],
        unique: true,
        name: 'game_works_project_id',
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

                gameId: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                projectId: {
                    type: BIGINT,
                    allowNull: false,
                    primaryKey: false,
                    autoIncrement: false,
                },

                worksName: {
                    type: STRING(255),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                worksSubject: {
                    type: STRING(255),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                worksLogo: {
                    type: STRING(512),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                worksDescription: {
                    type: STRING(2048),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                worksRate: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                worksRateCount: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                reward: {
                    type: STRING(255),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
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

                win: {
                    type: INTEGER,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '0',
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
