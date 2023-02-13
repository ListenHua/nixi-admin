/**
 * @description render table
 * @author wangfupeng
 */
import { Element as SlateElement } from 'slate';
import { VNode } from 'snabbdom';
import { IDomEditor } from '@/uni_modules/wangeditor/core';
declare function renderTable(elemNode: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode;
export default renderTable;
