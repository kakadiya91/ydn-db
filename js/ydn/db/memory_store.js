// Copyright 2012 YDN Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Store data in memory.
 *
 * This is used for mocking database.
 */

goog.provide('ydn.db.MemoryStore');
goog.require('ydn.db.Db');



/**
 * @implements {ydn.db.Db}
 * @constructor
 * @param {string} dbname database name.
 * @param {Array.<!ydn.db.DatabaseSchema>} schemas table schema contain table
 * name and keyPath.
 */
ydn.db.MemoryStore = function(dbname, schemas) {
  this.dbname = dbname;
  this.schema = schemas[schemas.length - 1];

  /**
   * @final
   * @protected
   * @type {Object}
   */
  this.cache = {};
  for (var table in this.schema) {
    goog.asserts.assertString(this.schema[table].keyPath, 'keyPath ' +
        this.schema[table].keyPath + ' not defined in ' + table + ' ' +
        ydn.json.stringify(this.schema[table]));
    this.cache[table] = {};
  }
};



/**
 * @inheritDoc
 */
ydn.db.MemoryStore.prototype.put = function(table, value) {
  //  if (!goog.isDef(key)) {
  //    goog.asserts.assertObject(this.schema[table], 'table: ' + table +
  // ' is not defined in ' + this.dbname);
  //    goog.asserts.assertString(this.schema[table].keyPath, 'keyPath ' +
  // this.schema[table].keyPath + ' not defined in ' + table + ' ' +
  // JSON.stringify(this.schema[table]));
  //    key = value[this.schema[table].keyPath];
  //  }
  var key = value[this.schema[table].keyPath];
  goog.asserts.assertString(key, 'keyPath: ' + this.schema[table].keyPath +
      ' not defined in ' + JSON.stringify(value));
  this.cache[table][key] = value;
  return goog.async.Deferred.succeed(true);
};



/**
 * @inheritDoc
 */
ydn.db.MemoryStore.prototype.get = function(table, key) {
  goog.asserts.assertString(table);
  goog.asserts.assertString(key);
  var keyPath = this.schema[table].keyPath;
  for (var k in this.cache[table]) {
    var value = this.cache[table][k];
    if (value[keyPath] === key) {
      return goog.async.Deferred.succeed(value);
    }
  }

  return goog.async.Deferred.fail(undefined);
};


/**
 * @inheritDoc
 */
ydn.db.MemoryStore.prototype.clear = function(table) {
  if (goog.isDef(table)) {
    this.cache[table] = {};
  } else {
    for (var tb in this.cache) {
      this.cache[tb] = {};
    }
  }
  return goog.async.Deferred.succeed(true);
};


/**
 * @inheritDoc
 */
ydn.db.MemoryStore.prototype.count = function(table) {
  table = table || ydn.db.Storage.DEFAULT_TEXT_STORE;
  var d = new goog.async.Deferred();
  var n = 0;
  for (var key in this.cache[table]) {
    n++;
  }
  d.callback(n);
  return d;
};


/**
 * @inheritDoc
 */
ydn.db.MemoryStore.prototype.fetch = function(q) {
  return goog.async.Deferred.fail(true); // don't bother to implement
};



/**
 * @inheritDoc
 */
ydn.db.MemoryStore.prototype.remove = function(opt_table, opt_id) {
  if (goog.isDef(opt_table) && goog.isDef(opt_id)) {
    delete this.cache[opt_table][opt_id];
    return goog.async.Deferred.succeed(true);
  } else {
    return this.clear();
  }
};
