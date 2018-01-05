(function(){
    var viewModel = {
        model: {
            state: {
                isOpen: ko.observable(false),             // css used
                nextStage: ko.observable(1),              // 下一阶段 1. 录音 2. 播放 3： 确认
                inProcess: ko.observable(false),          // 是否处于流程中
                recordSound: ko.observable(0),
                recordMaxSound: 200,
                DurationTotal: 300,
                recordDuration: ko.observable(0),
                replayDuration: ko.observable(0)

            },
            deviceInitError: ko.observable(false),
            currentDevice: ko.observable(),
            deviceList: ko.observableArray(),
        },
        toggleOpen: function(){
            this.model.state.isOpen(!ko.unwrap(this.model.state.isOpen))
        },
        selectDevice: function(device){
            var devices = ko.unwrap(viewModel.model.deviceList);
            var index = ko.utils.arrayIndexOf(devices, device);
            console.log(index);
            viewModel.model.currentDevice(device);
            Audio.specRecordDevice(index);
        },
        startRecordThenStop: function(){
            if(ko.unwrap(this.model.deviceList).length <= 0){
                $('#no-device').show();
                return;
            }
            Audio.startRecord()
            viewModel.model.state.nextStage(1);
            viewModel.model.state.inProcess(true);
            viewModel.model.state.recordDuration(0);
            var timer = setInterval(function(){
                var recordDuration =  ko.unwrap(viewModel.model.state.recordDuration);
                viewModel.model.state.recordDuration(++recordDuration);
                if(recordDuration == ko.unwrap(viewModel.model.state.DurationTotal)) {
                    Audio.stopRecord();
                    clearInterval(timer);
                    viewModel.model.state.nextStage(2);
                    viewModel.model.state.inProcess(false);
                    window.showVol(0) // 关闭麦克音量
                }
            }, 100)
        },
        startReplayThenStop: function() {
            Audio.replayRecord()
            viewModel.model.state.inProcess(true);
            viewModel.model.state.nextStage(2);
            viewModel.model.state.replayDuration(0);
            var timer = setInterval(function(){
                var replayDuration =  ko.unwrap(viewModel.model.state.replayDuration);
                viewModel.model.state.replayDuration(++replayDuration);
                if(replayDuration === ko.unwrap(viewModel.model.state.DurationTotal)) {
                    Audio.stopReplay();
                    clearInterval(timer);
                    viewModel.model.state.nextStage(3);
                    viewModel.model.state.inProcess(false);
                }
            }, 100)
        },
        init: function() {
            ko.applyBindings(this, document.getElementById('record-content'))
        },
    }
    // 给flash调用， 每100ms更新一次
    var count = 0;
    var total = 0;
    var scheduled = false;
    window.showVol = function(i){
        total += i;
        count += 1;
    }
    scheduled = setInterval(function() {
        if(count>0) {
            viewModel.model.state.recordSound((total/count)>200? 200: total/count);   
        } else {
            viewModel.model.state.recordSound(0);   
        }
        count = 0;
        total = 0;
    }, 300);

    $(document).ready(function(){
        viewModel.init();
        var count = 0;
        (function getDeviceList(){
            try{
                count ++;
                var deviceList = Audio.getDeviceList();
                console.log(deviceList);        
                viewModel.model.deviceList(deviceList);
                viewModel.selectDevice(deviceList[0]);
            } catch(e) {
                if(count < 100) {
                    setTimeout(getDeviceList, 100);   
                } else if(count >= 100) {
                    viewModel.model.deviceInitError(true);
                }
                
            }
        })();
    })
   
})()