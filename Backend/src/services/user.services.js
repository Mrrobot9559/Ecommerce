const User = require("../models/user.model");

const findOne = (query, projection) => User.findOne(query, projection);

const createUser = (userData) => User.create(userData);

const findByIdAndUpdate = (id, update, options) =>
  User.findByIdAndUpdate(id, update, options);

  module.exports = {
  findOne,
  createUser,
  findByIdAndUpdate,
};
