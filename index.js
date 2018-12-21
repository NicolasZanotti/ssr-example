const app = new (require('koa'))()
const router = require('koa-router')()
const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer()

const vueApp = new Vue({
  template: `<div>Hello World</div>`
})

router.get('/', ctx => {
  renderer.renderToString(vueApp)
    .then(html => ctx.body = html)
    .catch(error => ctx.throw(error))
})

app.use(router.routes())
app.use(async (ctx, next) => {
  await next()
  ctx.body = `status: ${ctx.status}`
})

app.listen(3000, () => console.log('App listening on port 3000'))
