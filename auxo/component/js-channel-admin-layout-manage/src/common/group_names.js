const groupNames = (function(){
    return $.map(window.allGroupNames, function(v){
        return v.name;
    })
})();

export default groupNames;