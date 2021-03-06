const md5 = require('blueimp-md5');
const { app, mock, assert } = require('egg-mock/bootstrap');

describe('机构激活码', () => {
    before(async () => {});

    it('001 机构学生添加接口测试', async () => {
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

        // 添加为管理员
        await app.model.lessonOrganizationClassMembers.create({
            organizationId: organ.id,
            memberId: user.id,
            roleId: 64,
            classId: 0,
        });

        // 测试生成激活码
        const data = await app
            .httpRequest()
            .post('/api/v0/lessonOrganizationActivateCodes')
            .send({
                organizationId: organ.id,
                count: 20,
                classId: cls.id,
                names: ['tset1', 'test2', 'test3'],
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => res.body)
            .catch(e => console.log(e));
        //console.log(data);

        // 测试获取激活码
        const list = await app
            .httpRequest()
            .get(
                '/api/v0/lessonOrganizationActivateCodes?organizationId=' +
                    organ.id
            )
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => res.body)
            .catch(e => console.log(e));

        // 使用激活码
        const member = await app
            .httpRequest()
            .post('/api/v0/lessonOrganizationActivateCodes/activate')
            .send({
                key: list.rows[0].key,
                realname: 'test',
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(res => res.body)
            .catch(e => console.log(e));

        console.log(member);
    });
});
