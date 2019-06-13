'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const initData = require('../data.js');

describe('/users', () => {
  before(async () => {
    await initData(app);
  });

  it('0001 修改密码 token失效测试', async () => {
    app.config.self.env = 'local';
    const apiUrlPrefix = '/api/v0/';

    // 登录
    const token1 = await app.httpRequest().post(`${apiUrlPrefix}users/login`).send({ username: 'user0000', password: '123456' })
      .then(res => res.body.token);
    const token2 = await app.httpRequest().post(`${apiUrlPrefix}users/login`).send({ username: 'user0000', password: '123456' })
      .then(res => res.body.token);
    assert(token1);

    // 获取认证用户信息
    const profile = await app.httpRequest().get(`${apiUrlPrefix}users/profile`).set('Authorization', `Bearer ${token1}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(profile.username === 'user0000');

    // 修改密码 废弃其它token
    await app.httpRequest().put(`${apiUrlPrefix}users/pwd`).send({ password: '123456', oldpassword: '123456' })
      .set('Authorization', `Bearer ${token2}`)
      .expect(200);

    // 废弃token验证
    await app.httpRequest().get(`${apiUrlPrefix}users/profile`).set('Authorization', `Bearer ${token1}`)
      .expect(res => assert(res.statusCode === 401));
    app.config.self.env = 'unittest';
  });


  it('0002 注册 登录 获取指定用户 用户profile token信息获取 用户信息更新 用户基本信息更新 用户活跃度 用户详情 用户余额', async () => {
    let user = await app.httpRequest().post('/api/v0/users/register').send({ username: 'xiaoyao', password: '123456' })
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(user);

    user = await app.httpRequest().post('/api/v0/users/login').send({ username: 'xiaoyao', password: '123456' })
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(user);
    assert(user.token);
    const token = user.token;


    // 获取指定用户
    user = await app.httpRequest().get(`/api/v0/users/${user.id}`).set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => res.body);
    assert.equal(user.sex, 'M');

    // 基本信息更新
    await app.httpRequest().post('/api/v0/users/info').send({ name: 'xiaoyao' })
      .set('Authorization', `Bearer ${token}`)
      .expect(res => res.statusCode === 200)
      .then(res => res.body);

    // 用户profile
    user = await app.httpRequest().get('/api/v0/users/profile').set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(user.info.qq === '765485868');
    assert(user.info.name === 'xiaoyao');

    // token信息获取
    const tokeninfo = await app.httpRequest().get('/api/v0/users/token/info').set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(tokeninfo && tokeninfo.username === 'xiaoyao');

    // 更新用户活跃度
    await app.httpRequest().post(`/api/v0/users/${user.id}/contributions`).send({ count: 2 })
      .set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    // 用户详情
    user = await app.httpRequest().get(`/api/v0/users/${user.id}/detail`).set('Authorization', `Bearer ${token}`)
      .expect(200)
      .then(res => res.body);

    assert(user.rank);
    assert(user.contributions);
    // console.log(user);

    const account = await app.httpRequest().get('/api/v0/users/account').set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(account);
  });

  it('0003 手机验证', async () => {
    const token = await app.httpRequest().post('/api/v0/users/login').send({ username: 'user001', password: '123456' })
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body.token);
    console.log(token);
    assert(token);
    const cellphone = '18702759796';
    let data = await app.httpRequest().get('/api/v0/users/cellphone_captcha?cellphone=' + cellphone).expect(res => assert(res.statusCode === 200));

    const cache = await app.model.caches.get(cellphone) || {};
    assert.ok(cache.captcha);

    await app.httpRequest().post('/api/v0/users/cellphone_captcha').send({ cellphone, captcha: cache.captcha, isBind: true })
      .set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200));

    data = await app.httpRequest().get('/api/v0/users/profile').set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);

    assert.equal(data.cellphone, cellphone);

    // 解绑
    await app.httpRequest().post('/api/v0/users/cellphone_captcha').send({ cellphone, captcha: cache.captcha, isBind: false })
      .set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200));

    data = await app.httpRequest().get('/api/v0/users/profile').set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);

    assert.ok(!data.cellphone);
  });

  it('0004 邮箱验证', async () => {
    const token = await app.httpRequest().post('/api/v0/users/login').send({ username: 'user001', password: '123456' })
      .then(res => res.body.token);
    const email = '765485868@qq.com';
    let data = await app.httpRequest().get('/api/v0/users/email_captcha?email=' + email).expect(res => assert(res.statusCode === 200));

    const cache = await app.model.caches.get(email) || {};
    assert.ok(cache.captcha);

    await app.httpRequest().post('/api/v0/users/email_captcha').send({ email, captcha: cache.captcha, isBind: true })
      .set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200));

    data = await app.httpRequest().get('/api/v0/users/profile').set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);

    assert.equal(data.email, email);

    // 解绑
    await app.httpRequest().post('/api/v0/users/email_captcha').send({ email, captcha: cache.captcha, isBind: false })
      .set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200));

    data = await app.httpRequest().get('/api/v0/users/profile').set('Authorization', `Bearer ${token}`)
      .expect(res => assert(res.statusCode === 200))
      .then(res => res.body);

    assert.ok(!data.email);
  });

  it('0005 用户列表 用户搜索 用户排行榜', async () => {
    const users = await app.model.users.findAll();
    let list = await app.httpRequest().get('/api/v0/users').expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(list.length === users.length);

    list = await app.httpRequest().post('/api/v0/users/search').expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(list.count === users.length);

    list = await app.httpRequest().get('/api/v0/users/rank').expect(res => assert(res.statusCode === 200))
      .then(res => res.body);
    assert(list.length === await app.model.userRanks.count());
  });

  // it("0005 register with cellphone oauthToken", async ()=> {
  // const cellphone="18702759796";
  // let data = await app.httpRequest().get("/api/v0/users/cellphone_captcha?cellphone=" + cellphone).expect(res => assert(res.statusCode == 200));
  // const cache = await app.model.caches.get(cellphone) || {};
  // console.log(cache);
  // assert.ok(cache.captcha);

  // let user = await app.httpRequest().post("/api/v0/users/register").send({
  // username:"wxatest",
  // password:"wuxiangan",
  // cellphone,
  // captcha: cache.captcha,
  // oauthToken: "oauth_token",
  // }).expect(res => assert(res.statusCode == 200)).then(res => res.body);
  // assert.ok(user.token);
  // assert.equal(user.cellphone, cellphone);

  // const oauthUser = await app.model.oauthUsers.findOne({where:{token:"oauth_token"}});
  // assert.equal(oauthUser.userId, user.id);
  // });

});
