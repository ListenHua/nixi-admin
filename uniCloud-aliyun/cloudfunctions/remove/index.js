'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'book': {
			return bookList(event.params)
		}
		case 'topic': {
			return topic(event.params)
		}
		default: {
			return
		}
	}
};

async function bookList(event) {
	let {
		_id
	} = event
	// 将删除的数据添加到临时库
	let data = await db.collection('bookList').doc(_id).get();
	data.data[0].db = 'topicList'
	let data_res = data.data[0]
	await db.collection('trashCan').add(data_res)
	// 删除操作
	let res = await db.collection('bookList').doc(_id).remove();
	if(res.deleted===1){
		return {
			code:200,
			data:"删除成功！"
		}
	}else{
		return {
			code:400,
			data:"删除失败！"
		}
	}
}

async function topic(event) {
	let {
		_id
	} = event
	// 将删除的数据添加到临时库
	let data = await db.collection('topicList').doc(_id).get();
	data.data[0].db = 'topicList'
	let data_res = data.data[0]
	await db.collection('trashCan').add(data_res)
	// 删除操作
	let res = await db.collection('topicList').doc(_id).remove();
	if(res.deleted===1){
		return {
			code:200,
			data:"删除成功！"
		}
	}else{
		return {
			code:400,
			data:"删除失败！"
		}
	}
}