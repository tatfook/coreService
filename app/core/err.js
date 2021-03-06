/* eslint-disable no-magic-numbers */
'use strict';
const errs = {};
class Err {
    constructor(code, message, data) {
        this.code = code;
        this.message = message;
        this.data = data;

        errs[code] = this;
    }

    static getByCode(code) {
        return errs[code];
    }
}

new Err(-1, '未知错误');
new Err(0, '服务器繁忙,请稍后重试...');
new Err(1, '用户名或密码错误');
new Err(2, '用户名不合法');
new Err(3, '用户已存在');
new Err(4, '验证码过期');
new Err(5, '验证码错误');
new Err(6, '创建git用户失败');
new Err(7, '无权限操作');
new Err(8, '内容不合法,包含敏感词');
new Err(9, '创建world失败');
new Err(10, '未绑定用户');
new Err(11, '密码错误');
new Err(12, '用户不存在');
new Err(13, '余额不足');
new Err(14, '该账号不可用');
new Err(15, '无效激活码');
new Err(16, '激活码被使用');
new Err(17, '创建世界超过限制');
new Err(18, '删除world失败');
new Err(19, '短信验证码发送过频繁');
new Err(20, '短信验证码超过当日限制(5次)');
new Err(21, '该账号已绑定');
module.exports = Err;
