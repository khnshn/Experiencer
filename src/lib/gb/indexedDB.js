/*
 * indexedDB setup
 */
var db;
var allowed = false;
var request = window.indexedDB.open("GB", 2);
// indexeddb error callback
request.onerror = function (event) {
  console.log("indexedDB::request error");
};
// indexeddb success callback
request.onsuccess = function (event) {
  db = event.target.result;
  console.log("indexedDB::request success");
  allowed = true;
};
// indexeddb upgrade callback
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("activity", {
    keyPath: "id",
    autoIncrement: true,
  });
  db.createObjectStore("settings", {
    keyPath: "key",
  });
  db.createObjectStore("ml_settings", {
    keyPath: "key",
  });
  console.log("indexedDB::upgrade success");
};
// add new item to objectSore
function add(data, objStore, callback = function dummy() {}) {
  if (!allowed) {
    return;
  }
  var request = db
    .transaction([objStore], "readwrite")
    .objectStore(objStore)
    .add(data);

  request.onsuccess = function (event) {
    console.log("indexedDB::new data added");
    callback();
  };

  request.onerror = function (event) {
    console.log("indexedDB::unable to add data");
  };
}
// remove item from objectStore by id
function remove(id, objStore, callback = function dummy() {}) {
  var request = db
    .transaction([objStore], "readwrite")
    .objectStore(objStore)
    .delete(id);

  request.onsuccess = function (event) {
    console.log("indexedDB::" + id + " removed successfully");
    callback();
  };

  request.onerror = function (event) {
    console.log(event);
  };
}
// update item in objectStore
function update(data, objStore, callback = function dummy() {}) {
  if (!allowed) {
    return false;
  }
  var request = db
    .transaction([objStore], "readwrite")
    .objectStore(objStore)
    .put(data);

  request.onsuccess = function (event) {
    console.log("indexedDB::data updated");
    callback();
  };

  request.onerror = function (event) {
    console.log("indexedDB::unable to update data");
  };
}
// read all data from objectStore
function readAll(objStore) {
  var all = [];
  var defer = $.Deferred();
  console.log("indexedDB::called read all");
  if (!allowed) {
    console.log("indexedDB::rejected read all");
    return;
  }
  var transaction = db.transaction(objStore);
  var objectStore = transaction.objectStore(objStore);

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      // console.log(cursor.value);
      all.push(cursor.value);
      cursor.continue();
    } else {
      defer.resolve(all);
      return;
    }
  };
  return defer.promise();
}
// read all data from objectStore
function readOne(key, objStore) {
  var result;
  var defer = $.Deferred();
  console.log("indexedDB::called read one");
  if (!allowed) {
    console.log("indexedDB::rejected read one");
    return;
  }
  var transaction = db.transaction(objStore);
  var objectStore = transaction.objectStore(objStore);

  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      if (cursor.value.key == key) {
        result = cursor.value.value;
      }
      cursor.continue();
    } else {
      defer.resolve(result);
      return;
    }
  };
  return defer.promise();
}
// count records in objectStore
function countRecords(objStore) {
  console.log("indexedDB::called count all");
  if (!allowed) {
    console.log("indexedDB::rejected read last");
    return;
  }
  var transaction = db.transaction(objStore);
  var objectStore = transaction.objectStore(objStore);
  var counter = 0;
  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      counter++;
      cursor.continue();
    }
  };
  transaction.oncomplete = function (event) {
    console.log(counter);
  };
}
// read last item in objectStore
function readLast(objStore) {
  if (!allowed) {
    console.log("indexedDB::rejected read last");
    return;
  }
  var transaction = db.transaction(objStore);
  var objectStore = transaction.objectStore(objStore);
  var lastItem;
  objectStore.openCursor().onsuccess = function (event) {
    var cursor = event.target.result;
    if (cursor) {
      lastItem = cursor.value;
      cursor.continue();
    }
  };
  transaction.oncomplete = function (event) {
    if (lastItem) {
      console.log(lastItem.src);
    }
  };
}
// clear the database
function clearDb(objStore, callback) {
  var transaction = db.transaction([objStore], "readwrite");
  transaction.oncomplete = function (event) {
    console.log("indexedDB::Transaction completed");
  };
  transaction.onerror = function (event) {
    console.log(
      "indexedDB::Transaction not opened due to error: " + transaction.error
    );
  };
  var objectStore = transaction.objectStore(objStore);
  var objectStoreRequest = objectStore.clear();
  objectStoreRequest.onsuccess = function (event) {
    console.log("indexedDB::Request successful");
    callback();
  };
}
