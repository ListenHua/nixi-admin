'use strict';
const {
	getAccessToken,
	appId,
	appSecret
} = require("wx-common");
const db = uniCloud.database()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'qrcode': {
			return qrcode(event.params)
		}
		default: {
			return
		}
	}
};

async function qrcode(event) {
	let access = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/cgi-bin/token?appid=${appId}&secret=${appSecret}&grant_type=client_credential`, {
			dataType: "json"
		}
	)
	let accessToken = access.data.access_token
	const wxdata = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode`, {
			method:"POST",
			data:{
				path:"?uid=admin",
				access_token:accessToken
			},
			dataType: "json"
		}
	)
	console.log('wxdata',wxdata);
}
