const fs = require('fs')
const app = new (require('koa'))()
const router = require('koa-router')()
const Vue = require('vue')
const template = fs.readFileSync('./src/index.html', 'utf-8')
const rendererOptions = { template }
const renderer = require('vue-server-renderer').createRenderer(rendererOptions)

const renderContext = {
  title: 'Vue SSR Example'
}

const vm = new Vue({
  template: `<h1>Hello World</h1>`
})

router.get('/', ctx => {
  renderer.renderToString(vm, renderContext)
    .then(html => ctx.body = html)
    .catch(error => ctx.throw(error))
})

app.use(router.routes())
app.use(async (ctx, next) => {
  await next()
  ctx.body = `status: ${ctx.status}`
})

app.listen(3000, () => console.log('App listening on port 3000'))
