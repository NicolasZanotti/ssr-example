const fs = require('fs')
const app = new (require('koa'))()
const router = require('koa-router')()
const template = fs.readFileSync('./src/index.html', 'utf-8')
const rendererOptions = { template }
const renderer = require('vue-server-renderer').createRenderer(rendererOptions)
const createApp = require('./src/create-app')
const PassThrough = require('stream').PassThrough

router.get('/', ctx => {
  const vm = createApp(ctx)
  const renderContext = { title: 'Home' }

  renderer.renderToString(vm, renderContext)
    .then(html => ctx.body = html)
    .catch(error => ctx.throw(error))
})

router.get('/stream', ctx => {
  const vm = createApp(ctx)
  const renderContext = { title: 'Stream' }

  ctx.type = 'html'

  // @see https://github.com/koajs/koa/blob/master/docs/api/response.md#stream
  ctx.body = renderer.renderToStream(vm, renderContext).on('error', ctx.onerror).pipe(PassThrough())
})

app.use(async (ctx, next) => {
  // @see https://github.com/koajs/koa/wiki/Error-Handling#catching-downstream-errors
  try {
    await next()
  } catch (error) {
    ctx.body = 'An error occurred'
  }
})
app.use(router.routes())

app.listen(3000, () => console.log('App listening on port 3000'))
