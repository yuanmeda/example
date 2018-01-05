import tpl from './template.html'
import $ from 'jquery';
import ko from 'knockout';
import {OpenCourse} from '../OpenCourse';
import defaultCoverImage from '../assets/default_cover.png';

function Model(){
  let $vm = this;
  let course = new OpenCourse();
  let courseModel = course.model;
  let desEditor;
  let maxTitle = 50;
  let maxSummary = 100;
  let maxDescription = 300;
  let baseInfoValidator;

  $vm.isDialogMode = ko.observable(isDialogMode);
  $vm.dlgTitle = courseModel.id ? '修改课程' : '新增课程';
  $vm.step = ko.observable(1); // 当前步骤
  $vm.isLoading = ko.observable(false); //  是否正在进行网络请求
  $vm.courseCoverUrl = ko.observable(courseModel.pic_url || defaultCoverImage); // 封面图片url
  $vm.courseCoverId = ko.observable(courseModel.pic_id || undefined); // 封面图id
  $vm.courseTitle = ko.observable(courseModel.title || undefined); // 课程名称
  $vm.courseDescription = ko.observable(courseModel.description || ''); // 描述
  $vm.courseSummary = ko.observable(courseModel.summary || undefined); // 摘要
  $vm.summaryRemainWords = ko.observable(maxSummary); // 摘要剩余字数
  $vm.descriptionRemainWords = ko.observable(maxDescription); // 描述剩余字数
  $vm.isBaseInfoValid = ko.observable(false); // 基本信息表单是否合法
  $vm.courseTagIds = ko.observableArray(courseModel.tag_ids || []);
  $vm.cloudChapterSettingUrl = ko.observable(courseModel.id ? course.chapterSettingUrl : undefined);
  $vm.isOpenImgUploader = ko.observable(false); // 是否打开上传图片对话框

  $vm.saveBaseInfo = saveBaseInfo;
  $vm.returnBaseInfo = returnBaseInfo;
  $vm.nextSetCover = nextSetCover;
  $vm.returnSetChapter = returnSetChapter;
  $vm.submitAudit = submitAudit;
  $vm.openImageUploader = openImageUploader;
  $vm.closeImageUploader = closeImageUploader;
  $vm.updateCover = updateCover;
  $vm.closeYunkeEditor = closeYunkeEditor;

  initKindEditor();
  initTree();

  // 初始化富文本编辑器
  function initKindEditor() {
    desEditor = KindEditor.create('#description', {
      loadStyleMode: false,
      pasteType: 2,
      allowFileManager: false,
      allowPreviewEmoticons: false,
      allowImageUpload: true,
      resizeType: 0,
      staticUrl: staticUrl,
      width:'100%',
      items: [
        'source', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'underline',
        'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', '|', 'link'
      ],
      afterChange: function () {
        if (!desEditor) {
          return;
        }
        // 手工赋值
        if (desEditor.count("text") == 0) {
          $vm.courseDescription('');
        } else {
          $vm.courseDescription(desEditor.html());
        }
      }
    });
    // 手动赋值
    desEditor.html($vm.courseDescription());
    $vm.courseSummary.subscribe(function (value) {
      $vm.summaryRemainWords(maxSummary - (value ? value.length : 0));
    });
    $vm.courseSummary.valueHasMutated();
  }

  // 初始化标签树
  function initTree() {
    $vm.isLoading(true);
    OpenCourse.getTree()
      .then(function (data) {
        let setting = {
          data: {
            key: {
              name: 'title',
              title: 'title'
            }
          },
          check: {
            enable: true,
            chkboxType: {
              "Y": "",
              "N": ""
            },
          },
          callback: {
            onCheck: function (e, tid, tnode) {
              let id = tnode.id;
              if (tnode.checked) {
                $vm.courseTagIds.push(id);
              } else {
                $vm.courseTagIds.remove(function (item) {
                  return item === id;
                });
              }
            }
          },
          simpleData: {
            enable: true,
            idKey: 'id',
            pIdKey: 'parent_id'
          }
        };
        let ztreeObject = $.fn.zTree.init($('#J_Tree'), setting, data.children);

        let selectedIds = course.model && course.model.tag_ids || [];
        $.each(selectedIds, function(index, item){
          let node = ztreeObject.getNodeByParam('id', item);
          if (node) {
            ztreeObject.checkNode(node, true, false, false);
          }
        });
      })
      .always(() => {
        $vm.isLoading(false);
      })
  }

  // 基本信息字段验证
  function initBaseInfoValidation() {
    baseInfoValidator = ko.validatedObservable($vm, {
      deep: true
    });
    ko.validation.rules['notEmptyArray'] = {
      validator: function (val) {
        return val.length > 0;
      },
      message: ''
    };
    ko.validation.registerExtenders();
    $vm.courseTitle.extend({
      required: {
        message: '请填写课程标题'
      },
      maxLength: {
        param: maxTitle,
        message: `课程标题必须小于${maxTitle}个字`
      }
    });
    $vm.courseDescription.extend({
      required: {
        message: '请填写课程描述'
      },
      maxLength: {
        param: maxDescription,
        message: `课程描述（包含标签）必须小于${maxDescription}个字`
      }
    });
    $vm.courseSummary.extend({
      required: {
        message: '请填写课程摘要'
      },
      maxLength: {
        param: maxSummary,
        message: `课程摘要必须小于${maxSummary}个字`
      }
    });
    $vm.courseTagIds.extend({
      notEmptyArray: {
        message: '请选择课程标签'
      }
    });

    // 限制最大字数
    $vm.courseSummary.subscribe(nv => {
      if (nv.length > maxSummary) {
        $vm.courseSummary(nv.substr(0, maxSummary));
      }
    });
  }

  // 关闭云课编辑器
  function closeYunkeEditor() {
    if (window.confirm('关闭当前窗口会立即取消课程上传，所有编辑内容都不会保存')) {
      window.location.search = '';
    }
  }

  // 保存基本信息，并进入章节设置
  function saveBaseInfo() {
    let errMessage = '';
    let title = $vm.courseTitle() || '';
    let description = $vm.courseDescription() || '';
    let summary = $vm.courseSummary() || '';
    let tags = $vm.courseTagIds();

    if (title.length === 0 || title.length > maxTitle) {
      errMessage = `课程标题必须填写，且小于${maxTitle}个字`;
    } else if (description.length === 0 || description.length > maxDescription) {
      errMessage = `课程描述必须填写，且小于${maxDescription}个字符（包含标签）`;
    } else if (summary.length === 0 || summary.length > maxSummary) {
      errMessage = `课程摘要必须填写，且大于${maxSummary}`;
    } else if (tags.length === 0) {
      errMessage = `请选择课程标签`;
    }

    if (errMessage) {
      Utils.alertTip(errMessage, {
        title: '警告',
        icon: 7
      });
      return;
    }

    courseModel.title = title;
    courseModel.description = description;
    courseModel.summary = summary;
    courseModel.tag_ids = tags;
    $vm.isLoading(true);
    if (!courseModel.id) {
      // 新建
      course.create()
        .then(resp => {
          $vm.step(2);
          $vm.cloudChapterSettingUrl(course.chapterSettingUrl);
        })
        .always(() => {
          $vm.isLoading(false);
        });

    } else {
      // 更新
      course.update()
        .then(() => {
          $vm.step(2);
        })
        .always(() => {
          $vm.isLoading(false);
        });
    }
  }

  // 返回到保存基本信息
  function returnBaseInfo() {
    $vm.step(1);
  }

  // 进入封面设置
  function nextSetCover() {
    $vm.step(3);
  }

  // 返回章节设置
  function returnSetChapter() {
    $vm.step(2);
  }

  // 提交审核
  function submitAudit() {
    if ($vm.isLoading()) {
      return;
    }
    $vm.isLoading(true);
    course.submitAudit()
      .then(() => {
        Utils.alertTip('课程已提交审核', {
          title: '信息',
          icon: 7
        });
        let location = window.location;
        let domain = `${location.protocol}//${location.host}`;
        window.top.postMessage('auditSubmitted', domain);
      })
      .always(() => {
        $vm.isLoading(false);
      });
  }

  function openImageUploader() {
    $vm.isOpenImgUploader(true);
    initImageUpload();
  }

  function closeImageUploader() {
    $vm.isOpenImgUploader(false);
  }

  function initImageUpload() {
    new SWFImageUpload({
      flashUrl: staticUrl + '/auxo/addins/swfimageupload/v1.0.0/swfimageupload.swf',
      width: 1024,
      height: 1200,
      htmlId: 'J_UploadImg',
      pSize: '600|400|360|240|270|180',
      uploadUrl: escape(`${cloudHost}/v5/stores/objects/uploads?bucket_name=$image&cloud_token=${encodeURIComponent(cloudToken)}`),
      imgUrl: '',
      showCancel: false,
      limit: 1,
      upload_complete: onImgUploadComplete,
      upload_error: onImgUploadError
    });
  }

  function updateCover() {
    if (!$vm.courseCoverId()) {
      return;
    }
    courseModel.pic_id = $vm.courseCoverId();
    courseModel.pic_url = $vm.courseCoverUrl();
    $vm.isLoading(true);
    course.update()
      .always(() => {
        $vm.isOpenImgUploader(false);
        $vm.isLoading(false);
      });
  }

  function onImgUploadComplete(data) {
    $vm.courseCoverUrl(`${data.absolute_url}!m300x200.jpg`);
    $vm.courseCoverId(data.store_object_id);
  }

  function onImgUploadError(code) {
    let msg;
    switch (code) {
      case 120:
        msg = '上传文件的格式不对，请重新上传jpg、gif、png格式图片';
        break;
      case 110:
        msg = '上传文件超过规定大小';
        break;
      default:
        msg = '上传失败，请稍后再试';
        break;
    }
  }

}

ko.components.register("x-opencourse-yunke-editor", {
  viewModel: Model,
  template: tpl
});
