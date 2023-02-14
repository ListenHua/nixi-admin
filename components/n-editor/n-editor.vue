<template>
	<div>
		<div style="border: 1px solid #ccc; margin-top: 10px">
			<!-- 工具栏 -->
			<Toolbar style="border-bottom: 1px solid #ccc" :editor="editor" :defaultConfig="toolbarConfig" />
			<!-- 编辑器 -->
			<Editor style="height: 400px; overflow-y: hidden" :defaultConfig="editorConfig" v-model="html"
				@onChange="onChange" @onCreated="onCreated" />
		</div>
	</div>
</template>

<script>
	import {
		Editor,
		Toolbar
	} from "@/uni_modules/wangeditor/editor-for-vue";

	export default {
		props: {
			content: {
				type: String,
				default: '',
			}
		},
		components: {
			Editor,
			Toolbar
		},
		data() {
			return {
				initStatus: false,
				editor: null,
				html: "",
				toolbarConfig: {
					// toolbarKeys: [ /* 显示哪些菜单，如何排序、分组 */ ],
					// excludeKeys: [ /* 隐藏哪些菜单 */ ],
				},
				editorConfig: {
					placeholder: "请输入内容...",
					// autoFocus: false,

					// 所有的菜单配置，都要在 MENU_CONF 属性下
					MENU_CONF: {
						uploadImage: {
							base64LimitSize: 99999999999999,
						}
					},
				},
			};
		},
		methods: {
			onCreated(editor) {
				this.editor = Object.seal(editor); // 【注意】一定要用 Object.seal() 否则会报错
				this.html = this.content
			},
			onChange(editor) {
				console.log(editor.getHtml());
				this.$emit('change', editor.getHtml())
			},
		},
		mounted() {
			console.log(this.content);
		},
		beforeDestroy() {
			const editor = this.editor;
			if (editor == null) return;
			editor.destroy(); // 组件销毁时，及时销毁 editor ，重要！！！
		},
	};
</script>

<style lang="scss">

</style>
