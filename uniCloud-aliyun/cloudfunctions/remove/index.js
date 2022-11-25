'use strict';
const db = uniCloud.database()
const {
	verifyInfo
} = require("wx-common");
exports.main = async (event, context) => {
	switch (event.action) {
		case 'book': {
			return bookList(event.params)
		}
		case 'topic': {
			return topic(event.params)
		}
		case 'answerHistory': {
			return answerHistory(event.params)
		}
		case 'myExam': {
			return myExam(event.params)
		}
		default: {
			return
		}
	}
};

async function myExam(event) {
	let userInfo = verifyInfo(event.token)
	if (userInfo.code) return userInfo
	// 将删除的数据添加到临时库
	let data = await db.collection('testPaper').doc(event.id).get();
	data.data[0].db = 'testPaper'
	let data_res = data.data[0]
	if (userInfo._id != data_res.creatorId) {
		return {
			code: 400,
			msg: "删除失败！",
			data: '',
		}
	}
	await db.collection('trashCan').add(data_res)
	// 删除操作
	let res = await db.collection('testPaper').doc(event.id).remove();
	if (res.deleted === 1) {
		uniCloud.deleteFile({
			fileList: [data_res.qrcode]
		})
		return {
			code: 200,
			msg: "删除成功！",
			data: '',
		}
	} else {
		return {
			code: 400,
			msg: "删除失败！"
		}
	}
}

async function answerHistory(event) {
	let userInfo = verifyInfo(event.token)
	if (userInfo.code) return userInfo
	// 将删除的数据添加到临时库
	let data = await db.collection('answerHistory').doc(event.id).get();
	data.data[0].db = 'answerHistory'
	let data_res = data.data[0]
	if (userInfo._id != data_res.info.creatorId) {
		return {
			code: 400,
			msg: "删除失败！",
			data: '',
		}
	}
	await db.collection('trashCan').add(data_res)
	// 删除操作
	let res = await db.collection('answerHistory').doc(event.id).remove();
	if (res.deleted === 1) {
		return {
			code: 200,
			msg: "删除成功！",
			data: '',
		}
	} else {
		return {
			code: 400,
			msg: "删除失败！"
		}
	}
}

async function bookList(event) {
	let {
		_id
	} = event
	// 将删除的数据添加到临时库
	let data = await db.collection('bookList').doc(_id).get();
	data.data[0].db = 'topicList'
	let data_res = data.data[0]
	await db.collection('trashCan').add(data_res)
	// 删除操作
	let res = await db.collection('bookList').doc(_id).remove();
	if (res.deleted === 1) {
		return {
			code: 200,
			data: "删除成功！"
		}
	} else {
		return {
			code: 400,
			data: "删除失败！"
		}
	}
}

async function topic(event) {
	let {
		_id
	} = event
	// 将删除的数据添加到临时库
	let data = await db.collection('topicList').doc(_id).get();
	data.data[0].db = 'topicList'
	let data_res = data.data[0]
	await db.collection('trashCan').add(data_res)
	// 删除操作
	let res = await db.collection('topicList').doc(_id).remove();
	if (res.deleted === 1) {
		return {
			code: 200,
			data: "删除成功！"
		}
	} else {
		return {
			code: 400,
			data: "删除失败！"
		}
	}
}
