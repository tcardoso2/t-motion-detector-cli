let vermonWeb = require('../../main.js')
let fs = require('fs')
let chai = require('chai')
let chaiHttp = require('chai-http')
let vermon = require('vermon')
let logger = vermon.logger
chai.use(chaiHttp)
let should = chai.should()

before(function (done) {
  done()
})

after(function (done) {
  // here you can clear fixtures, etc.
  done()
})

describe('Basic new syntax, ', function () {
  describe('use / configure ', function () {
    it('use / configure (needs to be done before starting vermon)', function () {
      vermon.setLogLevel('info')
      vermon.use(vermonWeb)
      vermon.configure()
      // No errors should happen
    })

  })

  describe('watch ', function () {
    it('watch: (replacer for former StartWithConfig)', function (done) {
      vermon.reset()
      vermon.use(vermonWeb)
      vermon.configure()
      vermon.watch().then((environment) => {
  	  	logger.info(`Watching environment ${environment.name}.`)
  	  	done()
      }).catch((e) => {
  	  	should.fail()
      })
    })
  })

  describe('save ', function () {
    it('save: (replacer for former SaveAllToConfig)', function (done) {
      vermon.reset()
      vermon.use(vermonWeb)
      vermon.configure('test/config_test4.js')
      vermon.watch().then((environment, detectors) => {
        vermon.save('./test/vermon/config._example.js', (status, message) => {
          // Check file exists
          if (fs.existsSync('./test/vermon/config._example.js')) {
          } else {
            should.fail()
          }
          status.should.equal(0)
          done()
        }, true)
      })
    })
  })

  //Additional vermon methods once the vermon-web plugin is added
  describe('getWebApp ', function () {
    xit('Returns the web Server', function (done) {
    })
  })

  describe('start ', function () {
    xit('Starts the web server (plugin method)', function (done) {
    })
  })

  describe('reset ', function () {
    xit('Resets the web server (plugin method)', function (done) {
    })
  })
})
