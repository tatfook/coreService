/* eslint-disable no-magic-numbers */
'use strict';

const _ = require('lodash');
const moment = require('moment');
const qrcode = require('qrcode');

const Controller = require('../core/controller.js');
const {
    ORDER_STATE_PAYING,
    ORDER_STATE_CHARGE_SUCCESS,
    ORDER_STATE_CHARGE_FAILED,

    TRADE_TYPE_DEFAULT,
} = require('../core/consts.js');

const generateQR = async text => {
    try {
        return await qrcode.toDataURL(text);
    } catch (e) {
        return;
    }
};

// 订单设计仅为解决充值功能

const Order = class extends Controller {
    get modelName() {
        return 'orders';
    }
    async create() {
        const { userId } = this.authenticated();

        const params = await this.ctx.validate(
            this.app.validator.order.create,
            this.getParams()
        );

        let order = await this.model.orders
            .create({ userId })
            .then(o => o && o.toJSON());

        const channel = params.channel;
        const config = this.app.config.self;
        const datetime = moment().format('YYYYMMDDHHmmss');
        const order_no = datetime + 'order' + order.id + _.random(10, 99);
        const chargeData = {
            order_no,
            app: { id: config.pingpp.appId },
            channel: params.channel,
            amount: params.amount * 100,
            client_ip:
                this.ctx.request.headers['x-real-ip'] || this.ctx.request.ip,
            currency: 'cny',
            subject: params.subject || '用户充值',
            body: params.body || '用户充值',
        };

        if (channel === 'wx_pub_qr') {
            chargeData.extra = {
                product_id: 'goodsId' + (params.goodsId || 0),
            };
        }

        const charge = await this.ctx.service.pay
            .charge(chargeData)
            .catch(e => this.logger.error(e));
        if (!charge) return this.throw(500, '提交pingpp充值请求失败');
        const payQRUrl = charge.credential[params.channel];
        if (!payQRUrl) {
            return this.throw(500, '提交pingpp充值请求, 获取二维码失败');
        }

        const QRUrl = 'http://qr.topscan.com/api.php?m=0&text=' + payQRUrl;
        const QR = await generateQR(payQRUrl);

        order = {
            ...order,
            userId,
            orderNo: order_no,
            amount: params.amount,
            pingppId: charge.id,
            state: ORDER_STATE_PAYING,
            channel: params.channel,
        };

        await this.model.orders.update(order, { where: { id: order.id } });

        return this.success({
            ...order,
            payQRUrl,
            QRUrl,
            QR,
            orderNo: undefined,
        });
    }

    // pingpp充值回调接口  只处理充值逻辑
    async charge() {
        const params = this.getParams();
        const signature = this.ctx.headers['x-pingplusplus-signature'];
        const body = JSON.stringify(params);

        this.logger.info('-----------------pingpp callback-----------------');
        if (!this.ctx.service.pay.verifySignature(body, signature)) {
            await this.model.logs.create({
                text: '签名验证失败',
                body,
                signature,
            });
            return this.throw(400, '签名验证失败');
        }

        const orderNo =
            params.type === 'charge.succeeded'
                ? params.data.object.order_no
                : params.data.object.charge_order_no;

        const order = await this.model.orders
            .findOne({ where: { orderNo } })
            .then(o => o && o.toJSON());
        if (!order) {
            await this.model.logs.create({ text: '交易记录不存在' });
            return this.throw(400, '交易记录不存在');
        }

        if (
            order.state === ORDER_STATE_CHARGE_FAILED ||
            order.state === ORDER_STATE_CHARGE_SUCCESS
        ) {
            return this.throw(400, '订单已过期');
        }

        let state = ORDER_STATE_CHARGE_FAILED,
            description = '充值失败';
        if (params.type === 'charge.succeeded') {
            state = ORDER_STATE_CHARGE_SUCCESS;
            description = '充值成功';
        } else {
            await this.model.logs.create({ text: '参数错误' });
            await this.model.orders.update(
                { state, description },
                { where: { id: order.id } }
            );
            return this.throw(400, '参数错误');
        }

        // 获取用户账户信息
        await this.model.accounts.getByUserId(order.userId);

        // 奖励优惠券
        const discount = this.model.discounts.generateDiscount();
        discount.userId = order.userId;
        await this.model.discounts.create(discount);

        const extra = order.extra || {};
        extra.discount = discount;

        // 更新订单状态
        await this.model.orders.update(
            { state, description, extra },
            { where: { id: order.id } }
        );

        // 增加用户余额
        await this.model.accounts.increment(
            { rmb: order.amount },
            { where: { userId: order.userId } }
        );

        // 增加充值交易明细
        await this.model.trades.create({
            userId: order.userId,
            type: TRADE_TYPE_DEFAULT,
            subject: order.channel === 'wx_pub_qr' ? '微信充值' : '支付宝充值',
            rmb: order.amount,
        });

        order.state = state;
        order.description = description;

        // //
        // if (params.type == "charge.succeeded") {
        // //await this.chargeCallback(order);
        // //} else if (params.type == "refund.succeeded") {
        // //await this.refundCallback(order);
        // } else {
        // }

        return this.success('OK');
    }

    // async refund(trade) {
    // const refund = await this.ctx.service.pay.refund(trade).catch(e => console.log(e));
    // if (refund) {
    // trade.refundId = refund.id;
    // trade.state = TRADE_STATE_REFUNDING;
    // trade.description = "退款进行中";
    // } else {
    // trade.state = TRADE_STATE_REFUND_FAILED;
    // trade.description = "提交pingpp退款请求失败";
    // }
    // await this.model.trades.update(trade, {where:{id:trade.id}});
    // return;
    // }
};

module.exports = Order;
