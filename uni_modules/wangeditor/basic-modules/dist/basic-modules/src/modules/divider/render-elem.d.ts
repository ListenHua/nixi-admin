/**
 * @description render divider elem
 * @author wangfupeng
 */
import { Element as SlateElement } from 'slate';
import { VNode } from 'snabbdom';
import { IDomEditor } from '@/uni_modules/wangeditor/core';
declare function renderDivider(elemNode: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode;
declare const renderDividerConf: {
    type: string;
    renderElem: typeof renderDivider;
};
export { renderDividerConf };
