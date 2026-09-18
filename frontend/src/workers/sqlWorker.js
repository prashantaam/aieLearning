import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

let sqlite3 = null;
let db = null;

const initialiseSQLite = async () => {
  if (sqlite3 && db) {
    return;
  }

  sqlite3 = await sqlite3InitModule({
  print: console.log,
  printErr: console.error,

  locateFile: (file) => {
    if (file.endsWith("sqlite3.wasm")) {
      return "/sqlite/sqlite3.wasm";
    }

    return file;
  },
});
  db = new sqlite3.oo1.DB(
    ":memory:"
  );
};
/*
|--------------------------------------------------------------------------
| Format Query Result
|--------------------------------------------------------------------------
|
| Converts SQLite rows into simple text so our existing ExerciseArea
| grading system can compare it with expected_output.
|
| Example:
|
| score
| 10
|
*/

const formatResult = (
  columnNames,
  rows
) => {
  if (
    !columnNames ||
    columnNames.length === 0
  ) {
    return "Query executed successfully.";
  }

  const output = [];

  output.push(
    columnNames.join(" | ")
  );

  for (const row of rows) {
    output.push(
      row
        .map((value) => {
          if (value === null) {
            return "NULL";
          }

          return String(value);
        })
        .join(" | ")
    );
  }

  return output.join("\n");
};

/*
|--------------------------------------------------------------------------
| Execute SQL
|--------------------------------------------------------------------------
*/

const executeSQL = (sql) => {
  const columnNames = [];
  const rows = [];

  db.exec({
    sql,

    columnNames,

    rowMode: "array",

    callback: (row) => {
      rows.push(row);
    },
  });

  return formatResult(
    columnNames,
    rows
  );
};

/*
|--------------------------------------------------------------------------
| Worker Messages
|--------------------------------------------------------------------------
*/

self.onmessage = async (event) => {
  const {
    type,
    code,
    setupSql,
  } = event.data;

  /*
  |--------------------------------------------------------------------------
  | Initialise Runtime
  |--------------------------------------------------------------------------
  */

  if (type === "init") {
    try {
      await initialiseSQLite();

      self.postMessage({
        type: "ready",
      });
    } catch (error) {
      self.postMessage({
        type: "runtime-error",

        error:
          error?.message ||
          String(error),
      });
    }

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Execute Student SQL
  |--------------------------------------------------------------------------
  */

  if (type === "run") {
    try {
      await initialiseSQLite();

      /*
       * Start with a clean database
       * for every Run.
       */
      if (db) {
        db.close();
      }

      db =
        new sqlite3.oo1.DB(
          ":memory:"
        );

      /*
       * Create exercise tables/data.
       *
       * Students do not need to see
       * this SQL in their editor.
       */
      if (
        setupSql &&
        setupSql.trim()
      ) {
        db.exec(setupSql);
      }

      /*
       * Run student query.
       */
      const output =
        executeSQL(code);

      self.postMessage({
        type: "result",
        output,
      });
    } catch (error) {
      self.postMessage({
        type:
          "execution-error",

        error:
          error?.message ||
          String(error),
      });
    }
  }
};