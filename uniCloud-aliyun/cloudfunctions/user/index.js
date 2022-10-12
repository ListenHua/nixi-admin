// 'use strict';
const {
	appId,
	appSecret,
	getToken,
	verifyToken
} = require("wx-common");
const db = uniCloud.database()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'login': {
			return login(event.params)
		}
		case 'authUserInfo': {
			return authUserInfo(event.params)
		}
		default: {
			return
		}
	}
}

async function login(event) {
	const wxdata = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${event.code}&grant_type=authorization_code`, {
			dataType: "json"
		}
	)
	let openId = wxdata.data.openid;
	//获取user表
	const collection = db.collection('userInfo');
	const res = await collection.where({
		openId: openId,
	}).get()
	if (res.data.length > 0) {
		let result = res.data[0]
		if (result.nickName && result.avatarUrl) {
			delete result.openId
			// 生成token
			let token = getToken(result)
			return {
				code: 200,
				msg: '登录成功',
				data: {
					userInfo: result,
					token: token
				}
			}
		} else {
			return {
				code: 200,
				msg: '登录成功',
			}
		}
	}

	// 新增并返回用户信息
	let userData = {
		nickName: "",
		gender: 0,
		city: '',
		province: '',
		country: '',
		avatarUrl: '',
		openId,
		background: '',
		role: 0,
		level: 0,
	}
	await db.collection("userInfo").add(userData)
	return {
		code: 200,
		msg: '新增用户成功',
	}
}

async function authUserInfo(event) {
	const {
		code,
		nickName,
		gender,
		city,
		province,
		country,
		avatarUrl
	} = event;
	console.log(code)
	//获取openid
	const res = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`, {
			dataType: "json"
		}
	)
	console.log(res)
	let openId = res.data.openid;
	// 判断是否获取到openId
	if (!openId) {
		return {
			code: 400,
			msg: '未获取到openId',
			data: ''
		}
	}
	//获取user表
	const collection = db.collection('userInfo');

	// 新增并返回用户信息
	let userData = {
		nickName,
		gender,
		city,
		province,
		country,
		avatarUrl,
		openId,
		background: '',
		role: 0,
		level: 0,
	}

	// 判断是否存在用户
	const userInfo = await collection.where({
		openId: openId,
	}).get()
	if (userInfo.data.length != 0) {
		let result = userInfo.data[0]
		if (result.nickName && result.avatarUrl) {
			let token = getToken(result)
			delete result.openId
			return {
				code: 200,
				msg: '登录成功',
				data: {
					userInfo: result,
					token: token
				}
			}
		} else {
			// 生成token
			let token = getToken(userData)
			// 往user表添加用户信息
			const resData = await db.collection("userInfo").doc(result._id).update(userData)
			delete userData.openId
			return {
				code: 200,
				msg: '登录成功',
				data: {
					userInfo: userData,
					token: token
				}
			}
		}
	}

	// 生成token
	let token = getToken(userData)
	// 往user表添加用户信息
	const resData = await db.collection("userInfo").add(userData)
	delete userData.openId
	return {
		code: 200,
		msg: '登录成功',
		data: {
			userInfo: userData,
			token: token
		}
	}

}
