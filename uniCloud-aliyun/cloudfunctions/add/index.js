'use strict';
const db = uniCloud.database()
const {
	verifyInfo
} = require("wx-common");
const createTime = new Date().getTime()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'addBookInfo': {
			return addBookInfo(event.params)
		}
		case 'addTopic': {
			return addTopic(event.params)
		}
		case 'addVersion': {
			return addVersion(event.params)
		}
		case 'addLabel': {
			return addLabel(event.params)
		}
		case 'createSubject': {
			return createSubject(event.params)
		}
		case 'answerResult': {
			return answerResult(event.params)
		}
		case 'topicAnalysis': {
			return topicAnalysis(event.params)
		}
		default: {
			return
		}
	}
};
// 添加题目解析
async function topicAnalysis(event) {
	let userInfo = verifyInfo(event.token)
	if (userInfo.code) return userInfo
	const collection = db.collection('topic-analysis')
	delete event.token
	event.createTime = createTime
	/* 
	 * 帖子状态
	 * 0 未审核 1 正常显示 2 异常
	 */
	let params = {
		topicId: event.id,
		content: event.content,
		createTime: event.createTime,
		status: 0,
		createId: userInfo._id,
	}
	let res = await collection.add(params)
	return {
		code: 200,
		msg: "提交审核成功!",
		data: ''
	}
}

async function answerResult(event) {
	let userInfo = verifyInfo(event.token)
	if (userInfo.code) return userInfo
	const collection = db.collection('answerHistory')
	delete event.token
	event.answererId = userInfo._id
	event.createTime = createTime
	let res = await collection.add(event)
	return {
		code: 200,
		msg: "提交成功!",
		data: ''
	}
}

async function createSubject(event) {
	let {
		title,
		topic,
		number,
		limitTime,
		endTime,
	} = event
	// 验证参数
	if (topic.length <= 0) {
		return {
			code: 300,
			msg: "请选择相应的题目",
		}
	} else if (!title) {
		return {
			code: 300,
			msg: "请输入试卷标题"
		}
	}
	let userInfo = verifyInfo(event.token)
	if (userInfo.code) return userInfo
	const collection = db.collection('testPaper')
	let res = await collection.add({
		title,
		topic,
		number,
		limitTime,
		endTime,
		createTime,
		creatorId: userInfo._id,
		qrcode: '',
	})
	console.log('exam-------->', res);

	let qrcode = await uniCloud.callFunction({
		name: "public",
		data: {
			action: "qrcode",
			params: {
				path: "pages/topic/exam",
				scene: res.id,
				time: createTime,
			}
		}
	})
	console.log('qrcode-------->', qrcode);
	await collection.doc(res.id).update({
		qrcode: qrcode.result
	})

	return {
		code: 200,
		msg: "生成成功!",
		data: {
			shareImg: qrcode.result,
			id: res.id
		}
	}
}

async function addLabel(event) {
	let {
		name,
	} = event
	const collection = db.collection('labelList')
	let res = await collection.add({
		name,
		createTime,
	})
	return {
		code: 200,
		msg: '新增成功!',
	}
}

async function addVersion(event) {
	let {
		version,
		desc,
	} = event
	const collection = db.collection('version')
	let res = await collection.add({
		version,
		versionNum: version.replace(/./g, ""),
		desc,
		createTime,
	})
	return {
		code: 200,
		msg: '新增成功!',
	}
}

async function addTopic(event) {
	let {
		title,
		type,
		label,
		option,
		answer,
		level,
		creater,
	} = event
	const collection = db.collection('topicList')
	let res = await collection.add({
		title,
		type,
		label: label.split(','),
		option,
		answer,
		creater,
		level,
		createTime,
	})
	return {
		code: 200,
		msg: '新增成功!',
	}
}

async function addBookInfo(event) {
	let {
		cover,
		author,
		creater,
		title,
		type,
		origin,
	} = event
	const collection = db.collection('bookList')
	let res = await collection.add({
		cover,
		author,
		creater,
		title,
		type,
		origin,
		createTime,
		list: []
	})
	console.log(JSON.stringify(res))
	return {
		code: 200,
		msg: '新增成功!',
	}
}
