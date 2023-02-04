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
			<uni-tr v-for="(item ,index) in contentList" :key="index">
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
		<view class="uni-pagination-box">
			<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total"
				@change="pageChange" />
		</view>
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
					<button size="mini" type="primary" @click="submit">确定</button>
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
				contentList: [],
				loading: true,
				pageSize: 15,
				pageCurrent: 1,
				total: 0,
				contentText: {
					title: "",
					content: "",
				},
				editorConfig: {
					showLinkImgAlt: false,
					showLinkImgHref: false
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
			// 切换上下页
			pageChange(e){
				this.pageCurrent = e.current
				this.getData()
			},
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
					page: this.pageCurrent,
					limit: this.pageSize,
					book_id: id
				}, {
					functionName: 'get'
				}).then(res => {
					this.contentList = res.data
					this.total = res.total
					this.loading = false
				})
			},
			// 删除内容
			deleteContent(item, index) {
				let that = this
				uni.showModal({
					title: "是否删除标题为：“" + item.title + "”的内容",
					success(res) {
						console.log(res)
						if (res.confirm) {
							that.$request('deleteBookContent', {
								id: item._id
							}, {
								functionName: 'admin'
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
			submit() {
				let index = this.editIndex
				if (index || index === 0) {
					this.editBookContent()
				} else {
					this.addBookContent()
				}
			},
			// 新增
			addBookContent() {
				let list = this.contentList
				this.contentText.content = this.contentEditor.txt.html()
				let params = {
					book_id: this.bookId,
					title: this.contentText.title,
					content: this.contentText.content
				}
				this.$request('addBookContent', params, {
					functionName: 'admin'
				}).then(res => {
					uni.showToast({
						title: "新增成功"
					})
					this.closeEditPop()
					this.editIndex = ''
					this.getData()
				})
			},
			// 编辑
			editBookContent() {
				let list = this.contentList
				let index = this.editIndex
				this.contentText.content = this.contentEditor.txt.html()
				let params = {
					id: list[index]._id,
					title: this.contentText.title,
					content: this.contentText.content
				}
				this.$request('editBookContent', params, {
					functionName: 'admin'
				}).then(res => {
					uni.showToast({
						title: "修改成功"
					})
					this.closeEditPop()
					this.editIndex = ''
					this.getData()
				})
			},
			onCreated(editor) {
				let list = this.contentList
				this.contentEditor = Object.seal(editor)
				this.contentText.content = this.contentEditor.txt.html()
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
