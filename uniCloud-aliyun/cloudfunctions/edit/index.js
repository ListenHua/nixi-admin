'use strict';
const db = uniCloud.database()
const {
	verifyToken
} = require("wx-common");
exports.main = async (event, context) => {
	switch (event.action) {
		case 'editBookInfo': {
			return editBookInfo(event.params)
		}
		case 'addBookContent': {
			return addBookContent(event.params)
		}
		case 'editAbout': {
			return editAbout(event.params)
		}
		case 'editVersion': {
			return editVersion(event.params)
		}
		case 'editTopic': {
			return editTopic(event.params)
		}
		case 'updateBackground': {
			return updateBackground(event.params)
		}
		default: {
			return
		}
	}
}

async function updateBackground(event) {
	let {
		background
	} = event
	let userInfo = verifyToken(event.token)
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
	await db.collection("userInfo").doc(userInfo.userInfo._id).update({
		background
	})
	return {
		code: 200,
		message: '更新成功!',
	}
}

async function editTopic(event) {
	let {
		_id,
		title,
		type,
		label,
		option,
		answer,
		level,
	} = event
	const collection = db.collection('topicList')
	let res = await collection.doc(_id).update({
		title,
		type,
		label: label.split(','),
		option,
		answer,
		level,
	})
	return {
		code: 200,
		message: '修改成功!',
	}
}

async function editVersion(event) {
	let {
		_id,
		version,
		desc,
	} = event
	const collection = db.collection('version')
	let res = await collection.doc(_id).update({
		version,
		versionNum: version.replace(/./g, ""),
		desc,
	})
	return {
		code: 200,
		message: '修改成功!',
	}
}

async function editAbout(event) {
	let {
		content,
	} = event
	const collection = db.collection('about')
	let res = await collection.doc("62c93508f6d14000017f9e6d").update({
		content,
	})
	console.log("res---====", res)
	return {
		code: 200,
		message: '修改成功!',
	}
}

async function editBookInfo(event) {
	let {
		_id,
		id,
		cover,
		author,
		title
	} = event
	const collection = db.collection('bookList')
	let res = await collection.doc(_id).update({
		id,
		cover,
		author,
		title,
	})
	return {
		code: 200,
		message: '修改成功!',
	}
}

async function addBookContent(event) {
	let {
		_id,
		list
	} = event
	const collection = db.collection('bookList')
	let res = await collection.doc(_id).update({
		list,
	})
	return {
		code: 200,
		message: '新增成功!',
	}
}
