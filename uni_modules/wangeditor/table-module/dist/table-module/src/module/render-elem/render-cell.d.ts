/**
 * @description render cell
 * @author wangfupeng
 */
import { Element as SlateElement } from 'slate';
import { VNode } from 'snabbdom';
import { IDomEditor } from '@/uni_modules/wangeditor/core';
declare function renderTableCell(cellNode: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode;
export default renderTableCell;
