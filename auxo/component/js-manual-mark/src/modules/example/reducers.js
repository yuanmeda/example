import {handleActions} from 'redux-actions'
import * as T from './actionTypes'

const initialState = {
  loading: true,
  error: false,
  items: []
}

export const articleList = handleActions({
  [`${T.ARTICLE_GET}_PENDING`](state, action) {
    return {
      ...state,
      loading: true,
      error: false
    }
  },
  [T.ARTICLE_GET]: {
    next(state, action) {
      // handle success
      return {
        ...state,
        loading: false,
        error: false,
        items: action.payload
      }
    },
    throw(state, action) {
      // handle error
      return {
        ...state,
        loading: false,
        error: true
      }
    }
  }
}, initialState)
