const fs = require('fs')
const PassThrough = require('stream').PassThrough
const app = new (require('koa'))()
const router = require('koa-router')()
const Vue = require('vue')
const template = fs.readFileSync('./index.html', 'utf-8')
const rendererOptions = { template }
const renderer = require('vue-server-renderer').createRenderer(rendererOptions)

/**
 * Instead of directly creating an app instance, we should expose a factory function
 * that can be repeatedly executed to create fresh app instances for each request.
 * @see https://ssr.vuejs.org/guide/structure.html#avoid-stateful-singletons
*/
function createApp(ctx) {
  return new Vue({
    data: {
      url: ctx.url
    },
    template: `
      <main id="app">
        <h1>Hello World</h1>
        <p>
          <a v-if="url === '/'" href="/stream">Stream</a>
          <a v-else href="/">Home</a>
        </p>
      </main>
    `,
    /*
      Since there are no dynamic updates, of all the lifecycle hooks,
      only 'beforeCreate' and 'created' will be called during SSR.
      @see https://ssr.vuejs.org/guide/universal.html#component-lifecycle-hooks
    */
    beforeCreate: function() {
      console.log('server: beforeCreate method called')
    },
    created: function() {
      console.log('server: created method called')
    }
  })
}

/**
 * The base route creates a new app instance, renders to a string, and attaches
 * the output to the response upon completion.
 */
router.get('/', ctx => {
  const vueApp = createApp(ctx)
  const renderContext = { title: 'Home' }

  renderer.renderToString(vueApp, renderContext)
    .then(html => ctx.body = html)
    .catch(error => ctx.throw(error))
})

/**
 * The stream route creates a new app instance and renders a stream straight to the response.
 */
router.get('/stream', ctx => {
  const vueApp = createApp(ctx)
  const renderContext = { title: 'Stream' }

  ctx.type = 'html'

  // @see https://github.com/koajs/koa/blob/master/docs/api/response.md#stream
  ctx.body = renderer.renderToStream(vueApp, renderContext).on('error', ctx.onerror).pipe(PassThrough())
})

app.use(async (ctx, next) => {
  // @see https://github.com/koajs/koa/wiki/Error-Handling#catching-downstream-errors
  try {
    await next()
  } catch (error) {
    ctx.body = `Error: ${error.message}`
  }
})
app.use(router.routes())
app.listen(3000, () => console.log('App listening on port 3000'))
