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
					<uni-th width="300" align="center">问题</uni-th>
					<uni-th align="center">等级</uni-th>
					<uni-th width="80" align="center">类型</uni-th>
					<uni-th align="center">专题</uni-th>
					<uni-th align="center">速度</uni-th>
					<uni-th align="center">按钮</uni-th>
					<uni-th align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index">
					<uni-td align="center">{{item.text}}</uni-td>
					<uni-td align="center">{{item.level===1?'初级':item.level===2?'中级':'高级'}}</uni-td>
					<uni-td align="center">
						<view v-if="item.type==='ask'" class="name">问答</view>
						<view v-else-if="item.type==='talk'" class="name">对话</view>
					</uni-td>
					<uni-td align="center">{{item.key}}</uni-td>
					<uni-td align="center">{{item.speed}}</uni-td>
					<uni-td align="center">{{item.button}}</uni-td>
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
					<uni-forms-item label="题目" name="text">
						<view class="content-text">
							<uni-easyinput placeholder="请输入问题" v-model="editFormData.text" />
						</view>
					</uni-forms-item>
					<uni-forms-item label="等级" name="level">
						<uni-data-checkbox mode="tag" v-model="editFormData.level" :localdata="levelOption">
						</uni-data-checkbox>
					</uni-forms-item>
					<uni-forms-item label="专题" name="label">
						<view class="content-text">
							<uni-data-checkbox mode="tag" v-model="editFormData.key" :localdata="typeOption">
							</uni-data-checkbox>
						</view>
					</uni-forms-item>
					<uni-forms-item label="速度">
						<uni-easyinput type="number" placeholder="请输入展示速度" v-model="editFormData.speed" />
					</uni-forms-item>
					<uni-forms-item label="角色">
						<uni-easyinput disabled type="text" v-model="editFormData.talker" />
					</uni-forms-item>
					<uni-forms-item label="方式">
						<uni-data-checkbox mode="tag" v-model="editFormData.type" :localdata="talkOption">
						</uni-data-checkbox>
					</uni-forms-item>
					<uni-forms-item v-if="editFormData.type=='ask'" label="按钮文本">
						<uni-easyinput type="text" placeholder="请输入按钮文本" v-model="editFormData.button" />
					</uni-forms-item>
				</uni-forms>
				<view class="button-box">
					<button v-show="popStatus=='add'" size="mini" type="primary" @click="submitadd">新增题目</button>
					<button v-show="popStatus=='edit'" size="mini" type="primary" @click="submitEdit">修改信息</button>
					<button size="mini" type="default" @click="closeEditPop(0)">取消</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	
	export default {
		data() {
			return {
				creater: uni.getStorageSync('lastUsername'),
				labelText: '',
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
				typeOption: [],
				talkOption: [{
					text: '问答',
					value: 'ask',
				}, {
					text: '谈话',
					value: 'talk',
				}],
				levelOption: [{
					text: '初级',
					value: 1,
				}, {
					text: '中级',
					value: 2,
				}, {
					text: '高级',
					value: 3,
				}],
				popStatus: '',
				rules: {
					text: {
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

			}
		},
		mounted() {
			this.getList()
			this.initEditFormData()
			this.getTypeList()
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
			selectLabel(index) {
				this.typeList.map((item, i) => {
					item.check = index == i ? true : false
				})
			},
			// 获取标签列表
			getTypeList() {
				this.$request('getSimulationList', '', {
					functionName: 'admin'
				}).then(res => {
					console.log(res);
					if (res.code == 200) {
						let list = res.data
						this.typeOption = list.map(item => {
							let obj = {
								text: item.title,
								value: item.key
							}
							return obj
						})
					}
				})
			},
			// 打开标签选择弹窗
			openLabelSelectPop() {
				this.$refs.labelPop.open()
			},
			// 确认修改
			submitEdit() {
				this.$refs.editInfo.validate().then(e => {
					this.$request('editSimulationTopic', this.editFormData, {
							functionName: 'admin'
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
					this.$request('addSimulationTopic', this.editFormData, {
							functionName: 'admin'
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
						this.$request('deleteSimulationTopic', item, {
							functionName: 'admin'
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
			// 打开新增题目弹窗
			addNewTopic() {
				this.popStatus = 'add'
				this.initEditFormData()
				this.$refs.editPop.open()
			},
			// 初始化表格数据
			initEditFormData() {
				this.editFormData = {
					text: "",
					type: 'ask',
					talker: "hr",
					creater: this.creater,
					level: 1,
					key: '',
					button: '回答',
					speed: 100,
				}
			},
			// 打开编辑弹窗
			openEditPop(item) {
				this.popStatus = 'edit'
				this.editFormData = JSON.parse(JSON.stringify(item))
				this.$refs.editPop.open()
			},
			getList() {
				uni.showLoading({
					title: "数据加载中...",
					mask: true
				})
				this.$request('getSimulationTopic', {
					page: this.pageCurrent,
					limit: this.pageSize,
					creater: this.creater == 'admin' ? 'admin' : this.creater
				}, {
					functionName: 'admin'
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

		.option-block {
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
