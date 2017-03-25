var Koa = require('koa')
var Router = require('koa-router')
// var serve = require('koa-static')
var send = require('koa-send')
var bodyParser = require('koa-bodyparser')
var MT = require('./aslt')
var app = new Koa()
var router = new Router()

app.use(bodyParser())

function mt (text) {
  var lex = MT.clex(' ' + text)
  var p = MT.parse(lex)
//  console.log('p.tags=%j', p.tags)
  var eWords = MT.mt(lex.words)
  return {cn: lex.tokens, words: lex.words, en: eWords, errors: p.errors, tree: MT.formatParse(p) }
}

app.use(async function (ctx, next) {
  var method = ctx.request.method
  var path = ctx.request.path
//  console.log('ctx=%s', JSON.stringify(ctx, null, 2))
//  console.log('request=%j', ctx.request)
  if (method === 'GET') {
    await send(ctx, ctx.path, { root: __dirname + '/web' })
  } else if (method === 'POST') {
    console.log('path=%s', path)
    if (ctx.path === '/mt') {
      var body = ctx.request.body
  //    console.log('body=%j', body)
      ctx.body = JSON.stringify(mt(body.source), null, 2)
    } else if (ctx.path === '/parse') {
      var body = ctx.request.body
      var tree = mt(body.source).tree
      console.log('tree=%s', tree)
      ctx.body = JSON.stringify(tree, null, 2)
    }
  }
})

app.use(router.routes()).listen(3000)

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
