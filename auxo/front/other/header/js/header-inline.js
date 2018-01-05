window.onload = function () {
    var activeNode = null;
    if (window.customType && window.customType != 'channel') {
        var CUSTOM_MAP = {
            'auxo-open-course': 5,
            'auxo-exam-center': 6,
            'auxo-recommend': 7,
            'auxo-train': 8,
            'auxo-specialty': 9,
            'auxo-certificate': 11,
            'ImChart': 13,
        };
        activeNode = document.getElementById('channel_' + CUSTOM_MAP[window.customType]);
    } else if (window.channelId) {
        activeNode = document.getElementById('channel_' + window.channelId);
    }
    if (activeNode) activeNode.className = 'active';
}