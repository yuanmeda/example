function Button(config){
  this.label = config.label || '';
  this.is_primary = !!config.is_primary;
  this._on_click = config.on_click || function(){};
}

Button.prototype = {
  click(){
    this._on_click();
  }
};

export {Button};