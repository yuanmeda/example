import {createStore, combineReducers, compose, applyMiddleware} from 'redux'
import ThunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from './reducers'
import {hashHistory} from 'react-router'
import {routerReducer} from 'react-router-redux/lib/reducer'
import routerMiddleware from 'react-router-redux/lib/middleware'
import asyncPromiseMiddleware from '@sdp.nd/redux-async-promise'
// console.log(asyncPromiseMiddleware)

const finalCreateStore = compose(applyMiddleware(
  ThunkMiddleware,
  ...asyncPromiseMiddleware({
    // 用于控制是否派发 globalLoadingActionType, 默认值，每个 action 可以在 meta 里面覆盖
    showLoading: true,
    // 全局 actionType 后缀，分别表示三个状态 pending, success, error
    actionTypeSuffixes: ['PENDING', 'SUCCESS', 'ERROR'],
    // 全局 loading action type
    globalLoadingActionType: 'RECEIVE_LOADING_STATE',
    // 全局提示消息 action type
    globalMessageActionType: 'RECEIVE_GLOBAL_MESSAGE'
  }),
  routerMiddleware(hashHistory),
  createLogger()
))(createStore)

const reducer = combineReducers({
  ...rootReducer,
  routing: routerReducer
})

export default function configureStore(initialState) {
  const store = finalCreateStore(reducer, initialState)
  return store
}
