import sinon from 'sinon'
function once(fn) {
  var returnValue,
    called = false
  return function () {
    if (!called) {
      called = true
      returnValue = fn.apply(this, arguments)
    }
    return returnValue
  }
}
describe('sinon', () => {
  it('calls the original function', function () {
    var callback = sinon.spy()
    var proxy = once(callback)

    proxy()

    assert(callback.called)
  })

  it('calls the original function only once', function () {
    var callback = sinon.spy()
    var proxy = once(callback)

    proxy()
    proxy()

    assert(callback.calledOnce)
  })
})
