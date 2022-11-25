<template>
	<view class="page-content">
		<!-- <view class="button-box">
			<button size="mini" type="primary" @click="openEditContentPop">新增</button>
		</view> -->
		<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
			<uni-tr>
				<uni-th align="center">题目</uni-th>
				<uni-th align="center">回答内容</uni-th>
				<uni-th align="center">提交者</uni-th>
				<uni-th align="center">状态</uni-th>
				<uni-th align="center">创建日期</uni-th>
				<uni-th align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item ,index) in analysisList" :key="index">
				<uni-td align="center">
					<scroll-view scroll-y style="max-height: 300rpx;">
						<l-parse :content="item.topic.title"></l-parse>
					</scroll-view>
				</uni-td>
				<uni-td align="center">
					<scroll-view scroll-y style="max-height: 300rpx;">
						<l-parse :content="item.content"></l-parse>
					</scroll-view>
				</uni-td>
				<uni-td align="center">
					<view class="name">{{item.author.nickName}}({{item.author.id}})</view>
				</uni-td>
				<uni-td align="center">
					<uni-tag v-if="item.status==0" text="未审核" type="warning" size="small"></uni-tag>
					<uni-tag v-else-if="item.status==1" text="正常" type="primary" size="small"></uni-tag>
					<uni-tag v-else-if="item.status==2" text="异常" type="error" size="small"></uni-tag>
				</uni-td>
				<uni-td align="center">
					<view class="name">{{item.createTime}}</view>
				</uni-td>
				<uni-td>
					<view class="uni-group">
						<picker :range="statusOption" range-key="name" @change="changeRole($event,index)">
							<button class="uni-button" size="mini" type="primary">设置状态</button>
						</picker>
						<button class="uni-button" size="mini" type="warn" @click="deleteAnalysis(item._id)">删除</button>
					</view>
				</uni-td>
			</uni-tr>
		</uni-table>
		<view class="uni-pagination-box">
			<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total"
				@change="pageChange" />
		</view>
	</view>
</template>

<script>
	import LParse from '@/components/li-parse/parse'
	import dayjs from 'dayjs'
	export default {
		components: {
			LParse
		},
		data() {
			return {
				analysisList: [],
				// 每页数据量
				pageSize: 15,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: true,
				statusIndex: 0,
				statusOption: [{
					name: "未审核",
					role: 0,
				}, {
					name: "正常",
					role: 1
				}, {
					name: "异常",
					role: 2
				}]
			}
		},
		onLoad() {
			this.getData()
		},
		methods: {
			// 删除分析
			deleteAnalysis(id) {
				let params = {
					id
				}
				uni.showModal({
					title: "警告",
					content: "是否要删除该题目分析?",
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: "删除中"
							})
							this.$request('deleteAnalysis', params, {
								functionName: 'admin'
							}).then(res => {
								uni.showToast({
									title: res.msg
								})
								this.getData()
							}).catch(() => {
								uni.hideLoading()
							})
						}
					}
				})
			},
			// 上下页切换
			pageChange(e) {
				this.pageCurrent = e.current
				this.getData()
			},
			// 设置权限
			changeRole(e, index) {
				this.statusIndex = e.detail.value
				let params = {
					status: this.statusOption[this.statusIndex].role,
					id: this.analysisList[index]._id
				}
				this.$request('setAnalysisStatus', params, {
					functionName: 'admin'
				}).then(res => {
					uni.showToast({
						title: res.msg
					})
					this.getData()
				})
			},
			// 获取数据
			getData() {
				this.loading = true
				let params = {
					page: this.pageCurrent,
					limit: this.pageSize
				}
				this.$request('topicAnalysis', params, {
					functionName: 'admin'
				}).then(res => {
					console.log(res);
					this.total = res.total
					let list = res.data.map(item => {
						item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
						return item
					})
					this.analysisList = list
					this.loading = false
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.page-content {
		padding: 40rpx;
	}

	.head {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
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
