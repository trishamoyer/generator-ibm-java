/*
 * Copyright IBM Corporation 2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Tests the basic generator
 */
'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var config = require('../../generators/lib/config');
var common = require('../lib/commontest');

const ARTIFACTID = 'artifact.0.1';
const GROUPID = 'test.group';
const VERSION = '1.0.0';
const APPNAME = 'testApp';

function Options() {
  this.debug = "true";
  this.version = VERSION;
  this.groupId = GROUPID;
  this.assert = function(appName, ymlName, cloudant, objectStorage) {
    common.assertCommonFiles();
    common.assertCLI(appName);
    common.assertBluemixSrc(cloudant || objectStorage);
    common.assertManifestYml(ymlName, cloudant || objectStorage);
    common.assertCloudant(cloudant);
    common.assertObjectStorage(objectStorage);
    common.assertK8s(appName);
    common.assertFiles('', true, 'README.md');
    common.assertFiles('src', true, 'main/java/application/rest/HealthEndpoint.java',
                                    'main/java/application/rest/SwaggerEndpoint.java',
                                    'main/java/application/model/Product.java',
                                    'main/java/application/openapi/ProductsApi.java',
                                    'main/java/application/openapi/ProductApi.java',
                                    'test/java/it/HealthEndpointTest.java',
                                    'main/webapp/WEB-INF/ibm-web-ext.xml')
  }
}

beforeEach(function() {
  //make sure we start with a valid config object
  config.reset();
});

describe('java generator : bff integration test', function () {

  describe('Generates a basic bff project (no bluemix)', function () {

    it('with gradle build system', function (done) {
      var options = new Options();
      helpers.run(path.join( __dirname, '../../generators/app'))
        .withOptions(options)
        .withPrompts({ buildType : 'gradle', createType: 'bff', services: ['none'], appName: APPNAME})
      .toPromise().then(function() {
        options.assert(APPNAME, APPNAME, false, false);
        common.assertGradleFiles(APPNAME);
        done();
      }, function(err) {
        assert.fail(false, "Test failure ", err);
      });                        // Get a Promise back when the generator finishes
    });

    it('with maven build system', function (done) {
      var options = new Options();
      helpers.run(path.join( __dirname, '../../generators/app'))
        .withOptions(options)
        .withPrompts({buildType : 'maven', createType: 'bff', appName: APPNAME })
      .toPromise().then(function() {
        options.assert(APPNAME, APPNAME, false, false);
        common.assertMavenFiles(APPNAME);
        done();
      }, function(err) {
        assert.fail(false, "Test failure ", err);
      });                        // Get a Promise back when the generator finishes
    });

  });

  describe('Generates a basic bff project (bluemix)', function () {

    it('with cloudant', function (done) {
      var options = new Options();
      helpers.run(path.join( __dirname, '../../generators/app'))
        .withOptions(options)
        .withPrompts({buildType : 'maven', createType: 'bff', services : ['cloudant'], appName : 'bxName' })
      .toPromise().then(function() {
        options.assert('bxName', 'testBxName', true, false);
        common.assertMavenFiles('bxName');
        done();
      }, function(err) {
        assert.fail(false, "Test failure ", err);
      });                        // Get a Promise back when the generator finishes
    });
    it('with objectStorage', function (done) {
      var options = new Options();
      helpers.run(path.join( __dirname, '../../generators/app'))
        .withOptions(options)
        .withPrompts({buildType : 'maven', createType: 'bff', services : ['objectStorage'], appName : 'bxName' })
      .toPromise().then(function() {
        options.assert('bxName', 'testBxName', false, true);
        common.assertMavenFiles('bxName');
        done();
      }, function(err) {
        assert.fail(false, "Test failure ", err);
      });                        // Get a Promise back when the generator finishes
    });

    it('with cloudant and objectStorage', function (done) {
      var options = new Options();
      helpers.run(path.join( __dirname, '../../generators/app'))
        .withOptions(options)
        .withPrompts({buildType : 'maven', createType: 'bff', services : ['objectStorage', 'cloudant'], appName : 'bxName' })
      .toPromise().then(function() {
        options.assert('bxName', 'testBxName', true, true);
        common.assertMavenFiles('bxName');
        done();
      }, function(err) {
        assert.fail(false, "Test failure ", err);
      });                        // Get a Promise back when the generator finishes
    });

  });

});