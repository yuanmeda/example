function SEvent(){
  this.events = {};
}
SEvent.prototype = {
  on(name, handler){
    this.events[name] = handler;
    return this;
  },
  emit(name){
    const handler = this.events[name];
    handler && handler();
  }
};
export {SEvent};