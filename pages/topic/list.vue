<template>
	<view>
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">题目列表</view>
			</view>
			<view class="uni-group">
				<!-- <input class="uni-search" type="text" v-model="searchVal" @confirm="search"
					:placeholder="$t('common.placeholder.query')" />
				<button class="uni-button" type="default" size="mini"
					@click="search">{{$t('common.button.search')}}</button> -->
				<button class="uni-button" type="primary" size="mini"
					@click="addNewTopic">{{$t('common.button.add')}}</button>
			</view>
		</view>
		<view class="uni-container">
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
				<uni-tr>
					<uni-th width="300" align="center">题目</uni-th>
					<uni-th width="80" align="center">类型</uni-th>
					<uni-th align="center">等级</uni-th>
					<uni-th align="center">标签</uni-th>
					<uni-th align="center">选项</uni-th>
					<uni-th align="center">答案</uni-th>
					<uni-th align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index">
					<uni-td>
						<scroll-view scroll-y style="max-height: 300rpx;">
							<l-parse :content="item.title"></l-parse>
						</scroll-view>
					</uni-td>
					<uni-td align="center">
						<view class="name">{{item.type===0?'多选':item.type===1?'单选':'问答题'}}</view>
					</uni-td>
					<uni-td align="center">{{item.level===0?'初级':item.level===1?'中级':'高级'}}</uni-td>
					<uni-td align="center">{{item.label}}</uni-td>
					<uni-td align="center">
						<view v-if="item.type===2" class="name">-</view>
						<button v-else class="uni-button" size="mini" type="primary"
							@click="viewOption(item.option)">查看选项</button>
					</uni-td>
					<uni-td align="center">
						<button v-if="item.type===2" class="uni-button" size="mini" type="primary">查看答案</button>
						<view v-else class="name">{{item.answer}}</view>
					</uni-td>
					<uni-td>
						<view class="uni-group">
							<button class="uni-button" size="mini" type="primary"
								@click="openEditPop(item)">{{$t('common.button.edit')}}</button>
							<button class="uni-button" size="mini" type="warn"
								@click="deleteTopic(item)">{{$t('common.button.delete')}}</button>
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
					<uni-forms-item label="题目" name="id">
						<view class="content-text">
							<view>{{editFormData.title}}</view>
							<button class="uni-button" size="mini" type="primary"
								@click="openEditContentPop(editFormData.title,-1)">编辑标题</button>
						</view>
					</uni-forms-item>
					<uni-forms-item label="类型" name="type">
						<uni-data-checkbox mode="tag" v-model="editFormData.type" :localdata="typeOption">
						</uni-data-checkbox>
					</uni-forms-item>
					<uni-forms-item label="等级" name="level">
						<uni-data-checkbox mode="tag" v-model="editFormData.level" :localdata="levelOption">
						</uni-data-checkbox>
					</uni-forms-item>
					<uni-forms-item label="标签" name="label">
						<view class="content-text">
							<uni-easyinput type="text" placeholder="请选择标签" disabled :styles="{disableColor:'#fff'}"
								v-model="editFormData.label" />
							<button class="uni-button" size="mini" type="primary"
								@click="openLabelSelectPop">选择标签</button>
						</view>
					</uni-forms-item>
					<uni-forms-item label="答案" name="answer">
						<uni-easyinput v-if="editFormData.type==0" type="number" placeholder="请输入答案下标"
							v-model="editFormData.answer" />
						<uni-easyinput v-else-if="editFormData.type==1" type="text" placeholder="请输入答案下标,从0开始,逗号分隔"
							v-model="editFormData.answer" />
						<view v-else class="content-text">
							<view>{{editFormData.answer}}</view>
							<button class="uni-button" size="mini" type="primary"
								@click="openEditContentPop(editFormData.answer)">编辑内容</button>
						</view>
					</uni-forms-item>
					<uni-forms-item label="选项" v-if="editFormData.type==0||editFormData.type==1">
						<view class="content-text" v-for="(item,index) in editFormData.option" :key='index'>
							<view>{{item.content}}</view>
							<button class="uni-button" size="mini" type="primary"
								@click="openEditContentPop(item.content,index)">编辑内容</button>
							<button v-if="editFormData.option.length>1" class="uni-button" size="mini" type="warn"
								@click="deleteOption(index)">删除</button>
						</view>
					</uni-forms-item>
				</uni-forms>
				<view class="button-box">
					<button size="mini" type="primary" @click="addOption">新增选项</button>
					<button v-show="popStatus=='add'" size="mini" type="primary" @click="submitadd">新增题目</button>
					<button v-show="popStatus=='edit'" size="mini" type="primary" @click="submitEdit">修改信息</button>
					<button size="mini" type="default" @click="closeEditPop(0)">取消</button>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="contentPop" type="center" :mask-click="false">
			<view class="content-edit-pop">
				<view class="button-box">
					<view class="file-name">{{uploadSuccessFilePath}}</view>
					<button size="mini" type="primary" @click="copyImage">复制</button>
					<button size="mini" type="primary" @click="uploadImage">上传图片</button>
				</view>
				<view id="editor"></view>
				<view class="button-box">
					<button size="mini" type="primary" @click="returnContent">确定</button>
					<button size="mini" type="default" @click="closeEditPop(1)">取消编辑</button>
				</view>
			</view>
		</uni-popup>
		<!-- 选择标签弹窗 -->
		<uni-popup ref="labelPop" type="center">
			<view class="label-pop">
				<view class="content-text">
					<uni-easyinput type="text" v-model="labelText" />
					<button size="mini" type="primary" @click="addLabel">添加标签</button>
				</view>
				<scroll-view scroll-y="true" style="height: 500rpx;">
					<view class="label-list">
						<uni-tag v-for="(item,index) in labelList" size="small" :inverted="!item.check"
							:text="item.name" type="primary" :style="{'margin-right':'20rpx'}"
							@click="item.check = !item.check" />
					</view>
				</scroll-view>
				<button size="mini" type="primary" @click="selectLabel">确定</button>
			</view>
		</uni-popup>
		<!-- 查看选项弹窗 -->
		<uni-popup ref="optionPop" type="center">
			<view class="option-pop">
				<view class="option-block" v-for="(item,index) in optionList">
					<l-parse :content="item.content"></l-parse>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import LParse from '@/components/li-parse/parse'
	import wangeditor from '@/uni_modules/wangeditor'
	export default {
		components: {
			LParse
		},
		data() {
			return {
				creater: uni.getStorageSync('lastUsername'),
				labelText: '',
				labelList: [],
				searchVal: '',
				tableData: [],
				optionList: [],
				// 每页数据量
				pageSize: 15,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: false,
				editFormData: {},
				coverUploadUrl: {},
				typeOption: [{
					text: '多选',
					value: 0
				}, {
					text: '单选',
					value: 1
				}, {
					text: '问答题',
					value: 2
				}],
				levelOption: [{
					text: '初级',
					value: 0,
				}, {
					text: '中级',
					value: 1,
				}, {
					text: '高级',
					value: 2,
				}],
				popStatus: '',
				rules: {
					title: {
						rules: [{
							required: true,
							errorMessage: '请输入题目',
						}]
					},
					answer: {
						rules: [{
							required: true,
							errorMessage: '请输入答案',
						}]
					},
				},
				// 正在编辑的信息
				editInfo: {},
				// 富文本编辑器
				contentEditor: '',
				editIndex: '',
				uploadSuccessFilePath: '',

			}
		},
		mounted() {
			this.getList()
			this.initEditFormData()
			this.getLabelList()
		},
		methods: {
			// 查看选项
			viewOption(data) {
				this.optionList = data
				this.$refs.optionPop.open()
			},
			// 上下页切换
			pageChange(e) {
				this.pageCurrent = e.current
				this.getList()
			},
			// 确定选择标签
			selectLabel() {
				let ary = []
				this.labelList.forEach(item => {
					if (item.check) {
						ary.push(item.name)
					}
				})
				this.editFormData.label = ary.join(',')
				this.$refs.labelPop.close()
			},
			// 添加标签
			addLabel() {
				let label = this.labelList.map(item => {
					return item.name
				})

				if (label.includes(this.labelText)) {
					uni.showToast({
						title: "该标签已存在",
						icon: "none"
					})
					return
				}
				this.$request('addLabel', {
					name: this.labelText
				}, {
					functionName: 'add'
				}).then(res => {
					console.log("res,success----", res)
					if (res.code == 200) {
						uni.showToast({
							title: "新增成功"
						})
						this.labelText = ''
						this.getLabelList()
					}
				})
			},
			// 获取标签列表
			getLabelList() {
				this.$request('getLabelList', '', {
					functionName: 'get'
				}).then(res => {
					if (res.code == 200) {
						let list = res.data
						this.labelList = list.map(item => {
							item.check = false
							return item
						})
						this.checkMySelectLabel()
					}
				})
			},
			// 检测我已选中的标签
			checkMySelectLabel() {
				let list = this.labelList
				let select = this.editFormData.label.split(',')
				list.map(item => {
					item.check = select.includes(item.name)
				})
			},
			// 打开标签选择弹窗
			openLabelSelectPop() {
				this.$refs.labelPop.open()
				this.checkMySelectLabel()
			},
			// 删除选项
			deleteOption(index) {
				this.editFormData.option.splice(index, 1)
			},
			// 新增选项
			addOption() {
				this.editFormData.option.push({
					content: ''
				})
			},
			// 打开编辑器弹窗
			openEditContentPop(item, index) {
				console.log("item", item)
				let that = this
				this.editIndex = index
				this.$refs.contentPop.open()
				this.$nextTick(() => {
					this.contentEditor = new wangeditor('#editor')
					this.contentEditor.config.showLinkImgAlt = false
					this.contentEditor.config.showLinkImgHref = false
					this.contentEditor.create()
					this.contentEditor.txt.html(item)
				})
			},
			// 返回富文本框结果
			returnContent() {
				let index = this.editIndex
				let content = this.contentEditor.txt.html()
				if (index == -1) {
					this.editFormData.title = content
				} else {
					if (this.editFormData.type === 2) {
						this.editFormData.answer = content
					} else {
						this.editFormData.option[index].content = content
					}
				}
				this.closeEditPop(1)
				this.editIndex = ''
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
			// 关闭编辑弹窗
			closeEditPop(type) {
				if (type === 0) {
					this.$refs.editPop.close()
				} else if (type === 1) {
					this.$refs.contentPop.close()
					this.editIndex = ''
				}
			},
			// 确认修改
			submitEdit() {
				this.$refs.editInfo.validate().then(e => {
					console.log("res----", this.editFormData)
					this.$request('editTopic', this.editFormData, {
							functionName: 'edit'
						}).then(res => {
							console.log("res,success----", res)
							if (res.code == 200) {
								this.initEditFormData()
								this.$refs.editPop.close()
								this.getList()
							}
						})
						.catch(res => {
							console.log("res,error----", res)
						})
				}).catch(err => {
					console.log('表单错误信息：', err);
				})
			},
			// 新增题目
			submitadd() {
				this.$refs.editInfo.validate().then(e => {
					console.log("res----", e)
					this.$request('addTopic', this.editFormData, {
							functionName: 'add'
						}).then(res => {
							console.log("res,success----", res)
							if (res.code == 200) {
								this.initEditFormData()
								this.$refs.editPop.close()
								this.getList()
							}
						})
						.catch(res => {
							console.log("res,error----", res)
						})
				}).catch(err => {
					console.log('表单错误信息：', err);
				})
			},

			// 删除题目
			deleteTopic(item) {
				uni.showModal({
					title: "提示",
					content: "是否要删除该题目?",
					success: res => {
						this.$request('topic', item, {
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
			// 打开新增书籍弹窗
			addNewTopic() {
				this.popStatus = 'add'
				this.initEditFormData()
				this.$refs.editPop.open()
			},
			// 初始化表格数据
			initEditFormData() {
				this.editFormData = {
					title: "",
					type: 0,
					author: "",
					creater: this.creater,
					label: "",
					level: 0,
					option: [{
						content: ''
					}],
					answer: "",
				}
				this.coverUploadUrl = {}
			},
			// 打开编辑内容弹窗
			toEditContent(item) {
				uni.navigateTo({
					url: "/pages/book/content?id=" + item.id
				})
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
				this.$request('getTopicList', {
					page: this.pageCurrent,
					limit: this.pageSize,
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

	.option-pop {
		width: 1000rpx;
		padding: 80rpx;
		background-color: #fff;
		border-radius: 8rpx;
		max-height: 500px;
		overflow-y: scroll;
		overflow-x: hidden;
		.option-block{
			background-color: #f4f4f4;
			padding: 20rpx;
			border-radius: 10rpx;
			margin-bottom: 10rpx;
		}
	}

	.edit-pop {
		width: 1000rpx;
		padding: 80rpx;
		background-color: #fff;
		border-radius: 8rpx;
		max-height: 500px;
		overflow-y: scroll;
		overflow-x: hidden;
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

	.content-text {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
		width: 90%;

		view {
			display: block;
			width: 70%;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}

		button {
			margin-left: 20rpx;
			flex-shrink: 0;
		}
	}

	.content-edit-pop {
		width: 70%;
		background-color: #fff;
		padding: 80rpx;
		border-radius: 8rpx;
		margin: 0 auto;

		.button-box {
			width: 100%;
			display: flex;
			justify-content: flex-end;
			margin-bottom: 40rpx;
			position: relative;

			.file-name {
				width: 80%;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
				position: absolute;
				left: 0;
			}

			button {
				margin: 0 20rpx;
			}
		}
	}

	.label-pop {
		width: 1000rpx;
		background-color: #fff;
		padding: 50rpx;
		border-radius: 16rpx;

		.label-list {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
		}
	}
</style>
