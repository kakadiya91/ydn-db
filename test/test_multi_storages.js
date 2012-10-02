/**
 * Test for Issue 17: multiple concurrent IndexedDB open requests test
 *
 * 1. Before running this test, clear offline data in the browser so that
 * testing db are not already exist.
 * 2. configure firefox to ask the user before letting your domain use offline storage
 */


ydn.db.conn.IndexedDb.DEBUG = true;
var div = document.getElementById('console');
var c = new goog.debug.DivConsole(div);
c.setCapturing(true);

goog.debug.Logger.getLogger('ydn.db').setLevel(goog.debug.Logger.Level.FINE);
goog.debug.Logger.getLogger('ydn.db.conn').setLevel(goog.debug.Logger.Level.FINEST);

// NOTE: size is only used in WebSQL
var options = {
  size: 10*1024*1024,
  preference: ['websql', 'indexeddb']
};


// need to test '1' and 'undefined' cases.
var ver = 1;

var schema1 = {version: ver, stores: [{name: 'st1', keyPath: 'id'}]};
var schema2 = {version: ver, stores: [{name: 'st2', keyPath: 'id'}]};

var db1 = new ydn.db.Storage('db1', schema1, options);
var db2 = new ydn.db.Storage('db2', schema2, options);

db1.put('st1', {id: 1, value: 'test 1'});
db2.put('st2', {id: 1, value: 'test 2'});

db1.get('st1', 1).addCallback(function(x) {
  console.log('got from db1');
  console.log(x);
});

db2.get('st2', 1).addCallback(function(x) {
  console.log('got from db2');
  console.log(x);
});