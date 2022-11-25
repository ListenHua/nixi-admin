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
	console.log('qrcode---event----->',event);
	let timestamp = event.time
	const collection = db.collection('serverCache')
	let serverAccess = (await collection.where({
		type: "accessToken"
	}).get()).data[0]
	let accessToken;
	if (serverAccess.time - 10000 < timestamp) {
		let access = await uniCloud.httpclient.request(
			`https://api.weixin.qq.com/cgi-bin/token?appid=${appId}&secret=${appSecret}&grant_type=client_credential`, {
				dataType: "json"
			}
		)
		accessToken = access.data.access_token
		collection.doc("62e34b005c1f6c00015e1e42").update({
			time: timestamp,
			accessToken,
		})
	} else {
		accessToken = serverAccess.accessToken
	}
	let params = {
		"page": event.path,
		"scene": event.scene,
		"check_path": false,
		"env_version": "release"
		// "env_version": "trial"
	}
	const wxdata = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`, {
			method: "POST",
			data: JSON.stringify(params),
		}
	)
	let image = await uniCloud.uploadFile({
		cloudPath: 'qrcode' + timestamp + '.jpg',
		fileContent: wxdata.data
	})
	return image.fileID
}
