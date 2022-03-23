'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'editBookInfo': {
			return editBookInfo(event.params)
		}
		case 'addBookContent': {
			return addBookContent(event.params)
		}
		default: {
			return
		}
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
	console.log(JSON.stringify(res))
	return {
		code: 200,
		message: '修改成功!',
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
		message: '新增成功!',
	}
}
