'use strict';
let uniID = require('uni-id')
const {
	verifyToken
} = require("wx-common");
const db = uniCloud.database()
exports.main = async (event, context) => {
	//UNI_WYQ:这里的uniID换成新的，保证多人访问不会冲突
	uniID = uniID.createInstance({
		context
	})
	const {
		uniIdToken
	} = event;
	let payload = await uniID.checkToken(uniIdToken)
	if (payload.code && payload.code > 0) {
		return payload
	}
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
		case 'setUserRole': {
			return setUserRole(event.params)
		}
		case 'microUser': {
			return microUser(event.params)
		}
		case 'topicAnalysis': {
			return topicAnalysis(event.params)
		}
		case 'setAnalysisStatus': {
			return setAnalysisStatus(event.params)
		}
		case 'deleteAnalysis': {
			return deleteAnalysis(event.params)
		}
		default: {
			return
		}
	}
}

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
	res = await collection.skip(start).limit(limit).get()
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
		msg: '新增成功!',
	}
}
