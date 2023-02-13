/**
 * @description parse style html
 * @author wangfupeng
 */
import { Descendant } from 'slate';
import { IDomEditor } from '@/uni_modules/wangeditor/core';
import { DOMElement } from '../../utils/dom';
export declare function parseStyleHtml(elem: DOMElement, node: Descendant, editor: IDomEditor): Descendant;
