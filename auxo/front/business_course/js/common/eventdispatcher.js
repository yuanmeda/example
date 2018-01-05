/**
 * 事件分发器
 */
var EventDispatcher = {
    _listeners: [],

    /**
     * 检查指定的事件是否被监听
     * @param type 事件名称
     * @param listener 事件回调用
     */
    hasEventListener: function (type, listener) {
        var exists = false;
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].type === type && this._listeners[i].listener === listener) {
                exists = true;
            }
        }
        return exists;
    },

    /**
     * 添加一个事件回调
     * @param typeStr 事件名称
     * @param listenerFunc 事件回调用
     */
    addEventListener: function (typeStr, listenerFunc) {
        if (this.hasEventListener(typeStr, listenerFunc)) {
            return;
        }
        this._listeners.push({
            type: typeStr,
            listener: listenerFunc
        });
    },

    /**
     * 移除置顶的事件监听
     * @param typeStr 事件类型
     * @param listenerFunc 事件回调用
     */
    removeEventListener: function (typeStr, listenerFunc) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].type === typeStr && this._listeners[i].listener === listenerFunc) {
                this._listeners.splice(i, 1);
            }
        }
    },

    /**
     * 激发置顶的事件
     * @param evt 事件所需要的数据
     */
    dispatchEvent: function (evt) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].type === evt.type) {
                this._listeners[i].listener.call(this, evt);
            }
        }
    }
};
