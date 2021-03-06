const md5 = require('blueimp-md5');
const { app, mock, assert } = require('egg-mock/bootstrap');

describe('机构用户', () => {
    before(async () => {});

    it('001 用户绑定 解绑', async () => {
        const user = await app.login();
        const token = user.token;

        // 创建机构
        const organ = await app.model.lessonOrganizations
            .create({
                name: 'org0000',
                count: 1,
                endDate: new Date('2200-01-01'),
            })
            .then(o => o.toJSON());

        // 创建班级
        let cls = await app.model.lessonOrganizationClasses
            .create({
                name: 'clss000',
                organizationId: organ.id,
                begin: new Date(),
                end: new Date().getTime() + 1000 * 60 * 60 * 24,
            })
            .then(o => o.toJSON());

        // 创建班级成员
        await app.model.lessonOrganizationClassMembers.create({
            organizationId: organ.id,
            memberId: user.id,
            roleId: 64,
            classId: 0,
        });

        // 修改机构过期时间
        const users = await app
            .httpRequest()
            .post('/api/v0/lessonOrganizationUsers/batch')
            .send({
                classId: cls.id,
                organizationId: organ.id,
                count: 3,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => res.body)
            .catch(e => console.log(e));
        assert(users.length == 3);

        // 修改绑定用户密码
        await app
            .httpRequest()
            .post('/api/v0/lessonOrganizationUsers/setpwd')
            .send({
                classId: cls.id,
                organizationId: organ.id,
                memberId: users[0].id,
                password: 'xiaoyao',
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => res.body)
            .catch(e => console.log(e));

        // 解绑用户
        await app
            .httpRequest()
            .post('/api/v0/lessonOrganizationUsers/unbind')
            .send({
                classId: cls.id,
                organizationId: organ.id,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => res.body)
            .catch(e => console.log(e));
    });
});
