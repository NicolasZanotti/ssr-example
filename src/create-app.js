const Vue = require('vue')

/*
  Instead of directly creating an app instance, we should expose a factory function
  that can be repeatedly executed to create fresh app instances for each request.

  @see https://ssr.vuejs.org/guide/structure.html#avoid-stateful-singletons
*/
module.exports = function createApp(ctx) {
  return new Vue({
    data: {
      url: ctx.url
    },
    template: `
      <div>
        <h1>Hello World</h1>
        <p>URL is {{ url }}</p>
      </div>
    `,
    /*
      Since there are no dynamic updates, of all the lifecycle hooks, only beforeCreate and created will be called during SSR
      @see https://ssr.vuejs.org/guide/universal.html#component-lifecycle-hooks
    */
    beforeCreate: function() {
      console.log('beforeCreate')
    },
    created: function() {
      console.log('created')
    }
  })
}
