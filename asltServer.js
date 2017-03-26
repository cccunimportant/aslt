var Koa = require('koa')
var Router = require('koa-router')
// var serve = require('koa-static')
var send = require('koa-send')
var bodyParser = require('koa-bodyparser')
var aslt = require('./aslt')
var app = new Koa()
var router = new Router()

app.use(bodyParser())

function asl (text) {
  var p = aslt.analyze(text)
  p.tree = aslt.formatParse(p)
  return p
}

app.use(async function (ctx, next) {
  var method = ctx.request.method
  var path = ctx.request.path
  var body
  if (method === 'GET') {
    await send(ctx, ctx.path, { root: __dirname + '/web' })
  } else if (method === 'POST') {
    if (ctx.path === '/asl') {
      body = ctx.request.body
      console.log('==========asl:source================\n'+body.source)
      ctx.body = JSON.stringify(asl(body.source), null, 2)
    }
  }
})

app.use(router.routes()).listen(8081)

// app.use(serve('web'))

/*
router.post('/mt', async function (ctx, next) {
//  await next()
  console.log('ctx=%s', JSON.stringify(ctx, null, 2))
  var body = ctx.request.body
  console.log('body=%j', body)
  ctx.body = body
//  return next()
})
*/
