"use strict"

let vermon //Vermon is no longer imported, but injected in real-time via the 'vermon.use' function
let core = require('vermon-core-entities')
//Vermon utils might be a separate library!
let ent = core.entities
var log = core.utils.log
let ext = core.extensions
let express = require('express')
let io = require('socket.io')()
let clientIOFact = require('socket.io-client')
let bodyParser = require('body-parser')
let path = require("path")
let app = null
let assert = require("assert")
const defaultPort = 8080
let pkg = require('./package.json')
let ko = require("knockout")
//Increases when a new socket connection is available 'connect' event
let newSocketConnections = 0
let _this //Used for convenience on Express environment, when scope this is lost inside express.
let listenLock = false //Used to prevent other attempts to listen to a port when a first attempt has already been made but it is not yet concluded
/**
 * Wraps an Express web-server, which will allow viewing all the Motion Detectors and
 * Notifiers in the system. See more in
 * https://expressjs.com/en/api.html
 * Acts like a Singleton, in the sense that the wrapped express app is a single instance
 * @param {integer} port is the port of the web-app, if not provided, will default to 8080.
 * @param {string} static_addr, is the relative URL of the static resources, it defaults to the 
 * module's internal public folder
 * @example  let web = require("t-motion-detector-cli");
let config = new web._.Config('./config.js');
web._.StartWithConfig(config, (e,d,n,f)=>{
  console.log("Good to go!");
});
//Example of a config file which creates the routes necessary

profiles = {
  default: {
    ExpressEnvironment: {
      port: 8777
    },
    RequestDetector: [{
      name: "My Detectors Route",
      route: "/config/detectors",
      callback: "GetMotionDetectors"
    },
    {
      name: "My Notifiers Route",
      route: "/config/notifiers",
      callback: "GetNotifiers"
    },
    {
      name: "Activate route",
      route: "/config/detector/activate",
      callback: "ActivateDetector;name",
      verb: "POST"
    },
    {
      name: "Deactivate route",
      route: "/config/detector/deactivate",
      callback: "DeactivateDetector;name",
      verb: "POST"
    }]
  }
}
exports.profiles = profiles;
exports.default = profiles.default;
 */

class ExpressEnvironment extends ent.Environment {
  
  constructor(port, static_addr, maxAttempts = 10, listen = true){
    super();
    this.port = port && Number.isInteger(port) ? port : defaultPort;
    this.static_addr = static_addr ? static_addr : path.join(__dirname, '/public'); 
    this.name = "Express Environment";
    this.maxAttempts = maxAttempts;
    this.isListening = false;
    if(app) {
      throw new Error('Only one express application per process can exist!')
    }
    app = express();
    this.getWebApp = () => app
    //Basic request logger
    this.setBodyParser();
    app.use(requestLogger);
    //Handle errors. For scope reasons, a copy of this object will be created because it needs to be accesed inside Express
    _this = this;
    if(listen) this.listen();
  }

  setBodyParser(){
    log.info("Adding middleware to allow body to be parsed as json...");
    //parse application/json and look for raw text
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.text());   
    app.use(bodyParser.json());
  }

  listenNext(err, interval = 5000){
    this.isListening = false;
    log.warn(`Some error happened while attempting to listen to port ${this.port}, attempting next port in ${interval} milliseconds...`);
    log.error(err)
    setTimeout(()=>{
      this.port++;
      return this.listen();
    }, interval)
  }

  listen()
  {
    if (this.isListening) {
      log.warning("Ignoring listen request because server is already listening...");
      return false
    }
    if (listenLock) {
      log.warning("Ignoring listen request because app is already locked for listening...");
      return false
    }
    log.info(`Setting static address to ${this.static_addr} and preparing to listen on port ${this.port}...`);
    this.setStatic(this.static_addr)

    let e = this;
    app.get("/welcome", (req, res) => {
      e.addChange(req.url)
      res.json({message: "Welcome to Vermon Web server!"})
    })
    app.get("/version", (req, res) => {
      e.addChange(req.url)
      res.json({version: pkg.version})
    })
    this.maxAttempts--
    listenLock = true
    log.info(`Attempting to listen to port ${this.port}. Number of remaining attempts ${this.maxAttempts}...`);
    if(this.maxAttempts > 0 && !this.isListening){
      let _server = this
      this.server = app.listen(this.port, () => {
        console.log('╔═════════════════════════════════════════════╗')
        console.log(`║             Server Started!!!!!             ║`)
        console.log('╚═════════════════════════════════════════════╝')
        _server.isListening = true
        log.info(`Listening successful to port ${this.port}!`);          
      }).on('error', (error) => {
        log.error("Ooooops some error happened when attempting to listen to port, will attempt to listen to next port...")
        listenLock = false
        this.listenNext(error)
      });
      return true;
    }
    return false;
  }
  
  setStatic(path)
  {
    app.use(express.static(path));
  }

  getStaticAddr()
  {
    return this.static_addr;
  }

  //Only when Detector is binded, it is added to the app
  bindDetector(md, notifiers, force = false){

    super.bindDetector(md, notifiers, force);
    let e = this;
    if(md instanceof RequestDetector) {
      log.info(`Adding route: ${md.route} with verb: ${md.verb}`);
      switch (md.verb)
      {
  	    case "GET": 
          app.get(md.route, (req, res) => {
    	  	  md.send(req.url, e)
    	  	  md.handler(req, res, e)
  	      });
          console.log(`Added ${md.verb}: ${md.route}`)
          break;
        case "POST":    
          app.post(md.route, (req, res) => {
            md.send(req.url, e)
            md.handler(req, res, e)
          });
          break;
        default:
          throw new Error (`Verb ${md.verb} is not implemented.`)
          break;
      }
    }
  }

  getPort()
  {
    return this.port;
  }

  stop()
  {
    //Do some closing steps here.
    log.info("Server will stop listening...");
    //Cleaning up on listeners...
    app.removeListener('error', this.listenNext)
    if(this.server){
      this.server.close()
      log.info("Server closed.")
    }
  }

  kill()
  {
    this.stop()
    app = {}
    listenLock = false
    _this = undefined
  }
}

function appExists() {
  return app != null
}

function appInstance() {
  if(!appExists) throw new Error('There is no Express environment instance yet')
  return app
}

//Express Middleware: TODO: Move to another more meaningful file
var requestLogger = function (req, res, next) {
  process.stdout.write('║')
  let test = log.info(`Incoming: ${req.method}:${req.url}`);
  console.log(test)
  process.stdout.write('║')
  test = log.debug(JSON.stringify(req.headers));
  console.log(test)
  next();
};


//This controls the Json output of the BaseNotifier class, not printing
//unecessary members
ExpressEnvironment.prototype.toJSON = function() {
  let copy = ko.toJS(this); //easy way to get a clean copy
  let props = Object.getOwnPropertyNames(copy);
  for (let i in props){
    if (props[i].startsWith("_"))
    {
      delete copy[props[i]];
    }
  }
  delete copy.domain; //remove an extra property
  return copy; //return the copy to be serialized
};

/**
 * Max number of nodes on the Decision Tree
 */
const MAX_NODES = 100;
/**
 * A Decision Tree environment which keeps a decision tree internally and sends changes when state changes
 */
class DecisionTreeEnvironment extends ent.Environment{
  
  constructor(numberNodes){
    super();
    if(!numberNodes){
      throw new Error("ERROR: Number of nodes is mandatory and cannot equal 0.");
    }
    if(isNaN(numberNodes)){
      throw new Error("ERROR: Number of nodes must be a number.");
    }
    if((numberNodes < 1) || (numberNodes > 100) ){
      throw new Error(`ERROR: Number must be between 1-${MAX_NODES}`);
    }

    this.nodes = [];
    
    while(numberNodes > 0){
      numberNodes--;
      //Adds a default truthy node
      this.addNode(new DecisionNodeDetector("Default Node", ()=>{ return true }));
    }
  }

/**
 * Adds a node if is less than the limit.
 * @returns true if the node was successfully added.
 */
  addNode(node, truthy = true){
    if(node && (node instanceof DecisionNodeDetector)){
      if(this.nodes.length < MAX_NODES){
        //If a node already exists will add it as left/right
        if (this.nodes.length > 0){
          if(truthy){
            this.getLastNode().goToIfTrue(node);
          } else {
            this.getLastNode().goToIfFalse(node);
          }
        } 
        this.nodes.push(node);
        return true;
      }
      return false;
    } else{
      throw new Error("ERROR: Parameter of 'addNode' method must be of instance DecisionNodeDetector.");
    }
    //Also adds as Detector
    super.bindDetector(node);
  }
  getLastNode(){
    return this.nodes[this.nodes.length-1];
  }

/**
 * Gets the number of nodes.
 * @returns {Int} the number of nodes of the decision tree.
 */
  countNodes(){
    return this.nodes.length;
  }

  processTree(){
    //Starts with the first node;
    let first_node = this.nodes[0];
    let next = first_node;
    let path = [];
    let result = { value: {} };
    log.info("Starting to process tree...");
    while(!next.isLast())
    {
      log.info(`  '${next.descriptor}' has child nodes. Processing node...`); 
      result = next.process();
      log.info(`  result is ${result}'.`); 
      next = result.next;
      path.push(result.step);
    }
    log.info(`Finished processing tree. Emiting decision node '${next.descriptor}', ${result.value}`);
    this.emit("decision", result.value, next, path);
  }
}

/**
 * A Detector which takes a line command and will send a change if detects the pattern given on stdout
 * @param {String} name is a friendly name for reference for this route, will be the detector name.
 * @param {String} command will be executed by the command line
 * @param {Array} args is an array of arguments for the command to execute
 * @param {String} pattern is a pattern which the detector will attempt to find in the log, by default it searches for "ERROR"
 */
class CommandStdoutDetector extends ent.MotionDetector{
  constructor(name, command, args = [], pattern = "ERROR"){
    super(name);
    //Validate 2nd argument
    if (!command){
      throw new Error("The second argument 'command' is mandatory.");
    }
    //Validate 3rd argument
    if(!Array.isArray(args)){
      throw new Error("The third argument 'args' must be an Array.");
    }
    this.command = command;
    this.args = args;
    this.pattern = pattern;
  }

  startMonitoring(){
    super.startMonitoring();
    let _args = '';
    for (let i in this.args){
      _args += ` --${this.args[i]}`;
    }
    let data_line = '';
    let line = 0;
    log.info(`Executing command: "${this.command} ${_args}"...`);
    this.processRef = ivermon.Cmd.get(this.command + _args);
    let d = this;
    this.processRef.stdout.on(
      'data', (data)=> {
        line++;
        data_line += data;
        if (data_line[data_line.length-1] == '\n') {
          if (data.indexOf(d.pattern) > 0){
            log.info(`Pattern detected by ${d.name} on line ${line}, sending change to notifiers....`);
            d.send({ "line": data, "row": line, "col": data.indexOf(d.pattern), "allData": data_line });
          }
        }
      }
    );
  }
}
/**
 * A Web Request Detector which implements an URL route to some known available serve-moethod.
 * @param {String} name is a friendly name for reference for this route, will be the detector name.
 * @param {String} route an URL route
 * @param {String} handler is the name of the method / function to call when this route is used, the function's return contents are displayed as a Web Response.
 * @param {String} verb is the HTTP Verb to be used, if ommited defaults to "GET".
 * @example
 * new RequestDetector("Get Notifiers route", "/config/notifiers", "GetNotifiers");
 * //GET route which calls the GetNotifiers function
 * new RequestDetector("Deactivate Detectors route", "/config/detectors/deactivate", "DeactivateDetector;name", "POST");
 * //POST request route. in this case expects in the query string a "name" argument which should refer the name of the detector to deactivate e.g.
 * ///config/detectors/deactivate?name=MyDetectorToDeactivate
 */
class RequestDetector extends ent.MotionDetector{
  constructor(name, route, handler, verb = "GET"){
  	super(name);
    if(!route) {
      throw new Error('RequestDetector second argument (route) is mandatory');
    }
    if(!handler) {
      throw new Error('RequestDetector third argument (function handler) is mandatory');
    }
  	this.route = route;
    this.verb = verb;
    this.setHandler(handler);
  }
  setHandler(handler){
    if (typeof handler == "string"){
      let parts = _GetFuncParts(handler);
      this.handler = (req, res)=> {
        if (this.verb === "POST") assert(req.body != undefined);
        log.info(`Request body on route ${this.route}(${this.verb}): with request body = ${JSON.stringify(req.body)} \nExecuting function main.${parts[0]}...`)
        try{
          let result = _GetFuncResult(parts[0], req.body ? req.body[parts[1]] : undefined); //Do not put as parts
          log.info(`Got result, # of items are (length) ${result.length}`);
          //log.debug(result);
          let cache = []; //This is a method of avoiding circular reference error in JSON
          let limit = 100; //Limit which stops recursive depth otherwise a stack error might happen
          res.json(JSON.parse(JSON.stringify(result ? result : {}, function(key, value) {
            if (cache.length > limit) return; //Exceeded limit;
            //limit--;
            if (typeof value === 'object' && value !== null) {
              if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
              }
              log.debug(`JSON parse cache depth: ${cache.length}`);
              // Store value in our collection
              cache.push(value);
            }
            return value;
          })));
          cache = null; // Enable garbage collection
        }catch(e){
          log.error(`Error: ${e}`);
          res.status(200); //TODO: Manage proper HTTP codes according to meaning
          res.json(e.message);
        }
      };
    } else {
      console.log("%%%%%%%%% FUNCTION SET!")
      this.handler = handler;
    }    
  }
}

/**
 * DecisionNode is a Node inside the DecisionTreeEnvironment class. It is a special type of Detector with
 * Additional functions to support decisions.
 */
class DecisionNodeDetector extends ent.MotionDetector{
  
  constructor(descriptor, fn){
    if(!descriptor){
      throw new Error("ERROR: First parameter of DecisionNode should describe the assertion as a string.");
    }
    super(descriptor);
    if(typeof(fn) != "function"){
      throw new Error("ERROR: Second parameter of DecisionNode should be a function which executes the assertion.");
    }
    this.fn = fn;
    this.descriptor = descriptor;
    //Next node
    this.nextLeft; //Truthy node
    this.nextRight; //Falsy node
  }

  goToIfTrue(node){
    this.nextLeft = node;
  }

  goToIfFalse(node){
    this.nextRight = node;
  }

/**
 * Processes the decision based on the goToIf<True><False> Functions provided
 */
  process(){
    let result = {
      next: this.fn() ? this.nextLeft : this.nextRight,
      value: this.fn(),
      step: this.fn() ? `(TRUE) -> ${this.nextLeft.descriptor}` :  "(FALSE) -> ${this.nextRight.descriptor}"
    }
    if (result.value === undefined) throw new Error(`No node was defined as result, please add a decision node: Left: ${this.nextLeft}, Right: ${this.nextRight}`);
    return result;
  }
/**
 * Returns true if there are no left not right Next nodes
 */
  isLast(){
    return !(this.nextLeft || this.nextRight);
  }
}

/*
Implemented as a Singleton.
The SocketIO is in many ways very similar to the default Notifier, where binding detector
can be seen as the same as connecting a socket, the difference being it uses TCP port
for communication. In this case it makes this notifier possible to act both on
- Detector changes
- Socket incoming messages / events
*/
class SocketIONotifier extends ent.BaseNotifier{
  
  constructor(name, port=2999, callback){
    super(name);

    this.socketList = [];
    let _this = this;
  
    this.onSocketConnection = (socket)=> {
      //Closes socket connections as soon as the server is stopped
      newSocketConnections++;
      log.info(`Server ${_this.name} received a new socket connection. Overall nr. of historical connections is ${newSocketConnections}.`);
      _this.socketList.push(socket);
      _this.notify(`You are now connected to ${_this.name}!`, null, 'socket_is_connected');
      socket.on('close', function () {
        log.info('socket closing...');
        _this.socketList.splice(_this.socketList.indexOf(socket), 1);
      });
    }

    //TODO: Is there a better way than to declare an inner function?
    io.sockets.on('connection', this.onSocketConnection);
    log.info(`New server ${this.name} will now listen to port ${port}...`);
    io.listen(port);
    if (callback) callback(this);
  }

  //Notifies to all connected sockets
  notify(text, oldState, newState, environment, detector){
    super.notify(text, oldState, newState, environment, detector);
    log.info(`Server ${this.name} Will broadcast to connected sockets... ${this.socketList.length}...`);
    for(let i in this.socketList){
      log.info(`Emiting message to connected socket ${i}...`);
      this.socketList[i].emit('broadcast', { 
        text: text, 
        oldState: oldState, 
        newState: newState, 
        environment: environment, 
        detector: detector
      });
    }
  }

  stop()
  {
    super.stop();
    io.sockets.removeListener('connection', this.onSocketConnection);
    io.close();
  }
}

class SocketIODetector extends ent.MotionDetector{
  
  constructor(name, url = "http://localhost:2999"){
    super(name);
    log.info(`Creating new socket client named ${name} and connected to ${url}...`);
    this.client = clientIOFact(url);
  }

  startMonitoring(){
    super.startMonitoring();
    let _this = this;
    this.client.on('connection', (data)=>{
      _this.send(data)
    });
    this.client.on('close', (data)=>{
      _this.send(data)
    });
    this.client.on('broadcast', (data)=>{
      _this.send(data);
    });
    log.info("Socket started monitoring.");
  }

  deactivate(){
    super.deactivate();
    this.client.close();
  }

  exit()
  {
    this.client.destroy();
  }
}
/*
 * Creates an API Environment which retrieves a local key/secret and endpoint
 */
class APIEnvironment extends ext.SystemEnvironment{
  
  constructor(key, secret, endpoint, isMockMode){
    super("echo Starting APIEnvironment...");
    this.setAPIKey(key);
    this.setAPISecret(secret);
    this.setEndPoint(endpoint);
    this._isMockMode = isMockMode;
    this._bulkResults = [];
  }

  setEndPoint(endpoint){
    this._endpoint = endpoint;
  }

  setAPIKey(key){
    this._key = key;
  }

  setAPISecret(secret){
    this._secret = secret;
  }
 /**
 * Sets mock mode, allowing offline testing
 * @param {boolean} mode allows setting the mode to true or false - by default is false;
 */
  setMockMode(mode){
    this._isMockMode = mode;
  }

 /**
 * Returns the data
 * @param {number} src is the file path
 * @example 
 * @returns the schema, should be overriden by the sub-classes
 */
  getData(data, callback, endpoint_fragment = "undefined"){
    let _url = this._constructEndPoint(endpoint_fragment, data);
    this._request(_url, (err, response, body) => {
      callback(err, this._transformRawResponse(body), body);
    });
  }
  /**
  * Transforms the middleware raw response into the expected format
  */
  _transformRawResponse(raw){
    throw new Error("'_transformRawResponse' function, must be implemented by child classes.");
  }

  _request(endpoint, callback){
    //Checks if it is in mock mode
    log.info(">>> Starting request, checking if it is in Mock Mode...");
    if(this._isMockMode){
      this._mockRequest(callback);
    }
    else{
      request(`${endpoint}`, { json: true }, (err, response, body) => {
      if (err) { return console.log(err); }
      callback(err, response, body);
      });
    }
  }

  /**
  * Generates a response via mock - used e.g. for offline testing
  */
  _mockRequest(callback){
    throw new Error("_mockRequest should be implemented by child classes.");
  }
  /**
  * Constructs an endpoint based on a given key - should be overriden by shild classes
  * @param {String} key is some generic identifier which determines the format of the URL
  * @param {Object} value must be an object. The function will inject into that object the 'api_key' attribute 
  */
  _constructEndPoint(key, value){
    this._query = {
      url: "/" + value.id,
      key: key,
      value: value
    }
    value.api_key = this._key
    return endpoints.format(this._endpoint, value)
  }
}


//Given the configuration handler portion, separates into the function and arguments name and verifies if
//the function really exists
function _GetFuncParts(fn_name){
  let funcParts = fn_name.split(";")
  log.info(`Checking if function ${funcParts} exists in parent library...`)
  let func = getParent()[funcParts[0]]
  if (!func) throw new Error(`Error: function "${fn_name}" is not defined in vermon.`);
  else log.info(`Function exists! Returning ${funcParts.length} parts: ${funcParts}...`)
  return funcParts
}

//Executes a function with name fn_name in the main t-motion-detector module and passes its args
function _GetFuncResult(fn_name, args){
  log.info(`Calling function ${fn_name}(${args})...`)
  if (getParent()[fn_name]) {
    log.info('Function exists, will run it now...')
    return getParent()[fn_name](args);
  } else {
    log.error(`Function ${fn_name} does not exist in ${m}!`)
  }
}

function getParent() {
  log.info("Getting parent library (vermon)...");
  if(!vermon) {
    throw new Error("Error while getting vermon library, did you forget to call the 'vermon.use' method to add this extension?")
  }
  return vermon
}

//Extending Entities Factory
const classes = { CommandStdoutDetector, ExpressEnvironment, RequestDetector, APIEnvironment }

new ent.EntitiesFactory().extend(classes)

exports.GetHistoricalSocketConnections = () => newSocketConnections
exports.SocketIODetector = SocketIODetector
exports.SocketIONotifier = SocketIONotifier
exports.CommandStdoutDetector = CommandStdoutDetector
exports.DecisionNodeDetector = DecisionNodeDetector
exports.defaultPort = defaultPort
exports.ExpressEnvironment = ExpressEnvironment
exports.DecisionTreeEnvironment = DecisionTreeEnvironment
exports.APIEnvironment = APIEnvironment
exports.RequestDetector = RequestDetector
exports.inject = (parent) => {
  vermon = parent
}
exports.vermon
exports.appExists = appExists
exports.appInstance = appInstance