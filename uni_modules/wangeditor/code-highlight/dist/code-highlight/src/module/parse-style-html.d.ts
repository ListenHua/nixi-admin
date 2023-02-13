/**
 * @description parse style html
 * @author wangfupeng
 */
import { DOMElement } from '../utils/dom';
import { Descendant } from 'slate';
import { IDomEditor } from '@/uni_modules/wangeditor/core';
export declare function parseCodeStyleHtml(elem: DOMElement, node: Descendant, editor: IDomEditor): Descendant;
