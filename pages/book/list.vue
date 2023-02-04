<template>
	<view>
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">资料列表</view>
			</view>
			<view class="uni-group">
				<!-- <input class="uni-search" type="text" v-model="searchVal" @confirm="search"
					:placeholder="$t('common.placeholder.query')" />
				<button class="uni-button" type="default" size="mini"
					@click="search">{{$t('common.button.search')}}</button> -->
				<button class="uni-button" type="primary" size="mini"
					@click="addNewBook">{{$t('common.button.add')}}</button>
				<!-- <button class="uni-button" type="warn" size="mini"
					@click="delTable">{{$t('common.button.batchDelete')}}</button> -->
			</view>
		</view>
		<view class="uni-container">
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
				<uni-tr>
					<uni-th width="50" align="center">封面</uni-th>
					<uni-th width="150" align="center">作者</uni-th>
					<uni-th align="center">书籍</uni-th>
					<uni-th width="304" align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index">
					<uni-td align="center">
						<image class="table-cover" :src="item.cover" mode="aspectFill"></image>
					</uni-td>
					<uni-td align="center">{{item.author}}</uni-td>
					<uni-td align="center">{{item.title}}</uni-td>
					<uni-td>
						<view class="uni-group">
							<button class="uni-button" size="mini" type="primary"
								@click="openEditPop(item)">{{$t('common.button.edit')}}</button>
							<button class="uni-button" size="mini" type="primary"
								@click="toEditContent(item)">编辑内容</button>
							<button class="uni-button" size="mini" type="warn"
								@click="deleteBook(item)">{{$t('common.button.delete')}}</button>
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
			<view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total"
					@change="pageChange" />
			</view>
		</view>
		<uni-popup ref="editPop" type="center" :maskClick="false">
			<view class="edit-pop">
				<uni-title type="h1" :title="popStatus=='add'?'新增':'编辑'" align="center" style="margin-bottom: 40rpx;">
				</uni-title>
				<uni-forms ref="editInfo" :modelValue="editFormData" :rules="rules">
					<uni-forms-item label="类型" name="type">
						<uni-data-checkbox mode="tag" v-model="editFormData.type" :localdata="sex"></uni-data-checkbox>
					</uni-forms-item>
					<uni-forms-item label="来源" name="origin">
						<uni-easyinput type="text" v-model="editFormData.origin" />
					</uni-forms-item>
					<uni-forms-item label="封面">
						<uni-file-picker v-model="coverUploadUrl" limit="1" fileMediatype="image" mode="grid"
							@success="uploadCover" />
					</uni-forms-item>
					<uni-forms-item label="作者" name="author">
						<uni-easyinput type="text" v-model="editFormData.author" />
					</uni-forms-item>
					<uni-forms-item label="名称" name="title">
						<uni-easyinput type="text" v-model="editFormData.title" />
					</uni-forms-item>
				</uni-forms>
				<view class="button-box">
					<button v-show="popStatus=='add'" size="mini" type="primary" @click="submitadd">新增书籍</button>
					<button v-show="popStatus=='edit'" size="mini" type="primary" @click="submitEdit">修改信息</button>
					<button size="mini" type="default" @click="closeEditPop">取消</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchVal: '',
				tableData: [],
				// 每页数据量
				pageSize: 10,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				editFormData: {},
				coverUploadUrl: {},
				sex: [{
					text: '普通',
					value: 0
				}, {
					text: '热门',
					value: 1
				}, {
					text: '推荐',
					value: 2
				}],
				popStatus: '',
				creater: uni.getStorageSync('lastUsername'),
				rules: {
					title: {
						rules: [{
							required: true,
							errorMessage: '请输入书籍标题',
						}]
					},
				}
			}
		},
		mounted() {
			this.getList()
			this.initEditFormData()
		},
		methods: {
			// 切换上下页
			pageChange(e){
				this.pageCurrent = e.current
				this.getList()
			},
			// 关闭编辑弹窗
			closeEditPop() {
				this.$refs.editPop.close()
			},
			// 新增书籍
			submitadd() {
				if (this.editFormData.cover == '') {
					uni.showToast({
						title: "请上传封面图",
						icon: "none"
					})
					return
				}
				this.$refs.editInfo.validate().then(res => {
					this.$request('addBookInfo', this.editFormData, {
						functionName: 'admin'
					}).then(res => {
						if (res.code == 200) {
							this.initEditFormData()
							this.$refs.editPop.close()
							this.getList()
						}
					})
				}).catch(err => {
					console.log('表单错误信息：', err);
				})
			},
			// 打开新增书籍弹窗
			addNewBook() {
				this.popStatus = 'add'
				this.initEditFormData()
				this.$refs.editPop.open()
			},
			// 初始化表格数据
			initEditFormData() {
				this.editFormData = {
					cover: "",
					author: "",
					creater: this.creater,
					title: "",
					type: 0,
					origin: "",
				}
				this.coverUploadUrl = {}
			},
			// 打开编辑内容弹窗
			toEditContent(item) {
				uni.navigateTo({
					url: "/pages/book/content?id=" + item.id
				})
			},
			// 确认修改
			submitEdit() {
				if (this.editFormData.cover == '') {
					uni.showToast({
						title: "请上传封面图",
						icon: "none"
					})
					return
				}
				this.$refs.editInfo.validate().then(res => {
					this.$request('editBookInfo', this.editFormData, {
						functionName: 'edit'
					}).then(res => {
						console.log(res);
						if (res.code == 200) {
							this.initEditFormData()
							this.$refs.editPop.close()
							this.getList()
						}
					})
				}).catch(err => {
					console.log('表单错误信息：', err);
				})
			},
			// 删除书籍
			deleteBook(item) {
				uni.showModal({
					title: "提示",
					content: "是否要删除该资料库?",
					success: res => {
						this.$request('book', item, {
							functionName: 'remove'
						}).then(res => {
							if (res.code == 200) {
								uni.showToast({
									title: "删除成功!如果误删请联系管理员",
									duration: 1500,
									icon: "none",
									mask: true
								})
								setTimeout(() => {
									this.initEditFormData()
									this.$refs.editPop.close()
									this.getList()
								}, 1500)
							}
						}).catch(err => {
							console.log('表单错误信息：', err);
						})
					}
				})
			},
			// 上传封面图
			uploadCover(e) {
				console.log(e.tempFilePaths[0])
				this.editFormData.cover = JSON.parse(JSON.stringify(e.tempFilePaths[0]))
			},
			// 打开编辑弹窗
			openEditPop(item) {
				this.popStatus = 'edit'
				this.editFormData = JSON.parse(JSON.stringify(item))
				this.coverUploadUrl = {
					url: item.cover
				}
				this.$refs.editPop.open()
			},
			// 多选处理
			selectedItems() {
				return this.selectedIndexs.map(i => this.tableData[i])
			},
			// 多选
			selectionChange(e) {
				console.log(e.detail.index);
				this.selectedIndexs = e.detail.index
			},
			getList() {
				uni.showLoading({
					title: "数据加载中...",
					mask: true
				})
				this.$request('getBookList', {
					page:this.pageCurrent,
					limit:this.pageSize,
					creater: this.creater == 'admin' ? '' : this.creater
				}, {
					functionName: 'get'
				}).then(res => {
					this.total = res.total
					this.tableData = res.data
					uni.hideLoading()
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.table-cover {
		width: 180rpx;
		height: 240rpx;
		border-radius: 8rpx;
	}

	.nav-title {
		font-size: 30rpx;
		font-weight: bold;
		text-align: center;
		margin: 20rpx;
	}

	.edit-pop {
		width: 1000rpx;
		padding: 80rpx;
		background-color: #fff;
		border-radius: 8rpx;

	}

	.button-box {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin-top: 40rpx;

		button {
			margin: 0 20rpx;
		}
	}
</style>
