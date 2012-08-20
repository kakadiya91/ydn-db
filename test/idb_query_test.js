
goog.require('goog.debug.Console');
goog.require('goog.testing.jsunit');
goog.require('ydn.async');
goog.require('ydn.db.Storage');
goog.require('goog.testing.PropertyReplacer');


var reachedFinalContinuation, basic_schema;
var table_name = 't1';
var stubs;

var setUp = function() {
  var c = new goog.debug.Console();
  c.setCapturing(true);
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.FINE);
  //goog.debug.Logger.getLogger('ydn.gdata.MockServer').setLevel(goog.debug.Logger.Level.FINEST);
  goog.debug.Logger.getLogger('ydn.db').setLevel(goog.debug.Logger.Level.FINEST);
  goog.debug.Logger.getLogger('ydn.db.IndexedDb').setLevel(goog.debug.Logger.Level.FINEST);

	basic_schema = new ydn.db.DatabaseSchema(1);
  var index = new ydn.db.IndexSchema('id');
  var store = new ydn.db.StoreSchema(table_name, 'id', false, [index]);
	basic_schema.addStore(store);
};

var tearDown = function() {
  assertTrue('The final continuation was not reached', reachedFinalContinuation);
};

var db_name = 'test12';


var test_2_idb_select = function() {

  goog.userAgent.product.ASSUME_CHROME = true;

  var db_name = 'test_2_idb_select';
  var db = new ydn.db.Storage(db_name, basic_schema);

  var arr = [
    {id: 'a', value: 'A'},
    {id: 'b', value: 'B'},
    {id: 'c', value: 'C'}
  ];

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertArrayEquals('select query', [arr[0].value, arr[1].value, arr[2].value],
            put_value);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr).addCallback(function(value) {
    console.log('receiving value callback ' + JSON.stringify(value));

    var q = db.query(table_name);
    q.select('value');
    db.fetch(q).addCallback(function(q_result) {
      console.log('receiving query ' + JSON.stringify(q_result));
      put_value = q_result;
      hasEventFired = true;
    })
  });
};


var test_3_idb_count = function() {

  goog.userAgent.product.ASSUME_CHROME = true;

  var db_name = 'test_3_idb_count';
  var db = new ydn.db.Storage(db_name, basic_schema);

  var arr = [
    {id: 'a', value: 'A'},
    {id: 'b', value: 'B'},
    {id: 'c', value: 'C'}
  ];

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertEquals('select query', 3, put_value);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr).addCallback(function(value) {
    console.log('receiving value callback ' + JSON.stringify(value));

    var q = db.query(table_name);
    q.count();
    db.fetch(q).addCallback(function(q_result) {
      console.log('receiving query ' + JSON.stringify(q_result));
      put_value = q_result;
      hasEventFired = true;
    })
  });
};


var test_4_idb_sum = function() {

  goog.userAgent.product.ASSUME_CHROME = true;

  var db_name = 'test_4_idb_sum2';
  var db = new ydn.db.Storage(db_name, basic_schema);

  var arr = [
    {id: 'a', value: Math.random()},
    {id: 'b', value: Math.random()},
    {id: 'c', value: Math.random()}
  ];

  var total = arr[0].value + arr[1].value + arr[2].value;

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertRoughlyEquals('sum query', total, put_value, 0.001);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr).addCallback(function(value) {
    console.log('receiving value callback ' + JSON.stringify(value));

    var q = db.query(table_name);
    q.sum('value');
    db.fetch(q).addCallback(function(q_result) {
      console.log('receiving query ' + JSON.stringify(q_result));
      put_value = q_result;
      hasEventFired = true;
    })
  });
};



var test_4_idb_avg = function() {

  goog.userAgent.product.ASSUME_CHROME = true;

  var db_name = 'test_4_idb_avg';
  var db = new ydn.db.Storage(db_name, basic_schema);

  var arr = [
    {id: 'a', value: Math.random()},
    {id: 'b', value: Math.random()},
    {id: 'c', value: Math.random()}
  ];

  var avg = (arr[0].value + arr[1].value + arr[2].value) / 3;

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertRoughlyEquals('sum query', avg, put_value, 0.001);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr).addCallback(function(value) {
    console.log('receiving value callback ' + JSON.stringify(value));

    var q = db.query(table_name);
    q.average('value');
    db.fetch(q).addCallback(function(q_result) {
      console.log('receiving query ' + JSON.stringify(q_result));
      put_value = q_result;
      hasEventFired = true;
    })
  });
};


var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);



