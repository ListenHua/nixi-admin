<template>
	<view class="page-content">
		<view class="content-edit-pop" v-if="pageLoad">
			<view class="button-box">
				<view>{{uploadSuccessFilePath}}</view>
				<button size="mini" type="primary" @click="copyImage">复制</button>
				<button size="mini" type="primary" @click="uploadImage">上传图片</button>
			</view>
			<n-editor :content="contentText" @change="editorChange"></n-editor>
			<view class="button-box">
				<button size="mini" type="primary" @click="editContent">确定修改</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				contentEditor: '',
				contentText: "",
				uploadSuccessFilePath: '',
				pageLoad: false,
			}
		},
		onLoad() {
			this.getData()
		},
		methods: {
			// 获取数据
			getData() {
				this.$request('getAbout', '', {
					functionName: 'get'
				}).then(res => {
					let data = res.data
					this.pageLoad = true
					this.contentText = data
				})
			},
			// 编辑器内容
			editorChange(text) {
				this.contentText = text
			},
			// 复制内容
			copyImage() {
				uni.setClipboardData({
					data: this.uploadSuccessFilePath,
					success: () => {
						uni.showToast({
							title: "复制成功"
						})
					}
				})
			},
			// 上传图片
			uploadImage() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						let filePath = res.tempFilePaths[0]
						uniCloud.uploadFile({
							cloudPath: res.tempFiles[0].name,
							filePath,
						}).then(res => {
							console.log("服务器地址", res);
							this.uploadSuccessFilePath = res.fileID
						})
					}
				})
			},
			// 确定编辑
			editContent() {
				this.$request('editAbout', {
					content: this.contentText,
				}, {
					functionName: 'edit'
				}).then(res => {
					uni.showToast({
						title: "修改成功"
					})
				})
			},
		}
	}
</script>
<style scoped lang="scss">
	.page-content {
		padding: 20rpx;
	}

	.content-edit-pop {
		width: 100%;
		background-color: #fff;
		border-radius: 8rpx;
		box-sizing: border-box;
	}

	.button-box {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin: 20rpx 0;

		button {
			margin: 0 20rpx;
		}
	}
</style>
