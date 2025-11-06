const dbLocal = require('db-local');
const path = require('path');
const aliens = require('./aliens');

const { Schema } = new dbLocal({ path: path.join(__dirname) });

const Users = Schema('users', {
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

function findUserByPhone(phone) {
  const user = Users.findOne({ phone });
  return user ? { ...user } : null;
}

async function addUser(user) {
  const newUser = Users.create(user);
  newUser.save();
  return { ...newUser };
}

module.exports = {
  aliens,
  Users,
  findUserByPhone,
  addUser
};
