<#import '/course/inc/backend_common.ftl' as common />
<#if course_id!=''>
    <#assign title="编辑"/>
<#else>
    <#assign title="新建"/>
</#if>
<@common.header title='${title}课程'>
    <@res.include>
        <@res.css path="/auxo/addins/kindeditor/v4.1.10/themes/default/default.css"/>
        <@res.css path="/auxo/admin/course/css/${skin}/courseedit.css"/>

    </@res.include>
</@common.header>
<style>
    .webuploader-element-invisible {
        position: absolute !important;
        clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
        clip: rect(1px, 1px, 1px, 1px);
    }

    .validationMessage {
        color: red;
    }
</style>
<div class="container-fluid">
    <div class="main">
        <div class="box">
            <div class="list-column">
                <div class="banner-header">
                    <h2 data-bind="text:model.course.id()?'编辑课程':'新建课程'"></h2>
                </div>
                <form class="form-horizontal" id="validateForm">
                    <div class="c-group">
                        <div class="tit"><em class="required">*</em>
                            课程标题：
                        </div>
                        <div class="contxt">
                            <input type="text" name="title" maxlength="51"
                                   data-bind="value:model.course.title"
                                   placeholder="课程标题"/>
                        </div>
                    </div>
                <#--封面-->
                    <div class="c-group">
                        <div class="tit">课程封面：</div>
                        <div class="contxt">
                            <div class="cf">
                                <div class="img-sm" data-bind="click:_toggle">
                                    <img data-bind=" attr: {src: model.course.pic_url()?model.course.pic_url() + '!m300x200.jpg' : ' '},visible:model.course.pic_url()"/>
                                    <!-- ko if: ko.isObservable(model.course_status) -->
                                    <i class="item-label" style="display: none;"
                                       data-bind="text: !!model.course.course_status() ? '在线' : '下线',css:{ 'on':model.course.course_status,'off':!model.course.course_status() }"></i>
                                    <!-- /ko -->
                                </div>
                                <a href="javascript:;" data-bind="click:_toggle"
                                   class="bt-md bt-default">上传课程封面</a>
                            </div>

                        </div>
                    </div>
                    <div class="c-group">
                        <div class="tit"></div>
                        <div class="contxt">
                            <div class="fs12">建议上传尺寸为600x400像素图片，仅支持JPG、GIF、PNG图片，文件小于2MB</div>
                        </div>
                    </div>
                <#--介绍-->
                    <div class="c-group">
                        <label class="tit">课程介绍：</label>

                        <div class="contxt">
                            <textarea rows="15" id="description" data-bind="value: model.course.description"></textarea>
                        </div>
                    </div>
                    <div class="c-group">
                        <label class="tit">课程摘要：</label>

                        <div class="contxt">
                        <textarea rows="10"
                                  data-bind="value: model.course.summary,valueUpdate:'input'" maxlength="100">
                        </textarea>
                        <span class="text-help">
                            你还可以输入 <em data-bind="text:model.wordcount"></em>个字
                        </span>
                        </div>
                    </div>
                    <div class="c-group">
                        <div class="tit">适合人群：</div>
                        <div class="contxt">
                            <input type="text" name="userSuit" maxlength="100"
                                   data-bind="value:model.course.user_suit" placeholder="100字以内"/>
                        </div>
                    </div>
                    <div class="c-group">
                        <div class="contxt bt-group">
                            <a class="bt-sm bt-primary" href="javascript:;"
                               data-bind="click: $root.savePage">确&nbsp;&nbsp;定</a>
                            <a class="bt-sm bt-default" href="${__return_url}">取&nbsp;&nbsp;消</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

</div>
<#--图片上传区-->
<div class="container-fluid upload-outer" data-bind="visible:model.show">
    <div class="box">
        <div class="upload-container">
            <p class="tool-bar">
                <button type="button" class="bt-primary bt-md" data-bind="click:_toggle">返回</button>
            </p>
            <div id="J_UploadImg"></div>
        </div>
    </div>
</div>
<script>
    var courseId = '${course_id!}';
    var storeUrl = '${cloud_url}/v5/stores/objects/uploads?bucket_name=$image&cloud_token=' + encodeURIComponent('${cloud_token}');
    var staticUrl = '<@res.url />';
    var projectCode = '${projectCode}';
    var __return_url = '${__return_url}';
    var custom_type = '${custom_type}';
    var context_id = '${context_id}';
</script>
<@common.script>
    <@res.include>
        <@res.js path="/auxo/addins/webuploader/v0.1.5/js/webuploader.js"/>
        <@res.js path="/auxo/addins/kindeditor/v4.1.10/kindeditor.js"/>
        <@res.js path="/auxo/addins/kindeditor/v4.1.10/lang/zh_CN.js"/>
        <@res.js path="/auxo/addins/kindeditor/v4.1.10/plugins/link/link.js"/>
        <@res.js path="/auxo/addins/kindeditor/v4.1.10/plugins/imageswf/imageswf.js"/>
        <@res.js path="/auxo/addins/ko-validation/v2.0.3/knockout.validation.min.js"/>
        <@res.js path="/auxo/addins/jquery-validate/v1.9.0/jquery.validate.min.js"/>
        <@res.js path="/auxo/addins/swfimageupload/v1.0.0/swfimageupload.js"/>
        <@res.js path="/auxo/admin/course/js/course/baseedit.js"/>
    </@res.include>
</@common.script>