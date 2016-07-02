var through = require('through2')
var ckan = require('./')
var test = require('tape')

test('gets all items and stops', function (t) {
  var items = []
  var total = null

  var searcher = ckan()

  var stream = searcher.stream({fulltext: 'hello'})
  stream.pipe(through.obj(function (data, enc, next) {
    total = data.result.count
    for (var row in data.result.results) {
      items.push(row)
    }
    next()
  }))

  stream.on('end', function () {
    t.same(items.length, total)
    t.end()
  })
})

test('works on datos.gob.mx', function (t) {
  t.plan(2)

  var total = {}

  var counter = function (key) {
    return through.obj(function (data, enc, next) {
      total[key] = (total[key] || 0) + data.result.count
      next()
    })
  }

  var searcher = ckan({ uri: 'http://datos.gob.mx/busca/api/' })

  var s1 = searcher.stream({fulltext: 'INEGI'})
  s1.on('end', function () {
    t.true(total['INEGI'] > 100, 'finds many datasets from INEGI')
  })
  s1.pipe(counter('INEGI'))

  var s2 = searcher.stream({fulltext: 'res_format:GeoJSON'})
  s2.on('end', function () {
    t.true(total['res_format:GeoJSON'] >= 6, 'at least 6 GeoJSON datasets')
  })
  s2.pipe(counter('res_format:GeoJSON'))
})
