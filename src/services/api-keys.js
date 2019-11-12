const MongoConnect = require('../lib/mongo');

class ApiKeysServices {
  constructor() {
    this.collection = 'api-keys';
    this.mongoDB = new MongoConnect();
  }

  async getApiKey({ token }) {
    const [apiKey] = await this.mongoDB.getAll(this.collection, { token });
    return apiKey;
  }
}

module.exports = ApiKeysServices;
