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
	let result = res.data[0]
	// 生成token
	let token = getToken(result)
	if (result) {
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
			code: 401,
			msg: '未授权',
			data: {
				userInfo: '',
				token: ''
			}
		}
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
		openId
	}
	
	//将用户信息返回前端
	let data = {
		nickName,
		gender,
		city,
		province,
		country,
		avatarUrl
	}
	
	// 判断是否存在用户
	const hasIn = await collection.where({
		openId: openId,
	}).get()
	console.log("hasIn------",hasIn)
	if (hasIn.data.length!=0) {
		let token = getToken(userData)
		return {
			code: 200,
			msg: '登录成功',
			data: {
				userInfo: data,
				token: token
			}
		}
	}
	
	// 生成token
	let token = getToken(userData)
	
	// 往user表添加用户信息
	const resData = await db.collection("userInfo").add(userData)
	console.log("resData",resData)
	return {
		code: 200,
		msg: '登录成功',
		data: {
			userInfo: data,
			token: token
		}
	}

}
