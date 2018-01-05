(function ($) {
  var PlayType = {
    /**
     * 录播
     */
    'playback': 'playback',

    /**
     * 直播
     */
    'broadcast': 'directSeeding'
  }

  /**
   * 直播服务端API域名，需要服务端直接输出到全局变量
   */
  var host = window.broadcastHost;

  var store = {
    query: {
      /**
       * 请求直播间信息
       * @param {number} roomId 直播间ID
       */
      broadcastInfo: function (roomId) {
        var url = host + '/v0.1/c/rooms/' + roomId;
        return $.ajax({
          url: url,
          cache: false,
          dataType: 'json',
          headers: {
            'X-Gaea-Authorization': undefined
          }
        });
      }
    }
  };

  /**
   * 直播封装类
   */
  function BroadcastUtils() {}

  /**
   * 初始化直播，仅内部调用
   * @param {number} 直播间ID
   */
  BroadcastUtils.prototype._queryRoomInfo = function (liveId) {
    var def = $.Deferred();
    store.query.broadcastInfo(liveId).done($.proxy(function (data) {
      var roomData = {
        'roomId': liveId,
        'teacherId': data.user_id,
        'enable': data.enable,
        'state': data.state,
        'fileDentryId': data.file_dentry_id
      }

      def.resolve(roomData);
    }, this));

    return def;
  }

  /**
   * 进入直播
   * @param {number} liveId 直播间ID
   * @param {number} liveCourseId 当前直播课的唯一标识
   * @param {liveResourceId} 当前直播间所关联的资源标识
   * @param {string} startTime 直播开始时间，格式ISO8601标准，例如："2017-03-09T20:46:52.000-0800"
   * @param {string} endTime 直播结束时间，格式ISO8601标准，例如："2017-03-09T20:46:52.000-0800"
   * @param {string} title 直播课程的标题
   */
  BroadcastUtils.prototype.broadcast = function (liveId, liveCourseId, liveResourceId) {
    this._invokeMethodPPT(PlayType.broadcast, {
      'roomId': liveId,
      'liveCourseId': liveCourseId,
      'liveResourceId': liveResourceId
    });
  }

  /**
   * 录播
   * @param {number} liveId 直播间ID
   * @param {string} title 录播课程的名称
   * @param {number} duration 录播课程的时长
   */
  BroadcastUtils.prototype.playBack = function (liveId, liveCourseId, liveResourceId) {
    this._invokeMethodPPT(PlayType.playback, {
      'roomId': liveId,
      'liveCourseId': liveCourseId,
      'liveResourceId': liveResourceId
    });
  }

  /**
   * 调用直播客户端，进入直播间，该方法仅内部调用
   * @param {PlayType} playType 直播类型，值为PlayType中提供的枚举值
   * @param {object} data 进入直播间所需要的JSON数据
   */
  BroadcastUtils.prototype._invokeMethodPPT = function (playType, data) {
    if (typeof (CoursePlayer) !== 'undefined' && CoursePlayer.invokeMethodPPT) {
      CoursePlayer.invokeMethodPPT(playType, JSON.stringify(data));
    }
  }

  window.BroadcastUtils = BroadcastUtils;
})(jQuery);
