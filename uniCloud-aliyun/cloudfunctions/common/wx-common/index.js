const jwt = require("jsonwebtoken"); //webjsontoken
const appId = 'wx5d0911b9fbefb1bf'
const appSecret = '49c120f4657ca772411044f563fcd1ec'
const db = uniCloud.database()
//生成token
function getToken(userInfo) {
	// sign(加密数据，加密辅助，过期时间(单位/s))
	return jwt.sign({
		userInfo
	}, appSecret, {
		expiresIn: 60 * 60 * 24 * 30
	});
}

//解密token
function verifyToken(token) {
	return jwt.verify(token, appSecret, (err, decode) => {
		if (err) {
			if (err.name == 'TokenExpiredError') {
				return 'expired'
			}
		}

		return decode
	})
}

// 验证token
function verifyInfo(token) {
	if (!token) {
		return {
			code: 401,
			msg: "请先授权登录用户"
		}
	}
	let userInfo = verifyToken(token)
	if (userInfo == 'expired') {
		return {
			code: 402,
			msg: "授权信息过期"
		}
	}
	if (!userInfo) {
		return {
			code: 401,
			msg: "请先授权登录用户"
		}
	}
	return userInfo.userInfo
}

module.exports = {
	getToken,
	verifyToken,
	appId,
	appSecret,
	verifyInfo
}
