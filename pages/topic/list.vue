<template>
	<view>
		<view class="uni-header">
			<view class="uni-group hide-on-phone"><view class="uni-title">题目列表</view></view>
			<view class="uni-group">
				<!-- <input class="uni-search" type="text" v-model="searchVal" @confirm="search"
					:placeholder="$t('common.placeholder.query')" />
				<button class="uni-button" type="default" size="mini"
					@click="search">{{$t('common.button.search')}}</button> -->
				<button class="uni-button" type="primary" size="mini" @click="addNewTopic">{{ $t('common.button.add') }}</button>
			</view>
		</view>
		<view class="uni-container">
			<uni-table :loading="loading" border stripe :emptyText="$t('common.empty')">
				<uni-tr>
					<uni-th width="100" align="center">题目</uni-th>
					<uni-th width="80" align="center">类型</uni-th>
					<uni-th align="center">等级</uni-th>
					<uni-th align="center">标签</uni-th>
					<uni-th align="center">选项</uni-th>
					<uni-th align="center">答案</uni-th>
					<uni-th align="center">操作</uni-th>
				</uni-tr>
				<uni-tr v-for="(item, index) in tableData" :key="index">
					<uni-td style="max-width: 800rpx;">
						<scroll-view scroll-y style="max-height: 300rpx;"><n-html :content="item.title"></n-html></scroll-view>
					</uni-td>
					<uni-td align="center">
						<view class="name">{{ item.type === 0 ? '多选' : item.type === 1 ? '单选' : '问答题' }}</view>
					</uni-td>
					<uni-td align="center">{{ item.level === 0 ? '初级' : item.level === 1 ? '中级' : '高级' }}</uni-td>
					<uni-td align="center">{{ item.label }}</uni-td>
					<uni-td align="center">
						<view v-if="item.type === 2" class="name">-</view>
						<button v-else class="uni-button" size="mini" type="primary" @click="viewOption(item.option)">查看选项</button>
					</uni-td>
					<uni-td align="center">
						<button v-if="item.type === 2" class="uni-button" size="mini" type="primary">查看答案</button>
						<view v-else class="name">{{ item.answer }}</view>
					</uni-td>
					<uni-td>
						<view class="uni-group">
							<button class="uni-button" size="mini" type="primary" @click="openEditPop(item)">{{ $t('common.button.edit') }}</button>
							<button class="uni-button" size="mini" type="warn" @click="deleteTopic(item)">{{ $t('common.button.delete') }}</button>
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
			<view class="uni-pagination-box"><uni-pagination show-icon :page-size="pageSize" :current="pageCurrent" :total="total" @change="pageChange" /></view>
		</view>
		<uni-popup ref="editPop" type="center" :maskClick="false">
			<view class="edit-pop">
				<uni-title type="h1" :title="popStatus == 'add' ? '新增' : '编辑'" align="center" style="margin-bottom: 40rpx;"></uni-title>
				<uni-forms ref="editInfo" :modelValue="editFormData" :rules="rules">
					<uni-forms-item label="题目" name="id">
						<view class="content-text">
							<view>{{ editFormData.title }}</view>
							<button class="uni-button" size="mini" type="primary" @click="openEditContentPop(editFormData.title, 'title')">编辑标题</button>
						</view>
					</uni-forms-item>
					<uni-forms-item label="类型" name="type"><uni-data-checkbox mode="tag" v-model="editFormData.type" :localdata="typeOption"></uni-data-checkbox></uni-forms-item>
					<uni-forms-item label="等级" name="level">
						<uni-data-checkbox mode="tag" v-model="editFormData.level" :localdata="levelOption"></uni-data-checkbox>
					</uni-forms-item>
					<uni-forms-item label="标签" name="label">
						<view class="content-text">
							<uni-easyinput type="text" placeholder="请选择标签" disabled :styles="{ disableColor: '#fff' }" v-model="editFormData.label" />
							<button class="uni-button" size="mini" type="primary" @click="openLabelSelectPop">选择标签</button>
						</view>
					</uni-forms-item>
					<uni-forms-item label="选项" v-if="editFormData.type == 0 || editFormData.type == 1">
						<checkbox-group @change="changeChecked">
							<view class="content-text" v-for="(item, index) in editFormData.option" :key="index">
								<checkbox :value="index.toString()" :checked="item.checked" style="transform:scale(0.7)" />
								<view>{{ item.content }}</view>
								<button class="uni-button" size="mini" type="primary" @click="openEditContentPop(item.content, index)">编辑内容</button>
								<button v-if="editFormData.option.length > 1" class="uni-button" size="mini" type="warn" @click="deleteOption(index)">删除</button>
							</view>
						</checkbox-group>
					</uni-forms-item>
					<uni-forms-item label="答案解析" name="analysis">
						<view class="content-text">
							<view>{{ editFormData.analysis }}</view>
							<button class="uni-button" size="mini" type="primary" @click="openEditContentPop(editFormData.analysis, 'analysis')">编辑解析</button>
						</view>
					</uni-forms-item>
				</uni-forms>
				<view class="button-box">
					<button size="mini" type="primary" @click="addOption">新增选项</button>
					<button v-show="popStatus == 'add'" size="mini" type="primary" @click="submitForm('add')">新增题目</button>
					<button v-show="popStatus == 'edit'" size="mini" type="primary" @click="submitForm('edit')">修改信息</button>
					<button size="mini" type="default" @click="closeEditPop(0)">取消</button>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="contentPop" type="center" :mask-click="false">
			<view class="content-edit-pop">
				<view class="button-box">
					<view class="file-name">{{ uploadSuccessFilePath }}</view>
					<button size="mini" type="primary" @click="copyImage">复制</button>
					<button size="mini" type="primary" @click="uploadImage">上传图片</button>
				</view>
				<n-editor :content="contentEditor" @change="editorChange"></n-editor>
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
						<uni-tag
							v-for="(item, index) in labelList"
							size="small"
							:inverted="!item.check"
							:text="item.name"
							type="primary"
							:style="{ margin: '10rpx' }"
							@click="item.check = !item.check"
						/>
					</view>
				</scroll-view>
				<button size="mini" type="primary" @click="selectLabel">确定</button>
			</view>
		</uni-popup>
		<!-- 查看选项弹窗 -->
		<uni-popup ref="optionPop" type="center">
			<view class="option-pop">
				<view class="option-block" v-for="(item, index) in optionList"><n-html :content="item.content"></n-html></view>
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
			typeOption: [
				{
					text: '多选',
					value: 0
				},
				{
					text: '单选',
					value: 1
				},
				{
					text: '问答题',
					value: 2
				}
			],
			levelOption: [
				{
					text: '初级',
					value: 0
				},
				{
					text: '中级',
					value: 1
				},
				{
					text: '高级',
					value: 2
				}
			],
			popStatus: '',
			rules: {
				title: {
					rules: [
						{
							required: true,
							errorMessage: '请输入题目'
						}
					]
				},
				answer: {
					rules: [
						{
							required: true,
							errorMessage: '请输入答案'
						}
					]
				}
			},
			// 富文本编辑器
			contentEditor: '',
			editIndex: '',
			uploadSuccessFilePath: ''
		};
	},
	mounted() {
		this.getList();
		this.initEditFormData();
		this.getLabelList();
	},
	methods: {
		// 选择答案
		changeChecked(e) {
			let value = e.detail.value;
			this.editFormData.option.map((item, index) => {
				item.checked = value.includes(index.toString());
				return item;
			});
		},
		// 查看选项
		viewOption(data) {
			this.optionList = data;
			this.$refs.optionPop.open();
		},
		// 上下页切换
		pageChange(e) {
			this.pageCurrent = e.current;
			this.getList();
		},
		// 确定选择标签
		selectLabel() {
			let ary = [];
			this.labelList.forEach(item => {
				if (item.check) {
					ary.push(item.name);
				}
			});
			this.editFormData.label = ary.join(',');
			this.$refs.labelPop.close();
			console.log('editFormData——————————>', this.editFormData);
		},
		// 添加标签
		async addLabel() {
			const labelNames = this.labelList.map(item => item.name);
			if (labelNames.includes(this.labelText)) {
				uni.showToast({
					title: '该标签已存在',
					icon: 'none'
				});
				return;
			}
			try {
				const res = await this.$request('addLabel', { name: this.labelText }, { functionName: 'admin' });
				console.log('res, success----', res);
				if (res.code === 200) {
					uni.showToast({
						title: '新增成功'
					});
					this.labelText = '';
					this.getLabelList();
				}
			} catch (error) {
				console.log('res, error----', error);
			}
		},
		// 获取标签列表
		getLabelList() {
			this.$request('getLabelList', '', {
				functionName: 'get'
			}).then(res => {
				if (res.code == 200) {
					let list = res.data;
					this.labelList = list.map(item => {
						item.check = false;
						return item;
					});
					this.checkMySelectLabel();
				}
			});
		},
		// 检测我已选中的标签
		checkMySelectLabel() {
			let list = this.labelList;
			let select = this.editFormData.label.split(',');
			list.map(item => {
				item.check = select.includes(item.name);
			});
		},
		// 打开标签选择弹窗
		openLabelSelectPop() {
			this.$refs.labelPop.open();
			this.checkMySelectLabel();
		},
		// 删除选项
		deleteOption(index) {
			this.editFormData.option.splice(index, 1);
		},
		// 新增选项
		addOption() {
			this.editFormData.option.push({
				content: ''
			});
		},
		// 编辑器内容
		editorChange(text) {
			this.contentEditor = text;
		},
		// 打开编辑器弹窗
		openEditContentPop(item, index) {
			console.log('item', item);
			let that = this;
			this.editIndex = index;
			this.$refs.contentPop.open();
			this.contentEditor = item;
		},
		// 返回富文本框结果
		returnContent() {
			const { editIndex, contentEditor, editFormData } = this;
			switch (editIndex) {
				case 'title':
					editFormData.title = contentEditor;
					break;
				case 'analysis':
					editFormData.analysis = contentEditor;
					break;
				default:
					if (editFormData.type === 2) {
						editFormData.answer = contentEditor;
					} else {
						editFormData.option[editIndex].content = contentEditor;
					}
					break;
			}
			this.closeEditPop(1);
			this.editIndex = '';
		},
		// 上传图片
		uploadImage() {
			uni.chooseImage({
				count: 1,
				success: res => {
					let filePath = res.tempFilePaths[0];
					uniCloud
						.uploadFile({
							cloudPath: res.tempFiles[0].name,
							filePath
						})
						.then(res => {
							console.log('服务器地址', res);
							this.uploadSuccessFilePath = res.fileID;
						});
				}
			});
		},
		// 复制内容
		copyImage() {
			uni.setClipboardData({
				data: this.uploadSuccessFilePath,
				success: () => {
					uni.showToast({
						title: '复制成功'
					});
				}
			});
		},
		// 关闭编辑弹窗
		closeEditPop(type) {
			if (type === 0) {
				this.$refs.editPop.close();
			} else if (type === 1) {
				this.$refs.contentPop.close();
				this.editIndex = '';
			}
		},
		submitForm(action) {
			let data = this.handleSubmit();
			this.$refs.editInfo
				.validate()
				.then(() => {
					console.log('res----', data);
					const apis = {
						edit: 'editTopic',
						add: 'addTopic'
					};
					const api = apis[action];
					if (!api) {
						throw new Error(`Invalid action: ${action}`);
					}
					return this.$request(api, data, {
						functionName: 'admin'
					});
				})
				.then(res => {
					console.log('res,success----', res);
					if (res.code == 200) {
						this.initEditFormData();
						this.$refs.editPop.close();
						this.getList();
					}
				})
				.catch(err => {
					console.log('表单错误信息：', err);
				});
		},
		// 处理数据提交
		handleSubmit() {
			const { option, ...restData } = this.editFormData;
			const answer = option.reduce((acc, curr, index) => {
				if (curr.checked) {
					acc += index.toString();
				}
				return acc;
			}, '');
			console.log('option', option);
			console.log('answer', answer);
			const newOption = option.map(item => ({
				content: item.content
			}));
			return {
				...restData,
				option: newOption,
				answer
			};
		},

		// 删除题目
		deleteTopic(item) {
			uni.showModal({
				title: '提示',
				content: '是否要删除该题目?',
				success: res => {
					this.$request('topic', item, {
						functionName: 'remove'
					})
						.then(res => {
							if (res.code == 200) {
								uni.showToast({
									title: '删除成功!如果误删请联系管理员',
									duration: 1500,
									icon: 'none',
									mask: true
								});
								setTimeout(() => {
									this.initEditFormData();
									this.$refs.editPop.close();
									this.getList();
								}, 1500);
							}
						})
						.catch(err => {
							console.log('表单错误信息：', err);
						});
				}
			});
		},
		// 打开新增书籍弹窗
		addNewTopic() {
			this.popStatus = 'add';
			this.initEditFormData();
			this.$refs.editPop.open();
		},
		// 初始化表格数据
		initEditFormData() {
			this.editFormData = {
				title: '',
				type: 1,
				author: '',
				creater: this.creater,
				label: '',
				level: 0,
				option: [
					{
						checked: false,
						content: ''
					}
				],
				answer: '',
				analysis: ''
			};
			this.coverUploadUrl = {};
		},
		// 打开编辑内容弹窗
		toEditContent(item) {
			uni.navigateTo({
				url: '/pages/book/content?id=' + item.id
			});
		},
		// 打开编辑弹窗
		openEditPop(item) {
			this.popStatus = 'edit';
			this.editFormData = this.handleShow(JSON.parse(JSON.stringify(item)));
			this.coverUploadUrl = {
				url: item.cover
			};
			this.$refs.editPop.open();
		},
		// 处理数据回显
		handleShow(data) {
			data.label = typeof data.label != 'string' ? data.label.join(',') : data.label;
			let answer = data.answer.split('');
			data.option.map((item, index) => {
				console.log(answer, index, answer.includes(index.toString()));
				item.checked = answer.includes(index.toString());
				return item;
			});
			return data;
		},
		// 多选处理
		selectedItems() {
			return this.selectedIndexs.map(i => this.tableData[i]);
		},
		// 多选
		selectionChange(e) {
			console.log(e.detail.index);
			this.selectedIndexs = e.detail.index;
		},
		getList() {
			uni.showLoading({
				title: '数据加载中...',
				mask: true
			});
			this.$request(
				'getTopicList',
				{
					page: this.pageCurrent,
					limit: this.pageSize,
					creater: this.creater == 'admin' ? '' : this.creater
				},
				{
					functionName: 'admin'
				}
			).then(res => {
				this.total = res.total;
				this.tableData = res.data;
				this.tableData.map(item => {
					console.log(typeof item.label);
					if (typeof item.label == 'object') {
						item.label = item.label.join(',');
					}
				});
				uni.hideLoading();
			});
		}
	}
};
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
	padding: 80rpx 80rpx 0;
	background-color: #fff;
	border-radius: 8rpx;
	max-height: 500px;
	overflow-y: scroll;
	overflow-x: hidden;
	position: relative;
}

.button-box {
	width: 100%;
	display: flex;
	justify-content: flex-end;
	padding: 30rpx 0;
	background-color: #fff;
	position: sticky;
	bottom: 0;

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
