[![NPM info](https://nodei.co/npm/vermon-web.png?downloads=true)](https://www.npmjs.com/package/vermon-web)

[![Travis build status](https://travis-ci.org/tcardoso2/vermon-web.png?branch=master)](https://travis-ci.org/tcardoso2/t-motion-detector-cli)
[![dependencies](https://david-dm.org/tcardoso2/vermon-web.svg)](https://david-dm.org/tcardoso2/vermon-web.svg)

[![Unit tests](https://github.com/tcardoso2/vermon-web/blob/master/badges/badge.svg)](https://github.com/tcardoso2/vermon-web/blob/master/badges/badge.svg) 

[![Missing tests](https://github.com/tcardoso2/vermon-web/blob/master/badges/missing_tests.svg)](https://github.com/tcardoso2/vermon-web/blob/master/badges/missing_tests.svg) 

# Vermon Web
A vermon Plugin / API tool to monitor your Environment, Motion sensors and Notifiers.
From version 0.5.11 onwards this tool no longer works standalone, but is a plugin of vermon, so you require to install vermon npm package and can use vermon-web via:
```
let vermon = require('vermon')
let vermon_web = require('vermon-web')
vermon.use(vermon_web)
```
* v 0.5.18:
  - Bug fixes which were causing several express instances to be created, now only one express instance can exist per process;  
* v 0.5.17:
  - vermon-core-entities 0.5.13 dependency, bug fixes;  
* v 0.5.16:
  - vermon-core-entities 0.5.12 dependency upgrade which adds RequestReplyWorker to the Notifiers available;  
* v 0.5.15:
  - vermon-core-entities 0.5.10 dependency upgrade to fix StompNotifier bug not stringifying json;  
* v 0.5.14:
  - vermon-core-entities 0.5.9 dependency upgrade to fix StompNotifier bug;  
* v 0.5.13:
  - ExpressEnvironment now inherits Environment class and not SystemEnvironment to fix complexity issues
  - vermon-core-entities 0.5.8 dependency upgrade;  
* v 0.5.12:
  - Added RequestDetector tests / checks for mandatory arguments;
  - Upgraded to vermon-core-entities 0.5.6 to fix unwanted behaviour of Environment running underlying command from SystemEnvironment;
* v 0.5.11:
  - Badge update after some test fixes;
  - ignoring temporarily --startweb CLI tests since last 0.5.10 build broke the cli tool (issue logged #2),
  - added message "server.js" will be deprecated in future versions;
  - Started fixing some vulnerability dependencies (critical and high vulnerability);  
* v 0.5.10:Starting migration to vermon-core-entities (vermon cannot be used as dependency, to solve object type issues, can only be used for tests if really necessary); implemented injection, starting to fix express tests (WIP);  
* v 0.5.9 :Fixing Express tests; WIP on injecting parent functions (plugins work WIP);  
* v 0.5.8 :Added Logger middleware; Fixed request body issue showing as undefined;    
* v 0.5.7 :New syntax - Bug fixes on CLI, added flag --log to allow to specify the log level;  
* v 0.5.6 :Fixed some more express tests;  
* v 0.5.5 :ESLinted the tests code; Expressenvironment only starts listening if is not listening;  
* v 0.5.4 :Some improvements on readibility of main.js; added a couple of plugin new tests; solved a few more unit tests;  
* v 0.5.3 :Web server can start with "> vermon --startweb";  
* v 0.5.2 :WIP on fixing Express tests: Added Entities, refactored code, main module is no longer an express
           app, the express server can be assessed via getWebApp instead; added vermon tests for new vermon methods, start, reset and getWebApp added when vermon-web plugin is added;  
* v 0.5.1 :WIP on fixing tests; changed main.Reset to main.reset (lowercase); vermon-web plugin no longer has the
           _ accessor. To access vermon, you should import it instead (removed redundancies); fixed existing api and commander tests, next ones to fix are express server tests; added eslint settings (WIP), applied to the new main.js file; added server.js (as the old main.js);  
* v 0.5.0 :Changed package name to vermon-web, made some naming changes, WIP on fixing tests;   
* v 0.4.3 :Atlasboard app now invokes ngrok via api and gets url directly, no longer statically configured in default.json;  
* v 0.4.2 :Updated CommandStdoutDetector tests (WIP);  
* v 0.4.1 :Fixed Express breaking tests, root page is now under /site. npm test now uses mocha --exit to revert to pre v4.0.0 behaviour, that is, it exist after tests are done;    
* v 0.4.0 :Minor version update; doing some clean up; Added README info on current features and skipped / failing tests, as well what is the current focus;   
* v 0.3.32 :Removed some unecessary packages, skipping tests temporarily to focus on actual work;  
* v 0.3.31 :(WIP) SocketIODetector testing with SocketIONotifier;  
* v 0.3.30 :(WIP) Starting work on SocketIODetector and SocketIONotifier, a socket.io wrapper for client and server respectively;  
* v 0.3.29 :(WIP) Atlasboard, added more sensor data (still customized, to be configured instead);  
* v 0.3.28 :(WIP) Atlasboard, added configuration to take temperature from socket instead of backend detector (for remote clients);  
* v 0.3.27 :(WIP) Atlasboard updates, to include socket.io values from iobroker, still static stuff, pretty much PoC level only;  
* v 0.3.26 :(WIP) First version of Atlasboard which makes use of iobroker (static calls for now, in later versions shoould be changed to proper detectors)  
* v 0.3.25 :(WIP) Working on Angular JS demo clean up. Testing (WIP) also Nativescript [https://www.nativescript.org/nativescript-is-how-you-build-native-mobile-apps-with-angular] and playground on [https://play.nativescript.org/], on tns-site (run with "tns run <platform>");  
* v 0.3.24 :(WIP) trial testing using CouchDB / PouchDB database;  
* v 0.3.23 :(WIP) added demo code of Angular Mobile (+bootstrap) with examples to start gradually working on the new UI;  
* v 0.3.22 :Added script to test web-server, fixing bugs;  
* v 0.3.21 :Small fix on logs which were causeing crash;  
* v 0.3.20 :Starting offline app creation (react);  
* v 0.3.19 :Updated dependency to t-motion-detector@0.5.36, changing pending tests to "xit(xxx)" which marks them as pending    
* v 0.3.18 :Updated dependency to t-motion-detector@0.5.30, to include fixes on dependency...  
* v 0.3.17 :Updated dependency to t-motion-detector@0.5.30, to include Multi-Environments; Minor changes on serializing ExpressEnvironment to prevent circular reference errors  
* v 0.3.16 :Updated dependency to t-motion-detector@0.5.25. Bug fixing on express tests...  
* v 0.3.15 :Working on simplifications of the module. (WIP) There are 2 ways to use it, as a plugin (via require keyword) and calling it from the StartWithConfig function and directly in the console (via calling node t-motion-detector-cli); bug fixes (WIP on force = true).  
* v 0.3.14 :Dependency update, logger replaced with tracer module.  
* v 0.3.13 :Minor update of dependency.  
* v 0.3.12 :Update of dependency. Creation of first version of APIEnvironment, which retrieves locally stored key/secret pair;  
* v 0.3.10 and 0.3.11:Update of dependency to fix bug.  
* v 0.3.9 :Changed DecisionTreeNode to DecisionTreeDetector, added functionality to process nodes, and to add truthy and falsy children nodes.  
* v 0.3.8 :Continued working on DecisionTreeEnvironment class adding DecisionNodes  
* v 0.3.7 :Started working on DecisionTreeEnvironment class, and BotFullfillmentDetector  
* v 0.3.6 :Needed a better way to create/design commands so started creating Commander class (WIP)  
* v 0.3.5 :Implemented CommandStdoutDetector. Added mocha unit tests badge.  
* v 0.3.4 :Working on CommandStdoutDetector (WIP), small fixes. Minor improvements on documentation.  
* v 0.3.3 :Added handling to not allow starting main.js directly, only via 'require' keyword; Added reporter badge for unit tests. Started creating tests for CommandStdoutDetector.  
* v 0.3.2 :Updated dependency reference to t-motion-detector@v0.5.13.  
* v 0.3.1 :Implementing Reset method for Plugins. Implementing default Detectors created when t-motion-detector-cli is ran directly (e.g. there should be default detectors to create and remove elements and a default ExpressEnvironment) - WIP. Normalizing logging to use log library instead of console.log for proper logging. Update to version t-motion-detector@v0.5.10  
* v 0.3.0 :Updated dependency reference to t-motion-detector@v0.5.9, fixes. Working on maxAttampts for the Environment when address is already in use. Added more tests to run directly application from main, and be able to add elements from the web-UI (WIP). Working on proper HTML CSS formating. "Start" function of the main module
is now called after StartWithConfig   
* v 0.2.13:Updated dependency reference to t-motion-detector@v0.5.6  
* v 0.2.12:Tested SystemEnvironment json service  
* v 0.2.11:Added new tests, working on SystemEnvironment json service, updated license and reference to t-motion-detector@v0.5.3  
* v 0.2.10:updating to t-motion-detector@0v.0.5.1  
* v 0.2.9: Changed inheritance of ExpressEnvironment to SystemEnvironment, fixed tests (WIP)  
* v 0.2.8: updating to t-motion-detector@0v.0.5.0, adding badges for npm, travis build and dependency status.   
* v 0.2.7: updating to t-motion-detector@0v.0.4.14 to remove postinstall script  
* v 0.2.6: adding travis-ci config files, updating to t-motion-detector@0v.4.13  
* v 0.2.5: Adding new unit tests for a new detector, NetworkDetector.  
* v 0.2.4: Binding to t-motion-detector version 0.4.11, to allow avoiding type checks when adding Detector instances.  
* v 0.2.3: Binding to t-motion-detector version 0.4.10  
* v 0.2.2: Added static address in the ExpressEnvironment constructor, defaulting to internal public folder  
* v 0.2.1: Testing Support to Extension integration with t-motion-detector v 0.4.9 (WIP)  
* v 0.2.0: First version published to npm. Added Code of Conduct and template for Documentation (WIP)  
* v 0.1.9: Concluded implementation of POST method to activate and deactivate Detectors.  
* v 0.1.8: WIP, Started testing POST methods, adding activation and deactivation of Motion Detectors.  
* v 0.1.7: Configuration allows to map routes to functions in main file in t-motion-detector, WIP on HTML  
* v 0.1.6: Fixed some bugs create dinamic page for detectors and notifiers, binded to temporary slack notifier.  
* v 0.1.5: Implemented first service config/detectors, not yet in a readable friendly format (WIP).  
* v 0.1.4: Refactoring the ExpressNotifier as an ExpressEnvironment instead, because it fits more the model of an Environment, where Motion Detectors and Notifiers can be put on top instead (WIP).  
Added static directory, and added AngularJS, first test page;  
* v 0.1.3: Created first version of the ExpressNotifier a wrapper of for the Express web server as a notifier object.  
* v 0.1.2: Removed user story unit tests  (not relevant for this project).  
* v 0.1.1: Building first unit tests, first express welcome message;  
* v 0.1.0: First version, draft for first tests and package file;  

## Links  
  - [Documentation](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/DOCUMENTATION.md) 
  - [Code of Conduct](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/CODE_OF_CONDUCT.md)   
  - [Adding Plugins](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/ADDING_PLUGINS.md)   
  - [Feature Status](https://github.com/tcardoso2/t-motion-detector-cli/blob/master/test/README.md)  

## Requirements for building vermon Plug-ins
  - module must export an 'id' property;  
  - module must export a PreAddPlugin function (even if it is empty);  
  - module must export a PostAddPlugin function (even if it is empty);  
  - module must export a ShouldStart function;
  - module must export a Start function;
