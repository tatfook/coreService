
const joi = require("joi");
const _ = require("lodash");
const moment = require("moment");
const axios = require("axios");

const Controller = require("../core/controller.js");
const {
	DISCOUNT_STATE_UNUSE,
	DISCOUNT_STATE_USED,
	DISCOUNT_STATE_EXPIRED,
} = require("../core/consts.js");

const Discount = class extends Controller {
	get modelName() {
		return "discounts";
	}

	async create() {
		return this.success("OK");
	}
	async destroy() {
		return this.success("OK");
	}
	async update() {
		return this.success("OK");
	}
}

module.exports = Discount;
