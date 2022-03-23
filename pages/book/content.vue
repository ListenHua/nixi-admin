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
						<button class="uni-button" size="mini" type="warn">{{$t('common.button.delete')}}</button>
					</view>
				</uni-td>
			</uni-tr>
		</uni-table>
		<uni-popup ref="contentPop" type="center">
			<view class="content-edit-pop">
				<uni-easyinput type="text" v-model="contentText.title" />
				<view id="editor"></view>
				<view class="button-box">
					<button size="mini" type="primary" @click="addBookContent">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import wangeditor from 'wangeditor'
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
				editStatus: "",
				editContent: "",
				editIndex: "",
				bookId: '',
			}
		},
		onLoad(option) {
			this.bookId = option.id
			this.getData()
		},
		methods: {
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
			// 确定编辑
			addBookContent() {
				let list = this.bookInfo.list
				let index = this.editIndex
				this.contentText.content = this.contentEditor.txt.html()
				if (index.toString()) {
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
					this.$refs.contentPop.close()
					this.contentText = {
						title: "",
						content: ""
					}
					this.getData()
				})
			},
			// 打开编辑器弹窗
			openEditContentPop(item, index) {
				console.log("????", item, index);
				if (item && index.toString()) {
					this.editStatus = 'edit'
					this.editIndex = index
				} else {
					this.editStatus = 'add'
				}
				this.$refs.contentPop.open()
				this.$nextTick(() => {
					this.contentEditor = new wangeditor('#editor')
					this.contentEditor.create()
					if (this.editStatus == 'edit') {
						console.log("???")
						this.contentEditor.txt.html(item.content)
						this.contentText.title = item.title
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
		background-color: #fff;
		padding: 80rpx;
		border-radius: 8rpx;
	}

	.button-box {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin: 40rpx 0;

		button {
			margin: 0;
		}
	}
</style>
