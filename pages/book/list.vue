<template>
	<view>
		<view class="uni-header">
			<view class="uni-group hide-on-phone">
				<view class="uni-title">{{$t('demo.table.title')}}</view>
			</view>
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="searchVal" @confirm="search"
					:placeholder="$t('common.placeholder.query')" />
				<button class="uni-button" type="default" size="mini"
					@click="search">{{$t('common.button.search')}}</button>
				<button class="uni-button" type="primary" size="mini">{{$t('common.button.add')}}</button>
				<button class="uni-button" type="warn" size="mini"
					@click="delTable">{{$t('common.button.batchDelete')}}</button>
			</view>
		</view>
		<view class="uni-container">
			<uni-table :loading="loading" border stripe type="selection" :emptyText="$t('common.empty')"
				@selection-change="selectionChange">
				<uni-tr>
					<uni-th width="50" align="center">封面</uni-th>
					<uni-th width="150" align="center">ID</uni-th>
					<uni-th width="150" align="center">作者</uni-th>
					<uni-th align="center">书籍</uni-th>
					<uni-th width="304" align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item ,index) in tableData" :key="index">
					<uni-td align="center">
						<image class="table-cover" :src="item.cover" mode="aspectFill"></image>
					</uni-td>
					<uni-td align="center">
						<view class="name">{{item.id}}</view>
					</uni-td>
					<uni-td align="center">{{item.author}}</uni-td>
					<uni-td align="center">{{item.title}}</uni-td>
					<uni-td>
						<view class="uni-group">
							<button class="uni-button" size="mini" type="primary"
								@click="openEditPop(item)">{{$t('common.button.edit')}}</button>
							<button class="uni-button" size="mini" type="primary">编辑内容</button>
							<button class="uni-button" size="mini" type="warn">{{$t('common.button.delete')}}</button>
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
			<view class="uni-pagination-box">
				<uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total"
					@change="change" />
			</view>
		</view>
		<uni-popup ref="editPop" type="center">
			<view class="edit-pop">
				<view class="nav-title">修改内容</view>
				<uni-forms :modelValue="editFormData">
					<uni-forms-item label="ID" name="name">
						<uni-easyinput type="text" v-model="editFormData.id" />
					</uni-forms-item>
					<uni-forms-item label="封面" name="name">
						<uni-easyinput type="text" v-model="editFormData.cover" disabled />
						<uni-file-picker v-model="coverUploadUrl" limit="1" fileMediatype="image" mode="grid" @success="uploadCover" />
					</uni-forms-item>
					<uni-forms-item label="作者" name="name">
						<uni-easyinput type="text" v-model="editFormData.author" />
					</uni-forms-item>
					<uni-forms-item label="名称" name="name">
						<uni-easyinput type="text" v-model="editFormData.title" />
					</uni-forms-item>
				</uni-forms>
				<button size="mini" type="primary">修改信息</button>
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
				coverUploadUrl:'',
			}
		},
		mounted() {
			this.getList()
		},
		methods: {
			// 上传封面图
			uploadCover(e){
				this.editFormData.cover = e.tempFilePaths[0]
			},
			// 打开编辑弹窗
			openEditPop(item) {
				this.editFormData = item
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
				this.$request('getBookList', '', {
					functionName: 'get'
				}).then(res => {
					this.tableData = res.data
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
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx;
		background-color: #fff;
		border-radius: 8rpx;
	}
</style>
