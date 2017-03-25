// 修改：修飾語不分名詞或動詞，統一叫做 a
// 規則改為《小修飾大、前修飾後》。

// 問題是：蘋果牛奶 到底是 加了蘋果的牛奶，還是蘋果和牛奶呢？ 這得看中間有沒有和字。

// S = P* .+
// P = a* (N+|V+)?

/* 無法正確解析的語句

好a 喝V 的a 蘋果N 牛奶N
*/

// 小明 有 5 個 蘋果 ， 給 了 小華 3 個 蘋果 ， 請問 他 還 剩 幾 個 蘋果 ？
// NP   V  n    NP      V  v  NP   n    NP      Q    NP v  V  n     NP
//      VP              VP                              VP
var pinyinJs = require('pinyin.js')
var cc = require('chinese_convert')
var kb = require('./kb')

// KoaApp 的錯誤和下列中文全域變數有關。
var wi, words, errors, tags

function isTag (tag) {
  var word = words[wi]
  if (typeof word === 'undefined') return false
  return (tag === word.tag)
}

// var print = function (s) { process.stderr.write(s) }
// var print = function (s) { process.stdout.write(s) }
var print = function (s) { console.log(s) }

function next (tag) {
  var w = words[wi]
  if (isTag(tag)) {
//    print(w.cn + ':' + tag + ' ')
    errors[wi] = ''
    tags.push(w.cn + ':' + tag)
    wi++
    return w
  } else {
//    print(w.cn + ':' + w.tag + '≠' + tag + ' ')
    errors[wi] = w.tag + '≠' + tag
    tags.push(w.cn + ':' + errors[wi])
    throw Error(errors[wi])
  }
}

// S = P* .+
function S () {
  tags.push('<S>')
  try {
    while (!isTag('.')) P()
    do { next('.') } while (isTag('.'))
  } catch (err) {
    for (; wi < words.length && words[wi].tag !== '.'; wi++) {}
    for (; wi < words.length && words[wi].tag === '.'; wi++) {}
  }
  tags.push('</S>')
//  console.error('')
}

// P = a* (N+|V+)?
function P () {
  tags.push('<P>')
  while (isTag('a')) next('a')

  if (!isTag('.')) {
    var t = words[wi].tag
    while (isTag(t)) next(t)
  }
  tags.push('</P>')
}

var exps = [
  /^\s*([\u4E00-\u9FFF]{1,8}):([a-z])\s+/i,
  /^\s*(\w{1,20}):([a-z])\s+/i,
  /^[\u4E00-\u9FFF]{4}/,
  /^[\u4E00-\u9FFF]{3}/,
  /^[\u4E00-\u9FFF]{2}/,
  /^./]

function clex (text) {
  text = text.replace(/\n/g, '↓')
  var m
  var lwords = []
  var tokens = []
  for (var i = 0; i < text.length;) {
    for (var ri = 0; ri < exps.length; ri++) {
      var word = null
      m = exps[ri].exec(text.substr(i, 12))
      if (m) {
        if (ri === 0) { // ex: 瑪莉:N
          word = {cn: cc.tw2cn(m[1]), en: '_', tag: m[2]}
        } else if (ri === 1) { // ex: John:N
          word = {cn: m[1], en: m[1], tag: m[2]}
        } else { // 1-4 字的中文詞
          word = kb.get(m[0])
        }
        if (word == null && ri === exps.length - 1) { // 單一字元 .
          word = {cn: m[0], tag: '?'}
        }
        if (word != null) {
          if (word.cn !== ' ' && word.cn !== '\n') {
            lwords.push(word)
            tokens.push(m[0].trim())
          }
          break
        }
      }
    }
    i = i + m[0].length
  }
  return {tokens: tokens, words: lwords}
}

function parse (pWords) {
  words = pWords
  errors = []
  tags = []
  for (wi = 0; wi < words.length;) {
    S()
  }
  return {errors: errors, tags: tags}
}

function english (word) {
  if (word.en === '_') {
    return '_' + pinyinJs(word.cn).toString().replace(',', '_')
  } else {
    return word.en
  }
}

function mt (words) {
  var eWords = []
  for (var i in words) {
    eWords.push(english(words[i]))
  }
  return eWords
}

function analysis (text) {
  var lex = clex(' ' + text)
  console.log('中文：%j', lex.tokens)
  console.log('詞彙：%j', lex.words)
  var p = parse(lex.words)
  console.log('剖析：%j', p.tags)
  console.log('錯誤：%j', p.errors)
  var eWords = mt(lex.words)
  console.log('英文：%j', eWords)
  console.log('=========================')
  return {cn: words, en: eWords}
}

module.exports = { kb: kb, parse: parse, clex: clex, mt: mt, analysis: analysis }
