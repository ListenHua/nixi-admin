<template>
	<view class="page-content">
		<!-- <view class="button-box">
			<button size="mini" type="primary" @click="openEditContentPop">新增</button>
		</view> -->
		<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
			<uni-tr>
				<uni-th align="center">头像</uni-th>
				<uni-th align="center">昵称</uni-th>
				<uni-th align="center">权限</uni-th>
				<uni-th align="center">等级</uni-th>
				<uni-th align="center">创建日期</uni-th>
				<uni-th align="center">最后上线日期</uni-th>
				<uni-th align="center">操作</uni-th>
			</uni-tr>
			<uni-tr v-for="(item ,index) in userList" :key="index">
				<uni-td align="center">
					<image class="head" :src="item.avatarUrl" mode="aspectFill"></image>
				</uni-td>
				<uni-td align="center">
					<view class="name">{{item.nickName}}</view>
				</uni-td>
				<uni-td align="center">
					<view class="name">{{item.role}}</view>
				</uni-td>
				<uni-td align="center">
					<view class="name">{{item.level}}</view>
				</uni-td>
				<uni-td align="center">
					<view class="name">{{item.createTime}}</view>
				</uni-td>
				<uni-td align="center">
					<view class="name">{{item.updateTime}}</view>
				</uni-td>
				<uni-td>
					<view class="uni-group">
						<picker :range="roleOption" range-key="name" @change="changeRole($event,index)">
							<button class="uni-button" size="mini" type="primary">设置权限</button>
						</picker>
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
	import dayjs from 'dayjs'
	export default {
		data() {
			return {
				userList: [],
				// 每页数据量
				pageSize: 15,
				// 当前页
				pageCurrent: 1,
				// 数据总量
				total: 0,
				loading: true,
				roleIndex: 0,
				roleOption: [{
					name: "普通用户",
					role: 0,
				}, {
					name: "优先体验者",
					role: 1
				}, {
					name: "运营人员",
					role: 2
				}, {
					name: "管理员",
					role: 9
				}]
			}
		},
		onLoad() {
			this.getData()
		},
		methods: {
			// 设置权限
			changeRole(e, index) {
				console.log(e, index);
				this.roleIndex = e.detail.value
				let params = {
					role: this.roleOption[this.roleIndex].role,
					user: this.userList[index]._id
				}
				this.$request('setUserRole', params, {
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
					size: this.pageSize
				}
				this.$request('microUser', params, {
					functionName: 'admin'
				}).then(res => {
					console.log(res);
					this.total = res.total
					let list = res.data.map(item => {
						item.createTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
						item.updateTime = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
						return item
					})
					this.userList = list
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
