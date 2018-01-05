/**
 * Author: Administrator
 * Date: 2016/9/20
 * Description:
 *      1. created
 */
(function ($, jconfirm) {

    $.extend(true, jconfirm.pluginDefaults, {
        title: '系统提示',
        confirmButtonClass: 'btn-primary',
        confirmButton: '确定',
        cancelButton: '取消'
    });

}(jQuery, jconfirm));