<template>
	<view class="page-content">
		<view class="content-edit-pop">
			<view class="button-box">
				<view>{{uploadSuccessFilePath}}</view>
				<button size="mini" type="primary" @click="copyImage">复制</button>
				<button size="mini" type="primary" @click="uploadImage">上传图片</button>
			</view>
			<view id="editor" style="height: 900rpx;"></view>
			<view class="button-box">
				<button size="mini" type="primary" @click="editContent">确定修改</button>
			</view>
		</view>
	</view>
</template>

<script>
	import wangeditor from '@/uni_modules/wangeditor'

	export default {
		data() {
			return {
				contentEditor: '',
				contentText: "",
				uploadSuccessFilePath: '',
			}
		},
		onLoad() {
			this.getData()
		},
		methods: {
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
			// 获取数据
			getData() {
				this.$request('getAbout', '', {
					functionName: 'get'
				}).then(res => {
					this.contentText = res.data
					this.$nextTick(() => {
						this.contentEditor = new wangeditor('#editor')
						this.contentEditor.config.showLinkImgAlt = false
						this.contentEditor.config.showLinkImgHref = false
						this.contentEditor.create()
						this.contentEditor.txt.html(this.contentText)
					})
				})
			},
			// 确定编辑
			editContent() {
				this.contentText = this.contentEditor.txt.html()
				console.log(this.contentText)
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
