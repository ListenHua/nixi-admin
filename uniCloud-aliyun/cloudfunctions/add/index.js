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
		case 'addLabel': {
			return addLabel(event.params)
		}
		default: {
			return
		}
	}
};

async function addLabel(event) {
	let {
		name,
	} = event
	const collection = db.collection('labelList')
	let res = await collection.add({
		name
	})
	return {
		code: 200,
		message: '新增成功!',
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
	})
	return {
		code: 200,
		message: '新增成功!',
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
		list: []
	})
	console.log(JSON.stringify(res))
	return {
		code: 200,
		message: '新增成功!',
	}
}
