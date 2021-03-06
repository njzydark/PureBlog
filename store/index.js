const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => ({
  theme: '',
  token: '',
  tags: [],
  categories: []
})

export const mutations = {
  setTheme(state, theme) {
    state.theme = theme
  },
  setToken(state, token) {
    state.token = token
  },
  setTagsAndCategories(state, payload) {
    state.tags = payload.tags
    state.categories = payload.categories
  }
}

export const actions = {
  async nuxtServerInit({ dispatch, commit }, { req, app, error }) {
    let auth = ''
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      auth = parsed.auth
    }
    commit('setToken', auth)
    await dispatch('loadTagsAndCategories', {
      app,
      error
    })
  },
  async loadTagsAndCategories({ commit }, { app, error }) {
    try {
      let tagsPromise = app.$axios.$get('/tags')
      let categoriesPromise = app.$axios.$get('/categories')
      const [tags, categories] = await Promise.all([tagsPromise, categoriesPromise])
      commit('setTagsAndCategories', {
        tags: tags.data,
        categories: categories.data
      })
    } catch (e) {
      error({
        statusCode: 500,
        message: `获取标签和类别数据失败:${e.message}`
      })
    }
  }
}
