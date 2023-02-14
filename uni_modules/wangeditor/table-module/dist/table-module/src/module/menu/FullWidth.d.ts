/**
 * @description table full width menu
 * @author wangfupeng
 */
import { IButtonMenu, IDomEditor } from '@/uni_modules/wangeditor/core';
declare class TableFullWidth implements IButtonMenu {
    readonly title: string;
    readonly iconSvg = "<svg viewBox=\"0 0 1228 1024\"><path d=\"M862.514337 563.200461H404.581995v121.753478a13.311987 13.311987 0 0 1-6.655993 11.468789 10.23999 10.23999 0 0 1-12.083188-1.433599l-204.799795-179.199821a13.721586 13.721586 0 0 1 0-20.479979l204.799795-179.302221a10.23999 10.23999 0 0 1 12.185588-1.535998 13.209587 13.209587 0 0 1 6.553593 11.673588v115.097485h457.932342V319.693504a11.571188 11.571188 0 0 1 18.841582-10.239989l204.799795 179.19982a13.721586 13.721586 0 0 1 0 20.47998l-204.799795 179.199821a10.23999 10.23999 0 0 1-12.185588 1.535998 13.311987 13.311987 0 0 1-6.655994-11.571188V563.200461zM136.499064 14.951409v993.893406a15.257585 15.257585 0 0 1-15.155185 15.052785H15.155185A15.155185 15.155185 0 0 1 0 1008.844815V14.951409a15.257585 15.257585 0 0 1 15.155185-15.052785h106.086294a15.155185 15.155185 0 0 1 15.257585 15.155185zM1228.798771 14.951409v993.893406a15.257585 15.257585 0 0 1-15.155185 15.052785h-106.188693a15.155185 15.155185 0 0 1-15.155185-15.052785V14.951409a15.257585 15.257585 0 0 1 15.155185-15.052785h106.086293A15.155185 15.155185 0 0 1 1228.798771 15.053809z\"></path></svg>";
    readonly tag = "button";
    getValue(editor: IDomEditor): string | boolean;
    isActive(editor: IDomEditor): boolean;
    isDisabled(editor: IDomEditor): boolean;
    exec(editor: IDomEditor, value: string | boolean): void;
}
export default TableFullWidth;