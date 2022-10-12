<template>
	<view class="page-content">
		<view class="button-box">
			<button size="mini" type="primary" @click="openEditContentPop">新增</button>
		</view>
		<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
			<uni-tr>
				<uni-th width="300" align="center">标题</uni-th>
				<uni-th width="204" align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item ,index) in bookInfo.list" :key="index">
				<uni-td align="center">
					<view class="name">{{item.title}}</view>
				</uni-td>
				<uni-td>
					<view class="uni-group">
						<button class="uni-button" size="mini" type="primary"
							@click="openEditContentPop(item,index)">编辑内容</button>
						<button class="uni-button" size="mini" type="warn"
							@click="deleteContent(item,index)">{{$t('common.button.delete')}}</button>
					</view>
				</uni-td>
			</uni-tr>
		</uni-table>
		<uni-popup ref="contentPop" type="center" :mask-click="false">
			<view class="content-edit-pop">
				<uni-easyinput type="text" v-model="contentText.title" placeholder="请输入标题"
					style="margin-bottom: 30rpx;" />
				<view class="button-box">
					<view>{{uploadSuccessFilePath}}</view>
					<button size="mini" type="primary" @click="copyImage">复制</button>
					<button size="mini" type="primary" @click="uploadImage">上传图片</button>
				</view>
				<div id="editor"></div>
				<view class="button-box">
					<button size="mini" type="primary" @click="addBookContent">确定</button>
					<button size="mini" type="default" @click="closeEditPop">取消编辑</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import wangeditor from '@/uni_modules/wangeditor'

	export default {
		data() {
			return {
				contentEditor: '',
				bookInfo: '',
				loading: true,
				contentText: {
					title: "",
					content: "",
				},
				editorConfig:{
					showLinkImgAlt:false,
					showLinkImgHref:false
				},
				editStatus: "",
				editContent: "",
				editIndex: "",
				bookId: '',
				uploadSuccessFilePath: '',
			}
		},
		onLoad(option) {
			this.bookId = option.id
			this.getData()
		},
		methods: {
			// 初始化页面数据
			initPageData() {
				this.contentText = {
					title: "",
					content: "",
				}
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
			// 关闭编辑弹窗
			closeEditPop() {
				this.$refs.contentPop.close()
				this.initPageData()
				this.editIndex = ''
			},
			// 获取数据
			getData() {
				let id = this.bookId
				this.$request('getBookContent', {
					'id': id
				}, {
					functionName: 'get'
				}).then(res => {
					this.bookInfo = res.data
					this.loading = false
				})
			},
			// 删除内容
			deleteContent(item, index) {
				let that = this
				let list = this.bookInfo.list
				uni.showModal({
					title: "是否删除标题为：“" + item.title + "”的内容",
					success(res) {
						console.log(res)
						if (res.confirm) {
							list.splice(index, 1)
							that.$request('addBookContent', {
								_id: that.bookInfo._id,
								list
							}, {
								functionName: 'edit'
							}).then(res => {
								uni.showToast({
									title: "删除成功"
								})
								that.getData()
							})
						}
					}
				})
			},
			// 确定编辑
			addBookContent() {
				let list = this.bookInfo.list
				let index = this.editIndex
				this.contentText.content = this.contentEditor.txt.html()
				if (index || index === 0) {
					list[index] = this.contentText
				} else {
					list.push(this.contentText)
				}
				this.$request('addBookContent', {
					_id: this.bookInfo._id,
					list
				}, {
					functionName: 'edit'
				}).then(res => {
					uni.showToast({
						title: "修改成功"
					})
					this.closeEditPop()
					this.editIndex = ''
					this.getData()
				})
			},
			onCreated(editor){
				this.contentEditor = Object.seal(editor)
			},
			// 打开编辑器弹窗
			openEditContentPop(item, index) {
				let that = this
				console.log("????", item, index);
				if (index || index === 0) {
					this.editStatus = 'edit'
					this.editIndex = index
					console.log("编辑模式")
				} else {
					this.editStatus = 'add'
					console.log("新增模式")
				}
				this.$refs.contentPop.open()
				this.$nextTick(() => {
					this.contentEditor = new wangeditor('#editor')
					this.contentEditor.config.showLinkImgAlt = false
					this.contentEditor.config.showLinkImgHref = false
					this.contentEditor.create()
					if (this.editStatus == 'edit') {
						this.contentText.title = item.title
						this.contentEditor.txt.html(item.content)
					}
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.page-content {
		padding: 40rpx;
	}

	.content-edit-pop {
		width: 70%;
		background-color: #fff;
		padding: 80rpx;
		border-radius: 8rpx;
		margin: 0 auto;
	}

	.button-box {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin: 40rpx 0;

		button {
			margin: 0 20rpx;
		}
	}
</style>
