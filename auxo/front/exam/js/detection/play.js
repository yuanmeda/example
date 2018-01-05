(function(){
    var i=0
    var viewModel = {
	    model: {
            recordDevicesTip: '',
            playProgress: '0%',
            showButton: false,
		    playing: false,
            playState: '播  放',
            vol: 0.6 ,
            volPer: '60%'
        },

        soundPlay:function () {
	       if(i !== 0) return
            Audio.soundPlay(staticUrl+'auxo/front/exam/js/detection/mp3/US-Thailand-Relations.mp3')
            Audio.setPlayVol(this.model.vol())
	        this.model.playing(true)
            this.playCount()
        },
	    playCount:function () {
		    if(i>100) {
			    this.model.playState('播  放')
			    this.model.showButton(true)
			    this.model.playing(false)
                i=0
			    Audio.soundStop()
		        return
		    }
		    this.model.playState('播 放 中')
		    this.model.playProgress(i+'%')
		    i++
		    setTimeout($.proxy(this.playCount,this), 150);
	    },
        volUp:function () {
	        var volNumber=this.model.vol()
            Audio.volUp()
            this.model.vol(volNumber+0.1>1?1:volNumber+0.1)
            this.model.volPer(this.model.vol()*100 +'%')
        },
        volDown:function () {
	        var volNumber=this.model.vol()
            Audio.volDown()
	        this.model.vol(volNumber-0.1<0?0:volNumber-0.1)
	        this.model.volPer(this.model.vol()*100 +'%')
        },
        init: function() {
	        this.model = ko.mapping.fromJS(this.model);
	        var $content = $('#play-content');
	        ko.applyBindings(this, $content[0]);
	        $content.show();
        },
    }
    $(document).ready(function(){
        viewModel.init();
	    (function checkDevice(){
		    try{
			    viewModel.model.recordDevicesTip(Audio.checkRecDevice()?'Flash可以访问麦克风':'没有找到录音设备，请检查')
		    } catch(e) {
			    setTimeout(checkDevice, 200);
		    }

	    })();
    })
   
})(jQuery, window)