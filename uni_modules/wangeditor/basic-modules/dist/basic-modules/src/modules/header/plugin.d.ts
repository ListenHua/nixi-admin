/**
 * @description editor 插件，重写 editor API
 * @author wangfupeng
 */
import { IDomEditor } from '@/uni_modules/wangeditor/core';
declare function withHeader<T extends IDomEditor>(editor: T): T;
export default withHeader;