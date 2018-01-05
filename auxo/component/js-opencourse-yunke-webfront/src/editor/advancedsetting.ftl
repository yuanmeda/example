<#assign  res=JspTaglibs["http://www.nd.com.cn/tags/resource"] />
<#import '/menu/_frame.ftl' as macro />
<#include "/opencourse/common/_menu.ftl"/>
<!DOCTYPE HTML>
<html>
<head>
    <title>高级设置</title>
<@res.include>
    <@res.css path="/auxo/addins/ztree/v3.5/css/ztreestyle/ztreestyle.css"/>
    <@res.css path="/auxo/admin/opencourse/css/${skin}/coursedetail.css"/>
    <@res.css path="/auxo/addins/bootstrap/v2.0.2/css/bootstrap.min.css"/>
    <@res.css path="/auxo/admin/opencourse/css/${skin}/backend.css"/>
    <@res.css path="/auxo/admin/opencourse/css/${skin}/create.css"/>
    <@res.css path="/auxo/admin/course/css/${skin}/courseedit.css"/>
    <@res.css path="/auxo/admin/other/menu/css/sidebar.css"/>
</@res.include>
    <style>
        .input-xlarge {
            vertical-align: top;
            height: 28px;
        }

        .radio {
            vertical-align: top;
        }
    </style>
</head>
<body>
<@macro.frame>
<div id="js_content">
    <div class="box">
        <div class="banner-header">
            <h2>高级设置</h2>
            <a style="float:right" class="bt-md bt-primary" target="_parent" href="javascript:;"
               data-bind="click: toEdit.bind($root), visible: model.readonly">编辑</a>
        </div>
        <form class="form-horizontal" id="validateForm">
            <div class="c-group">
                <div class="tit">课程标签：</div>
                <div class="contxt">
                    <div class="cf">
                        <div style="width: 300px;height: 300px;overflow: auto;border: 1px solid #ccc;">
                            <ul id="J_Tree" class="ztree tree-border"></ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label">所属组织：</label>

                <div class="controls" style="height: 50px;">
                    <label class="radio inline">
                        <input type="radio" name="belongVisibleType" value="0"
                               data-bind="checked: $root.model.orgSettings.belong.visibleType,attr:{disabled: $root.model.readonly}"/>公开
                    </label>
                    <label class="radio inline">
                        <input type="radio" name="belongVisibleType" value="1"
                               data-bind="checked: $root.model.orgSettings.belong.visibleType,attr:{disabled: $root.model.readonly}"/>组织内部
                    </label>
                    <input class="input-xlarge" readonly="readonly"
                           data-bind="attr:{ 'value': $root.model.orgSettings.belong.orgSelectedText(), 'title': $root.model.orgSettings.belong.orgSelectedText()}, click: $root.showOrgTree.bind($root,'belong'),visible:$root.model.orgSettings.belong.visibleType()==1"/>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label">可见范围：</label>

                <div class="controls" style="height: 50px;">
                    <label class="radio inline">
                        <input type="radio" name="availableVisibleType" value="0"
                               data-bind="checked: $root.model.orgSettings.available.visibleType,attr:{disabled: $root.model.readonly}"/>公开
                    </label>
                    <label class="radio inline">
                        <input type="radio" name="availableVisibleType" value="1"
                               data-bind="checked: $root.model.orgSettings.available.visibleType,attr:{disabled: $root.model.readonly}"/>组织内部
                    </label>
                    <input class="input-xlarge" readonly="readonly"
                           data-bind="attr:{ 'value': $root.model.orgSettings.available.orgSelectedText(), 'title': $root.model.orgSettings.available.orgSelectedText()}, click: $root.showOrgTree.bind($root,'available'),visible:$root.model.orgSettings.available.visibleType()==1"/>
                </div>
            </div>
            <div class="controls-group" data-bind="visible: !($root.model.readonly())">
                <label class="control-label"></label>

                <div class="controls">
                    <button class="btn save" type="button" data-bind="click:$root.savePage">确定</button>
                    <button class="btn cancel" type="button" data-bind="click:$root.backPage">取消</button>
                </div>
            </div>
        </form>
    </div>

    <div class="modal hide" id="js-orgTreeModal" data-backdrop="static" tabindex="-1" role="modal">
        <div class="modal-header">
            <div class="moddal-title"></div>
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h3>选择组织</h3>
        </div>
        <div class="modal-body" id="js-orgTreeModalBody">
            <div id="js-orgTreeModelBody">
                <form class="well form-inline" id="js-searchForm" onsubmit="return false;">
                    <label class="control-label">
                        搜索：
                        <input id="js-searchOrg" autocomplete="off" class="input-xlarge" name="keyword"
                               style="height: 30px;" placeholder="搜索部门关键字"/>
                    </label>
                    <a href="javascript:;" class="btn btn-primary" data-bind="click:orgTreeSearch">搜索</a>

                    <p style="color:red;" data-bind="text: $root.model.searchText"></p>
                </form>
                <div class="container-fluid">
                    <ul class="ztree" id="js-orgTree"></ul>
                </div>
            </div>
            <div id="js-orgTreeModelBody2"
                 style="text-align: center; height: 100px; vertical-align: middle;line-height: 100px;"></div>
        </div>
        <div class="modal-footer">
            <!-- ko if: !$root.model.readonly() -->
            <button class="btn" data-bind="click:cancelOrg">清空</button>
            <button class="btn btn-primary" data-bind="click:saveOrg">确定</button>
            <!-- /ko -->
            <!-- ko if: $root.model.readonly -->
            <button class="btn btn-primary" aria-hidden="true" data-dismiss="modal">关闭</button>
            <!-- /ko -->
        </div>
    </div>
</div>
</@macro.frame>
<script>
    var courseId = '${course_id!}';
    var projectCode = '${projectCode}';
    var source = '${source}';
    var return_url = '${return_url}';
</script>
<@res.include>
    <@res.js path="/auxo/addins/jquery/v1.7.1/jquery.min.js"/>
    <@res.js path="/auxo/admin/other/menu/js/sidebar.js"/>
    <@res.js path="/auxo/addins/ztree/v3.5/js/jquery.ztree.all-3.5.min.js"/>
    <@res.js path="/auxo/addins/bootstrap/v2.0.2/js/bootstrap.min.js" />
    <@res.js path="/auxo/addins/bootstrap/v2.0.2/js/bootstrap-dialog2.js" />
    <@res.js path="/auxo/addins/bootstrap/v2.0.2/js/bootstrap-dialog2.helpers.js" />
</@res.include>
<@res.include>
    <@res.js path="/auxo/addins/layer/v1.0.0/layer.js"/>
</@res.include>
<@res.include>
    <@res.js path="/auxo/addins/ko/v3.3.0/knockout.min.js"/>
    <@res.js path="/auxo/addins/ko-mapping/v2.4.1/knockout.mapping.min.js"/>
    <@res.js path="/auxo/addins/ko-validation/v2.0.3/knockout.validation.min.js"/>
    <@res.js path="/auxo/admin/opencourse/js/common/common.js" />
    <@res.js path="/auxo/common/elearningutils/imageloader/v1.0/imageloader.js"/>
    <@res.js path="/auxo/admin/opencourse/js/widgets/common.js"/>
    <@res.js path="/auxo/addins/require/v2.1.8/require.min.js"/>
    <@res.js path="/auxo/addins/jquery-validate/v1.9.0/jquery.validate.min.js"/>
    <@res.js path="/auxo/admin/course/extends/ko/components/courseedit/js/v5.2.5/index.js"/>
    <@res.js path="/auxo/admin/opencourse/js/advancedsetting.js"/>
</@res.include>
</body>
</html>



