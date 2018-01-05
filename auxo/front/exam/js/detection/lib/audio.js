/**
 * Created by Administrator on 2017/8/9.
 */
var audioSwf
var swfName = 'Main'

function findSWF () {
	if (audioSwf) {
		return audioSwf
	}
	if (navigator.appName.indexOf('Microsoft') != -1) {
		audioSwf = window[swfName]
	} else {
		audioSwf = document[swfName]
	}
	return audioSwf
}
/**
 * 用来处理没有录音设备时的回调
 */

var Audio = {
	//播放
	soundPlay: function soundPlay (url) {
		findSWF().soundPlay(url)
	},
	//停止播放
	soundStop: function soundStop () {
		findSWF().soundStop()
	},
	//调整播放音量   0-1
	setPlayVol: function setPlayVol (i) {
		findSWF().setPlayVol(i)
	},
	//检查录音设备  boolean
	checkRecDevice: function checkRecDevice () {
		return findSWF().checkRecDevice()
	},
	//开始录音
	startRecord: function startRecord () {
		findSWF().startRecord()
	},
	//停止录音
	stopRecord: function stopRecord () {
		findSWF().stopRecord()
	},
	//回放录音
	replayRecord: function replayRecord () {
		findSWF().replayRecord()
	},
	//停止回放
	stopReplay: function stopReplay () {
		findSWF().stopReplay()
	},
	//获取录音设备列表
	getDeviceList: function getDeviceList () {
		return findSWF().getDeviceList()
	},
	//指定录音设备
	specRecordDevice: function specRecordDevice (index) {
		findSWF().specRecordDevice(index)
	},
	//设置录音音量
	setRecVol: function setRecVol (i) {
		findSWF().setRecVol(i)
	},
	//打开权限弹窗
	permitPermanently: function () {
		findSWF().width = 240
		findSWF().height = 160
		findSWF().permitPermanently()
	},
	//增加音量
	volUp:function () {
		findSWF().volUp()
	},
	//降低音量
	volDown:function () {
		findSWF().volDown()
	},
	//获取mp3长度
	getMp3Length:function (url) {
		return findSWF().getMp3Length(url)
	}

}