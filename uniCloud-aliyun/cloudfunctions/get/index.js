'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'getBookList': {
			return getBookList(event.params)
		}
		case 'getBookContent': {
			return getBookContent(event.params)
		}
		case 'getTopicList': {
			return getTopicList(event.params)
		}
		case 'getVersion': {
			return getVersion(event.params)
		}
		case 'getAbout': {
			return getAbout(event.params)
		}
		default: {
			return
		}
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

async function getTopicList(event) {
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let key = {
		label: new RegExp(event.label),
		title: new RegExp(event.title),
		level: event.level
	}
	let start = page * limit
	let res;
	const collection = db.collection('topicList')
	if (event.random) {
		let size = event.size ? event.size : 1
		res = await collection.aggregate().sample({
			size
		}).end()
	} else {
		res = await collection.where(key).skip(start).limit(limit).get()
	}
	let result = res.data

	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

async function getBookList(event) {
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let key = event.key ? {
		title: new RegExp(event.key)
	} : event.creater ? {
		creater: new RegExp(event.creater)
	} : {}
	let start = page * limit
	const collection = db.collection('bookList')
	let res
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
		return val
	})

	return {
		code: 200,
		msg: "请求成功",
		data: result
	}
}

async function getBookContent(event) {
	if (event.id) {
		const collection = db.collection('bookList')
		const res = await collection.where({
			id: event.id,
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
