'use strict';
const db = uniCloud.database()
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
		default: {
			return
		}
	}
};

async function addVersion(event) {
	let {
		version,
		desc,
	} = event
	const collection = db.collection('version')
	let res = await collection.add({
		version,
		versionNum:version.replace(/./g,""),
		desc,
	})
	return {
		code: 200,
		message: '新增成功!',
	}
}

async function addTopic(event) {
	let {
		title,
		type,
		label,
		option,
		answer,
	} = event
	const collection = db.collection('topicList')
	let res = await collection.add({
		title,
		type,
		label,
		option,
		answer,
	})
	return {
		code: 200,
		message: '新增成功!',
	}
}

async function addBookInfo(event) {
	let {
		id,
		cover,
		author,
		creater,
		title,
		type,
		origin,
	} = event
	const collection = db.collection('bookList')
	let res = await collection.add({
		id,
		cover,
		author,
		creater,
		title,
		type,
		origin,
		list:[]
	})
	console.log(JSON.stringify(res))
	return {
		code: 200,
		message: '新增成功!',
	}
}