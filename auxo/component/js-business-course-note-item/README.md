# 风格类型

## style-a
* 笔记组件-课程详情-我的笔记
* 笔记组件-课程详情-全部笔记
* 个人中心-我的笔记详情

## style-b
* 做笔记-全部笔记
* 做笔记-我的笔记

# 调用
```
<div data-bind="component:{
    name:'x-note-item-a',
    params: {
      note: note,
      options: options
    }
  }">
</div>
```

## note
`note`应该是经过ko监听的可观察对象。
```
let note = ko.observable({ ... });
```

## options
可用的选项：

* apiHost {string} api主机。
* gatewayHost {string} 网关主机。
* isLogin {boolean} 是否已登录。
* showExcerpt {boolean} 是否显示“摘要”按钮。默认false。
* showBlowing {boolean} 是否显示“举报”按钮。默认false。
* showEdit {boolean} 是否显示“编辑”按钮。默认false。
* showDel {boolean} 是否显示“删除”按钮。默认false。
* onEditCommand {function(note)} 编辑按钮按下时的回调函数。
* onDelCommand {function(noteId)} 删除按钮按下时的回调函数。