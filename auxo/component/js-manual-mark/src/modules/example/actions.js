import {createAction} from 'redux-actions'
import * as T from './actionTypes'
import Request from '../../service/rest.service'

export let articleGet = createAction(T.ARTICLE_GET,
  () => Request.getArticles()
)

export let articleAdd = createAction(T.ARTICLE_ADD,
  (data) => Request.addArticle(data)
)
