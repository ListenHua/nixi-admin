'use strict';
const db = uniCloud.database()
const {
	verifyInfo
} = require("wx-common");
exports.main = async (event, context) => {
	switch (event.action) {
		case 'systemData': {
			return systemData(event.params)
		}
		case 'getBookList': {
			return getBookList(event.params)
		}
		case 'getBookContent': {
			return getBookContent(event.params)
		}
		case 'getTopicList': {
			return getTopicList(event.params)
		}
		case 'getTopicInfo': {
			return getTopicInfo(event.params)
		}
		case 'getVersion': {
			return getVersion(event.params)
		}
		case 'getAbout': {
			return getAbout(event.params)
		}
		case 'getLabelList': {
			return getLabelList(event.params)
		}
		case 'getExamDetail': {
			return getExamDetail(event.params)
		}
		case 'topicAnalysis': {
			return topicAnalysis(event.params)
		}
		case 'getExamReply': {
			return getExamReply(event.params)
		}
		case 'getReplyDetail': {
			return getReplyDetail(event.params)
		}
		case 'myCreateExam': {
			return myCreateExam(event.params)
		}
		default: {
			return
		}
	}
}

// 获取我创建的考卷
async function myCreateExam(event) {
	let cmd = db.command
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	let userInfo = verifyInfo(event.token)
	if (userInfo.code) return userInfo
	const collection = db.collection('testPaper')
	delete event.token
	let key = {
		creatorId: cmd.eq(userInfo._id)
	}
	let res = await collection.where(key).skip(start).limit(limit).orderBy('createTime', 'desc').get()
	let total = await collection.where(key).count()
	let result = res.data
	for (let i in result) {
		let user = await db.collection('userInfo').doc(result[i].creatorId).get()
		result[i].creator = user.data[0]
	}
	console.log('userInfo----->', result)
	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

// 获取考卷详情
async function getReplyDetail(event) {
	let userInfo = verifyInfo(event.token)
	let {
		id
	} = event
	const history = db.collection('answerHistory')
	let res = await history.doc(id).get()
	if (res.data.length <= 0) {
		return {
			code: 300,
			msg: "找不到该试卷",
		}
	}
	let result = res.data[0]
	console.log('answerHistory', result);
	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

// 获取收到的考卷
async function getExamReply(event) {
	let cmd = db.command
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	let userInfo = verifyInfo(event.token)
	if (userInfo.code) return userInfo
	const collection = db.collection('answerHistory')
	delete event.token
	let key = {
		info: {
			creator: {
				_id: cmd.eq(userInfo._id)
			}
		}
	}
	let res = await collection.where(key).skip(start).limit(limit).orderBy('createTime', 'desc').get()
	let total = await collection.where(key).count()
	let result = res.data
	for (let i in result) {
		let user = await db.collection('userInfo').doc(result[i].answererId).get()
		result[i].answerer = user.data[0]
	}
	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

async function systemData(event) {
	let cmd = db.command
	let key = {
		type: cmd.eq(event.type)
	}
	const collection = db.collection('system-data')
	let res = await collection.where(key).get()
	let result = res.data[0]
	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

async function topicAnalysis(event) {
	let cmd = db.command
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let key = {
		id: cmd.eq(event.id),
		status: cmd.eq(1)
	}
	let start = page * limit
	const collection = db.collection('topic-analysis')
	let res;
	let total = await collection.where(key).count()
	res = await collection.where(key).skip(start).limit(limit).get()
	let result = res.data
	for (let i in result) {
		let user = await db.collection('userInfo').doc(result[i].createId).get()
		result[i].author = user.data[0]
	}
	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

async function getExamDetail(event) {
	let {
		id
	} = event
	const exam = db.collection('testPaper')
	let res = await exam.doc(id).get()
	console.log(res);
	if (res.data.length <= 0) {
		return {
			code: 300,
			msg: "找不到该试卷",
		}
	}
	let result = res.data[0]
	delete result.token
	let topic;
	await getTopicList({
		topic: result.topic
	}).then(data => {
		topic = data.data
	})
	return {
		code: 200,
		msg: "请求成功",
		data: result,
		topic,
	}
}

async function getLabelList(event) {
	const collection = db.collection('labelList')
	let res = await collection.get()
	let result = res.data

	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

async function getAbout(event) {
	const collection = db.collection('about')
	let res = await collection.get()
	let result = res.data[0].content

	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

async function getVersion(event) {
	const collection = db.collection('version')
	let res = await collection.get()
	let result = res.data

	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

async function getTopicInfo(event) {
	let {
		id
	} = event
	const exam = db.collection('topicList')
	let res = await exam.doc(id).get()
	if (res.data.length == 0) {
		return {
			code: 400,
			msg: "找不到该试题",
		}
	}
	let result = res.data[0]
	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

async function getTopicList(event) {
	console.log(event);
	let cmd = db.command
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let key = {}
	if (event.title) {
		key.title = new RegExp(event.title)
	}
	if (event.level || event.level === 0) {
		key.level = event.level
	}
	if (event.creater) {
		key.creater = event.creater
	}
	if (event.label && event.label.length != 0) {
		let ary = []
		event.label.forEach(item => {
			ary.push(cmd.eq(item))
		})
		key.label = cmd.and(ary)
	}
	if (event.topic && event.topic.length != 0) {
		let ary = []
		event.topic.forEach(item => {
			ary.push(cmd.eq(item))
		})
		key._id = cmd.or(ary)
	}
	let start = page * limit
	let res;
	const collection = db.collection('topicList')
	let total = await collection.where(key).count()
	if (event.random) {
		let size = event.size ? event.size : 1
		res = await collection.aggregate().sample({
			size
		}).end()
	} else {
		res = await collection.where(key).skip(start).limit(limit).orderBy('createTime', 'desc').get()
	}
	let result = res.data
	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

async function getBookList(event) {
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let key = {}
	if (event.key) {
		key.title = new RegExp(event.key)
	}
	if (event.creater) {
		key.creater = new RegExp(event.creater)
	}
	let start = page * limit
	const collection = db.collection('bookList')
	let res;
	let total = await collection.where(key).count()
	if (event.random) {
		let size = event.size ? event.size : 1
		res = await collection.aggregate().sample({
			size
		}).end()
	} else {
		res = await collection.where(key).skip(start).limit(limit).get()
	}
	let result = res.data.map(val => {
		delete val.list
		val.id = val._id
		return val
	})

	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

async function getBookContent(event) {
	if (event.id) {
		const collection = db.collection('bookList')
		const res = await collection.where({
			_id: event.id,
		}).get()
		if (res.data.length == 0) {
			return {
				code: 300,
				msg: "未查找到该书籍内容",
				data: ''
			}
		} else {
			return {
				code: 200,
				msg: "请求成功",
				data: res.data[0]
			}
		}
	} else {
		return {
			code: 500,
			msg: "请输入参数"
		}
	}

}
