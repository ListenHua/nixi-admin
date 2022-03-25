'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'addBookInfo': {
			return addBookInfo(event.params)
		}
		default: {
			return
		}
	}
};

async function addBookInfo(event) {
	let {
		id,
		cover,
		author,
		title,
		type,
		origin,
	} = event
	const collection = db.collection('bookList')
	let res = await collection.add({
		id,
		cover,
		author,
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