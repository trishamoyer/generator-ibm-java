var Generator = require('yeoman-generator');
var Mustache = require('mustache');
var config = require("./lib/config");
var processor = require("./lib/fsprocessor");
var control = require("./lib/control");
var fspath = require('path');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);

    //create command line options that will be passed by YaaS
    this.option('maven');
    this.option('gradle');
  }

  prompting() {
    return this.prompt([{
      type    : 'list',
      name    : 'createType',
      message : 'This is a test front end for manually driving the Java code generator.\n',
      choices : [{
        name : 'REST : a basic REST sample used to test this generator',
        value : 'rest',
        short : 'REST sample application'
      }, {
        name : 'Basic : a basic Java microservice (TBD)',
        value : 'basic',
        short : 'Basic Java microservice'
      }],
      default : 0 // Default to rest sample
    }, {
      type    : 'list',
      name    : 'buildType',
      message : 'Select the build type for your project.\n',
      choices : ['maven', 'gradle'],
      default : 0 // Default to maven
    }]).then((answers) => {
      //configure the sample to use based on the type we are creating
      config.data.templatePath = 'cnds-java-starter-' + answers.createType;
      config.data.templateFullPath = this.templatePath(config.data.templatePath);
      config.data.projectPath = fspath.resolve(this.destinationRoot(), "projects/" + answers.createType);
      config.data.buildType = answers.buildType;
      control.processProject(config);
    });
  }

  writing() {
    this.log('template path [' + config.data.templatePath  +']');
    this.log('project path [' + config.data.projectPath  +']');
    if(!config.isValid()) {
      //the config object is not valid, so need to exit at this point
      this.log("Error : configuration is invalid, code generation is aborted");
      return;
    }
    this.destinationRoot(config.data.projectPath);
    //this.log("Destination path : " + this.destinationRoot());
    processor.path = this.templatePath(config.data.templatePath);
    //console.log(JSON.stringify(processor));
    return processor.scan((relativePath, template) => {
      if(!control.shouldGenerate(relativePath)) {
        return;   //do not include this file in the generation
      }
      var outFile = this.destinationPath(relativePath);
      //console.log("CB : writing to " + outFile);
      var output = Mustache.render(template, config.data);
      this.fs.write(outFile, output);
    });
  }

};
