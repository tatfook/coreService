'use strict';

const tableName = 'userinfos';
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

                name: {
                    type: STRING(48),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                qq: {
                    type: STRING(24),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                birthdate: {
                    type: DATE,
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                },

                school: {
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

                email: {
                    type: STRING(64),
                    allowNull: true,
                    primaryKey: false,
                    autoIncrement: false,
                    defaultValue: '',
                },

                kid: {
                    type: BIGINT,
                    allowNull: true,
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
