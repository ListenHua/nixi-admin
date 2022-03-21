'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	switch (event.action) {
		case 'editBookInfo': {
			return editBookInfo(event)
		}
		default: {
			return
		}
	}
},

async function editBookInfo(event){
	console.log(event)
}