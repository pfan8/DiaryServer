class DBHelper {
  constructor(url, dbName) {
    const MongoClient = require("mongodb").MongoClient;
    this.client = new MongoClient(url);
    this.client.connect((err) => {
      if (err) {
        console.error(`[mongo] connect ${url}/${dbName} failed`, err);
        this.client.close();
        return;
      }
      console.log("Connected successfully to server");
      this.db = this.client.db(dbName);
    });
  }

  find(collName, query, callback = () => {}) {
    if (!this.db) {
      throw new Error("db not connected!");
    }
    // Get the documents collection
    const collection = this.db.collection(collName);
    collection.find(query).toArray(function (err, docs) {
      if (err) {
        console.error(err);
      }
      console.log(`find docs in collection ${collName}`, docs);
      callback(docs);
    });
  }

  insert(collName, document, callback) {
    if (!this.db) {
      throw new Error("db not connected!");
    }
    // Get the documents collection
    const collection = this.db.collection(collName);
    collection.insert(document, function (err, result) {
      if (err) {
        console.error(err);
        callback(false);
        return;
      }
      console.log(
        `Inserted one document into the collection ${collName}:`,
        result
      );
      callback(result);
    });
  }

  insertMany(collName, documents, callback) {
    if (!this.db) {
      throw new Error("db not connected!");
    }
    if (!Array.isArray(documents)) {
      throw new TypeError("documents must be array of json");
    }
    // Get the documents collection
    const collection = this.db.collection(collName);
    // Insert some documents
    collection.insertMany(documents, function (err, result) {
      if (err) {
        console.error(err);
        callback(false);
        return;
      }
      console.log(
        `Inserted ${documents.length} documents into the collection ${collName}:`,
        result
      );
      callback(result);
    });
  }

  update(collName, query, updateVals, callback) {
    if (!this.db) {
      throw new Error("db not connected!");
    }
    // Get the documents collection
    const collection = this.db.collection(collName);
    // Update one document
    collection.updateOne(query, { $set: updateVals }, function (err, result) {
      if (err) {
        console.error(err);
        callback(false);
        return;
      }
      console.log(
        `Updated specific document in the collection ${collName}:`,
        result
      );
      callback(result);
    });
  }

  close() {
    this.client.close();
  }
}

module.exports = DBHelper;
