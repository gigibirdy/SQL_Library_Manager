'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "title"',
        },
        notEmpty: {
          msg: 'Please provide a value for "title"',
        },
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please provide a value for "author"',
        },
        notEmpty: {
          msg: 'Please provide a value for "author"',
        },
      },
    },
    genre: DataTypes.STRING,
    year: {
      type: DataTypes.INTEGER,
      validate: {
        is: {
          args: ["^[1-2][0-9]{3}$"],
          msg: 'Not valid'
        }
      }
    }
  }, {});
  Book.associate = function(models) {
    // associations can be defined here

  };
  return Book;
};
