'use strict';
const db = uniCloud.database()
const {
	verifyInfo
} = require("wx-common");
var userInfo;
exports.main = async (event, context) => {
	let params = event.params
	userInfo = verifyInfo(params.token)
	delete params.token
	switch (event.action) {
		case 'systemData': {
			return systemData(params)
		}
		case 'getBookList': {
			return getBookList(params)
		}
		case 'getBookInfo': {
			return getBookInfo(params)
		}
		case 'getBookContent': {
			return getBookContent(params)
		}
		case 'getTopicList': {
			return getTopicList(params)
		}
		case 'getTopicInfo': {
			return getTopicInfo(params)
		}
		case 'getVersion': {
			return getVersion(params)
		}
		case 'getAbout': {
			return getAbout(params)
		}
		case 'getLabelList': {
			return getLabelList(params)
		}
		case 'getExamDetail': {
			return getExamDetail(params)
		}
		case 'topicAnalysis': {
			return topicAnalysis(params)
		}
		case 'getExamReply': {
			return getExamReply(params)
		}
		case 'getReplyDetail': {
			return getReplyDetail(params)
		}
		case 'myCreateExam': {
			return myCreateExam(params)
		}
		case 'simulationList': {
			return simulationList(params)
		}
		case 'simulationTopic': {
			return simulationTopic(params)
		}
		case 'simulationRecord': {
			return simulationRecord(params)
		}
		case 'simulationRecordDetail': {
			return simulationRecordDetail(params)
		}
		default: {
			return
		}
	}
}

// 获取考卷详情
async function simulationRecordDetail(event) {
	let {
		id
	} = event
	const history = db.collection('user-simulation-record')
	let res = await history.doc(id).get()
	if (res.data.length <= 0) {
		return {
			code: 300,
			msg: "找不到该记录",
		}
	}
	let result = res.data[0]
	let special = await db.collection('simulation-list').where({
		key: result.key
	}).get()
	result.simulation = special.data[0]
	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

// 获取模拟面试记录
async function simulationRecord(event) {
	if (userInfo.code) return userInfo
	let cmd = db.command
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	const collection = db.collection('user-simulation-record')
	let key = {
		creatorId: cmd.eq(userInfo._id)
	}
	let res = await collection.where(key).skip(start).limit(limit).orderBy('createTime', 'desc').get()
	let total = await collection.where(key).count()
	let result = res.data
	for (let i in result) {
		let special = await db.collection('simulation-list').where({
			key: result[i].key
		}).get()
		result[i].simulation = special.data[0]
	}
	console.log('userInfo----->', result)
	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

// 获取模拟面试专题试题
async function simulationTopic(event) {
	let cmd = db.command
	let key = event.key
	const collection = db.collection('simulation-topic')
	// 初级题目
	let primary = await collection.aggregate().match({
		key,
		level: 1
	}).sample({
		size: 10
	}).end()
	primary = primary.data
	// 中级题目
	let middle_rank = await collection.aggregate().match({
		key,
		level: 2
	}).sample({
		size: 5
	}).end()
	middle_rank = middle_rank.data
	// 高级题目
	let senior = await collection.aggregate().match({
		key,
		level: 3
	}).sample({
		size: 5
	}).end()
	senior = senior.data

	let result = [...primary, ...middle_rank, ...senior]

	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}
// 获取模拟面试专题列表
async function simulationList(event) {
	let cmd = db.command
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	const collection = db.collection('simulation-list')
	let res = await collection.skip(start).limit(limit).get()
	let total = await collection.count()
	let result = res.data
	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

// 获取我创建的考卷
async function myCreateExam(event) {
	if (userInfo.code) return userInfo
	let cmd = db.command
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	const collection = db.collection('testPaper')
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
	if (userInfo.code) return userInfo
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
	if (userInfo.code) return userInfo
	let cmd = db.command
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	const collection = db.collection('answerHistory')
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
		topicId: cmd.eq(event.id),
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
		console.log("用户信息————>", user)
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
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	let {
		book_id
	} = event
	const collection = db.collection('book-content')
	let total = await collection.where({
		book_id
	}).count()
	let res = await collection.where({
		book_id
	}).skip(start).limit(limit).get()
	let result = res.data
	return {
		code: 200,
		msg: '获取成功!',
		total: total.total,
		data: result,
	}
}

async function getBookInfo(event) {
	try {
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
	} catch (e) {
		return {
			code: 400,
			msg: "参数错误",
		}
	}

}
