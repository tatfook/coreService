'use strict';

module.exports = app => {
  const {
    BIGINT,
    JSON,
    DATE,
  } = app.Sequelize;

  const model = app.model.define('lessonOrganizationPackages', {
    id: {
      type: BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    organizationId: {
      type: BIGINT,
      defaultValue: 0,
    },

    classId: {
      type: BIGINT,
      defaultValue: 0,
    },

    packageId: {
      type: BIGINT,
      defaultValue: 0,
    },

    lessons: {
      type: JSON,
    },

    extra: {
      type: JSON,
      defaultValue: {},
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

    indexes: [
      {
        unique: true,
        fields: [ 'organizationId', 'classId', 'packageId' ],
      },
    ],
  });

  // model.sync({force:true});

  app.model.lessonOrganizationPackages = model;

  return model;
};

