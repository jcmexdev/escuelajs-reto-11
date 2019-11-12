const MongoConnect = require('../lib/mongo');
const bcrypt = require('bcryptjs');

class UserService {
  constructor() {
    this.collection = 'users';
    this.DB = new MongoConnect();
  }

  async getUser({ email }) {
    const [user] = await this.DB.getAll(this.collection, { email });
    return user;
  }

  async createUser({ user }) {
    const { name, email, password } = user;
    const passwordEncrypted = await bcrypt.hash(password, 12);
    const createdId = await this.DB.create(this.collection, {
      name,
      email,
      password: passwordEncrypted
    });
    return createdId;
  }
}

module.exports = UserService;
