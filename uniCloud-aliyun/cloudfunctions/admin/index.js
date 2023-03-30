'use strict';

const uniID = require('uni-id');
const {
	verifyToken
} = require('wx-common');
const db = uniCloud.database();
const createTime = new Date().getTime();
let userInfo;

const handleErrors = (payload) => {
	if (payload.code && payload.code > 0) {
		throw new Error(payload);
	}
};

const operations = {
	addBookInfo: async (params) => awaitaddBookInfo(params),
	getBookList: async (params) => getBookList(params),
	addTopic: async (params) => addTopic(params),
	getTopicList: async (params) => getTopicList(params),
	editTopic: async (params) => editTopic(params),
	addVersion: async (params) => addVersion(params),
	addLabel: async (params) => addLabel(params),
	editBookInfo: async (params) => editBookInfo(params),
	addBookContent: async (params) => addBookContent(params),
	getBookContent: async (params) => getBookContent(params),
	editBookContent: async (params) => editBookContent(params),
	deleteBookContent: async (params) => deleteBookContent(params),
	editAbout: async (params) => editAbout(params),
	editVersion: async (params) => editVersion(params),
	setUserRole: async (params) => setUserRole(params),
	microUser: async (params) => microUser(params),
	topicAnalysis: async (params) => topicAnalysis(params),
	setAnalysisStatus: async (params) => setAnalysisStatus(params),
	deleteAnalysis: async (params) => deleteAnalysis(params),
	getSimulationList: async (params) => getSimulationList(params),
	addSimulationTopic: async (params) => addSimulationTopic(params),
	getSimulationTopic: async (params) => getSimulationTopic(params),
	deleteSimulationTopic: async (params) => deleteSimulationTopic(params),
	editSimulationTopic: async (params) => editSimulationTopic(params),
};

exports.main = async (event, context) => {
	try {
		const {
			uniIdToken
		} = event;
		const payload = await uniID.checkToken(uniIdToken);
		handleErrors(payload);
		userInfo = payload.userInfo;
		console.log('userInfo', userInfo);
		const operation = operations[event.action];
		if (!operation) {
			throw new Error('未知操作');
		}
		const result = await operation(event.params);
		return result;
	} catch (error) {
		return {
			code: 500,
			msg: error.message
		};
	}
}
// 添加标签
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
// 添加版本描述
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

// 获取资料列表
async function getBookList(event) {
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let key = {}
	if (event.key) {
		key.title = new RegExp(event.key)
	}
	if (userInfo.username != 'admin') {
		key.creater = new RegExp(userInfo.username)
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

async function getTopicList({
	limit = 15,
	page = 1,
	title,
	level,
	label = [],
	topic = []
} = {}) {
	const cmd = db.command;
	const start = (page - 1) * limit;
	const key = {};
	if (userInfo.username !== 'admin') key.creater = userInfo.username;
	if (title) key.title = new RegExp(title);
	if (level || level === 0) key.level = level;
	if (label.length) key.label = cmd.and(label.map(item => cmd.eq(item)));
	if (topic.length) key._id = cmd.or(topic.map(item => cmd.eq(item)));
	console.log('search-key', key);
	const collection = db.collection('topicList');
	const [count, data] = await Promise.all([
		collection.where(key).count(),
		collection.where(key).skip(start).limit(limit).orderBy('createTime', 'desc').get(),
	]);
	return {
		code: 200,
		msg: '请求成功',
		total: count.total,
		data: data.data,
	};
}


// 添加题目
async function addTopic({
	title,
	type,
	label,
	option,
	answer,
	level,
	analysis,
}) {
	const collection = db.collection('topicList')
	let res = await collection.add({
		title,
		type,
		label: label.split(','),
		option,
		answer,
		creater: userInfo.username,
		level,
		createTime,
		analysis,
	})
	return {
		code: 200,
		msg: '新增成功!',
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
		analysis,
	} = event
	const collection = db.collection('topicList')
	let res = await collection.doc(_id).update({
		title,
		type,
		label: label.split(','),
		option,
		answer,
		level,
		analysis,
	})
	return {
		code: 200,
		msg: '修改成功!',
	}
}

// 添加资料信息
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
		creater: userInfo.username,
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

// 删除模拟面试问题
async function deleteSimulationTopic(event) {
	// 将删除的数据添加到临时库
	let data = await db.collection('simulation-topic').doc(event._id).get();
	data.data[0].db = 'simulation-topic'
	let data_res = data.data[0]
	await db.collection('trashCan').add(data_res)

	const collection = db.collection('simulation-topic')
	let res = await collection.doc(event._id).remove();
	if (res.deleted === 1) {
		return {
			code: 200,
			msg: "删除成功！",
		}
	} else {
		return {
			code: 400,
			msg: "删除失败！"
		}
	}
}
// 编辑模拟面试问题
async function editSimulationTopic(event) {
	let params = event
	if (!params.text) {
		return {
			code: 400,
			msg: '问题不能为空!',
		}
	}
	if (!params.key) {
		return {
			code: 400,
			msg: '请选择相应专题!',
		}
	}
	let id = params._id
	delete params._id
	const collection = db.collection('simulation-topic')
	let isHas = await collection.where({
		text: params.text,
		key: params.key
	}).get()
	if (isHas.data[0]._id != id) {
		return {
			code: 400,
			msg: '已存在相同问题!',
		}
	}
	let res = await collection.doc(id).update(params)
	return {
		code: 200,
		msg: '更新成功!',
	}
}


// 获取模拟面试问题列表
async function getSimulationTopic(event) {
	let cmd = db.command
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	const collection = db.collection('simulation-topic')
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

// 添加模拟面试题
async function addSimulationTopic(event) {
	let params = event
	if (!params.text) {
		return {
			code: 400,
			msg: '问题不能为空!',
		}
	}
	if (!params.key) {
		return {
			code: 400,
			msg: '请选择相应专题!',
		}
	}
	const collection = db.collection('simulation-topic')
	let isHas = await collection.where({
		text: params.text,
		key: params.key
	}).count()
	if (isHas.total > 0) {
		return {
			code: 400,
			msg: '已存在相同问题!',
		}
	}
	let res = await collection.add(params)
	return {
		code: 200,
		msg: '新增成功!',
	}
}

// 获取专题列表
async function getSimulationList(event) {
	const collection = db.collection('simulation-list')
	let res = await collection.get()
	console.log(res);
	return {
		code: 200,
		msg: '获取成功!',
		data: res.data
	}
}

// 删除题目解析回答
async function deleteAnalysis(event) {
	// 将删除的数据添加到临时库
	let data = await db.collection('topic-analysis').doc(event.id).get();
	data.data[0].db = 'topic-analysis'
	let data_res = data.data[0]
	await db.collection('trashCan').add(data_res)

	const collection = db.collection('topic-analysis')
	let res = await collection.doc(event.id).remove();
	if (res.deleted === 1) {
		return {
			code: 200,
			msg: "删除成功！",
		}
	} else {
		return {
			code: 400,
			msg: "删除失败！"
		}
	}
}

async function setAnalysisStatus(event) {
	let {
		id,
		status
	} = event
	const collection = db.collection('topic-analysis')
	let res = await collection.doc(id).update({
		status,
	})
	return {
		code: 200,
		msg: '修改成功!',
	}
}


async function topicAnalysis(event) {
	let cmd = db.command
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	const collection = db.collection('topic-analysis')
	let res;
	let total = await collection.count()
	res = await collection.skip(start).limit(limit).orderBy('status', 'asc').get()
	let result = res.data
	for (let i in result) {
		let user = await db.collection('userInfo').doc(result[i].createId).get()
		let topic = await db.collection('topicList').doc(result[i].topicId).get()
		result[i].author = user.data[0]
		result[i].topic = topic.data[0]
	}
	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

async function microUser(event) {
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let start = page * limit
	const collection = db.collection('userInfo')
	let res;
	let total = await collection.count()
	res = await collection.skip(start).limit(limit).get()
	let result = res.data

	return {
		code: 200,
		msg: "请求成功",
		total: total.total,
		data: result
	}
}

async function setUserRole(event) {
	let {
		user,
		role
	} = event
	const collection = db.collection('userInfo')
	let res = await collection.doc(user).update({
		role,
	})
	return {
		code: 200,
		msg: '修改成功!',
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
		msg: '修改成功!',
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
		msg: '修改成功!',
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
		msg: '修改成功!',
	}
}

/* 
 * 资料内容部分
 */

async function deleteBookContent(event) {
	let {
		id
	} = event
	const collection = db.collection('book-content')
	let res = await collection.doc(id).remove()
	return {
		code: 200,
		msg: '删除成功!',
	}
}

async function editBookContent(event) {
	let {
		id,
		title,
		content
	} = event
	const collection = db.collection('book-content')
	let res = await collection.doc(id).update({
		title,
		content
	})
	return {
		code: 200,
		msg: '修改成功!',
	}
}


async function addBookContent(event) {
	console.log(event);
	let {
		book_id,
		title,
		content
	} = event
	if (!title || !content) {
		return {
			code: 400,
			msg: "请填写标题或内容!"
		}
	}
	const collection = db.collection('book-content')
	let res = await collection.add({
		book_id,
		title,
		content,
		creator: userInfo.username,
		create_time: createTime,
	})
	return {
		code: 200,
		msg: '新增成功!',
	}
}
