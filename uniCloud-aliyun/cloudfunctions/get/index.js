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
		default: {
			return
		}
	}
}

async function getBookList(event) {
	event = event ? event : {}
	let limit = event.limit ? event.limit : 15
	let page = event.page ? event.page - 1 < 0 ? 0 : event.page - 1 : 0
	let key = event.key ? {
		title: new RegExp(event.key)
	} : {}
	console.log("参数",key,limit,page)
	let start = page * limit
	const collection = db.collection('bookList')
	const res = await collection.where(key).skip(start).limit(limit).get()
	console.log("???",res)
	let result = res.data.map(val => {
		delete val.list
		return val
	})

	console.log("获取列表", result);
	return res
}

async function getBookContent(event) {
	if (event.id) {
		const collection = db.collection('bookList')
		const res = await collection.where({
			id: event.id,
		}).get()
		console.log(res);
		if (res.data.length == 0) {
			return {
				code: 500,
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
