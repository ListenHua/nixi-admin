'use strict';
exports.main = async (event, context) => {
	switch (event.action) {
		case 'uploadImage': {
			return uploadImage(event.params)
		}
		default: {
			return
		}
	}
};
async function uploadImage(params) {
	console.log("接收的参数",params)
	uniCloud.uploadFile({
		cloudPath:params.cloudPath,
		fileContent:params.file
	}).then(res=>{
		console.log("上传成功",res);
	})
}