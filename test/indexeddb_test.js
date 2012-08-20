
goog.require('goog.debug.Console');
goog.require('goog.testing.jsunit');
goog.require('ydn.async');
goog.require('ydn.db.Storage');


var reachedFinalContinuation, basic_schema;
var table_name = 't1';

var setUp = function() {
  var c = new goog.debug.Console();
  c.setCapturing(true);
  goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.FINE);
  //goog.debug.Logger.getLogger('ydn.gdata.MockServer').setLevel(goog.debug.Logger.Level.FINEST);
  goog.debug.Logger.getLogger('ydn.db').setLevel(goog.debug.Logger.Level.FINEST);
  goog.debug.Logger.getLogger('ydn.db.IndexedDb').setLevel(goog.debug.Logger.Level.FINEST);


	basic_schema = new ydn.db.DatabaseSchema(1);
	basic_schema.addStore(new ydn.db.StoreSchema(table_name, 'id'));
};

var tearDown = function() {
  assertTrue('The final continuation was not reached', reachedFinalContinuation);
};

var db_name = 'test12';



var _test_1_put = function() {

  var db = new ydn.db.IndexedDb(db_name, basic_schema);

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertEquals('put a', 'a', put_value);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, {id: 'a', value: '1', remark: 'put test'}).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value = value;
    hasEventFired = true;
  });
};


var test_2_put_arr = function() {
  var db_name = 'test_2';
  var db = new ydn.db.IndexedDb(db_name, basic_schema);

  var arr = [
    {id: 'a' + Math.random(),
      value: 'a' + Math.random(), remark: 'put test'},
    {id: 'b' + Math.random(),
      value: 'b' + Math.random(), remark: 'put test'},
    {id: 'c' + Math.random(),
      value: 'c' + Math.random(), remark: 'put test'}
  ];

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertArrayEquals('put a', [arr[0].id, arr[1].id, arr[2].id], put_value);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.put(table_name, arr).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value = value;
    hasEventFired = true;
  });
};


var test_22_select = function() {
  var db_name = 'test_select';
  var db = new ydn.db.IndexedDb(db_name, basic_schema);

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
    db.fetch(q).addCallback(function(q_result) {
      console.log('receiving query');
      put_value = q_result;
      hasEventFired = true;
    })
  });
};


//var _test_3_empty_get = function() {
//
//  var db = new ydn.db.IndexedDb(db_name, basic_schema);
//
//  var hasEventFired = false;
//  var put_value;
//
//  waitForCondition(
//      // Condition
//      function() { return hasEventFired; },
//      // Continuation
//      function() {
//        assertUndefined('retriving non existing value', put_value);
//        // Remember, the state of this boolean will be tested in tearDown().
//        reachedFinalContinuation = true;
//      },
//      100, // interval
//      2000); // maxTimeout
//
//
//  db.get(table_name, 'no_data').addCallback(function(value) {
//    console.log('receiving value callback.');
//    put_value = value;
//    hasEventFired = true;
//  });
//};


var test_4_get_all = function() {

  var db = new ydn.db.IndexedDb(db_name, basic_schema);

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertArrayEquals('get empty table', [], put_value);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.get(table_name).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value = value;
    hasEventFired = true;
  });
};



var test_5_clear = function() {
	var db = new ydn.db.IndexedDb(db_name, basic_schema);

  var hasEventFired = false;
  var put_value;

  waitForCondition(
      // Condition
      function() { return hasEventFired; },
      // Continuation
      function() {
        assertEquals('clear', true, put_value);
        // Remember, the state of this boolean will be tested in tearDown().
      },
      100, // interval
      1000); // maxTimeout

  var dfl = db.clear(table_name);
  dfl.addCallback(function(value) {
    put_value = value;
    hasEventFired = true;
  }).addErrback(function(v) {
    fail('should not get error.');
  });

  var countValue;
  var countDone;
  waitForCondition(
      // Condition
      function() { return countDone; },
      // Continuation
      function() {
        assertEquals('count 0 after clear', 0, countValue);
        // Remember, the state of this boolean will be tested in tearDown().
        reachedFinalContinuation = true;
      },
      100, // interval
      1000); // maxTimeout

  db.count(table_name).addCallback(function(value) {
    countValue = value;
    countDone = true;
  });

};


/**
 */
var test_6_special_keys = function() {
  var db_name = 'test_6';
	var db = new ydn.db.IndexedDb(db_name, basic_schema);

  var key_test = function(key) {
    console.log('testing ' + key);
    var key_value = 'a' + Math.random();

    var a_done;
    var a_value;
    waitForCondition(
        // Condition
        function() { return a_done; },
        // Continuation
        function() {
          assertEquals('put a', key, a_value);
        },
        100, // interval
        2000); // maxTimeout

    db.put(table_name, {id: key, value: key_value}).addCallback(function(value) {
      console.log('receiving put value callback for ' + key + ' = ' + key_value);
      a_value = value;
      a_done = true;
    });

    var b_done;
    var b_value;
    waitForCondition(
        // Condition
        function() { return b_done; },
        // Continuation
        function() {
          assertEquals('get', key_value, b_value.value);
          reachedFinalContinuation = true;
        },
        100, // interval
        2000); // maxTimeout


    db.get(table_name, key).addCallback(function(value) {
      console.log('receiving get value callback ' + key + ' = ' + value);
      b_value = value;
      b_done = true;
    });
  };

  key_test('x');

  key_test('t@som.com');

  key_test('http://www.ok.com');

};



var test_7_put_nested_keyPath = function() {
  var store_name = 'ts1';
  var put_obj_dbname = 'putodbtest2';
	var schema = new ydn.db.DatabaseSchema(1);
	schema.addStore(new ydn.db.StoreSchema(store_name, 'id.$t'));
	var db = new ydn.db.IndexedDb(put_obj_dbname, schema);

  var key = 'a';
  var put_done = false;
  var put_value = {value: Math.random()};
  put_value.id = {$t: key};
  var put_value_received;

  waitForCondition(
      // Condition
      function() { return put_done; },
      // Continuation
      function() {
        assertEquals('put a 1', key, put_value_received);
        // Remember, the state of this boolean will be tested in tearDown().
      },
      100, // interval
      2000); // maxTimeout

  db.put(store_name, put_value).addCallback(function(value) {
    console.log('receiving value callback.');
    put_value_received = value;
    put_done = true;
  });

  var get_done;
  var get_value_received;
  waitForCondition(
      // Condition
      function() { return get_done; },
      // Continuation
      function() {
        assertObjectEquals('get', put_value, get_value_received);
        reachedFinalContinuation = true;
      },
      100, // interval
      2000); // maxTimeout


  db.get(store_name, key).addCallback(function(value) {
    console.log('receiving get value callback ' + key + ' = ' + JSON.stringify(value) + ' ' + typeof value);
    get_value_received = value;
    get_done = true;
  });

};


var test_8_query_start_with = function () {
  var store_name = 'ts1';
  var dbname = 'test_8';
  var schema = new ydn.db.DatabaseSchema(1);
  // NOTE: key also need to be indexed.
  var indexSchema = new ydn.db.IndexSchema('id', true);
  schema.addStore(new ydn.db.StoreSchema(store_name, 'id', false, [indexSchema]));
  //schema.addStore(new ydn.db.StoreSchema(store_name, 'id'));
  var db = new ydn.db.IndexedDb(dbname, schema);

  var objs = [
    {id:'qs1', value:Math.random()},
    {id:'qs2', value:Math.random()},
    {id:'qt', value:Math.random()}
  ];

  var put_value_received;
  var put_done;
  waitForCondition(
    // Condition
    function () {
      return put_done;
    },
    // Continuation
    function () {
      assertArrayEquals('put objs', [objs[0].id, objs[1].id, objs[2].id],
        put_value_received);

      var get_done;
      var get_value_received;
      waitForCondition(
        // Condition
        function () {
          return get_done;
        },
        // Continuation
        function () {
          assertEquals('obj length', objs.length - 1, get_value_received.length);
          assertObjectEquals('get', objs[0], get_value_received[0]);
          assertObjectEquals('get', objs[1], get_value_received[1]);
          reachedFinalContinuation = true;
        },
        100, // interval
        2000); // maxTimeout


      var keyRange = ydn.db.Query.createKeyRange(ydn.db.Query.Op.START_WITH, 'qs');
      var q = new ydn.db.Query(store_name, 'id', {keyRange: keyRange});
      console.log([keyRange, q]);
      db.fetch(q).addCallback(function (value) {
        get_value_received = value;
        get_done = true;
      });

    },
    100, // interval
    2000); // maxTimeout


  db.put(store_name, objs).addCallback(function (value) {
    console.log(['receiving value callback.', value]);
    put_value_received = value;
    put_done = true;
  });

};

var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);



