'use strict';

const _ = require('lodash');
const Service = require('egg').Service;

class User extends Service {
  async setToken(userId, token, clear = false) {
    const data = await this.app.model.userdatas.get(userId);

    data.tokens = data.tokens || [];
    if (clear) data.tokens = [];

    data.tokens.splice(0, 0, token);
    // 只支持10个token
    if (data.tokens.length > 20) data.tokens.pop();
    await this.app.model.userdatas.set(userId, data);
  }

  async validateToken(userId, token) {
    const data = await this.app.model.userdatas.get(userId);
    const tokens = data.tokens || [];
    // console.log(userId, data, token);
    return !!_.find(tokens, o => o === token);
  }
}

module.exports = User;
