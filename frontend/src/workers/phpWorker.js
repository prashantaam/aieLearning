import { PHP } from "@php-wasm/universal";
import { loadWebRuntime } from "@php-wasm/web";

let php = null;

/*
|--------------------------------------------------------------------------
| Initialise PHP
|--------------------------------------------------------------------------
*/

const initialisePHP = async () => {
  if (php) {
    return php;
  }

  console.log("Loading PHP WASM...");

  const runtime =
    await loadWebRuntime("8.5");

  php = new PHP(runtime);

  console.log(
    "PHP WASM loaded successfully."
  );

  return php;
};

/*
|--------------------------------------------------------------------------
| Build PHP Request
|--------------------------------------------------------------------------
*/

const buildRunOptions = (
  request = {}
) => {
  const method = (
    request.method || "GET"
  ).toUpperCase();

  const data =
    request.data || {};

  const params =
    new URLSearchParams();

  Object.entries(data).forEach(
    ([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          params.append(
            key,
            String(item)
          );
        });

        return;
      }

      params.append(
        key,
        String(value ?? "")
      );
    }
  );

  /*
   * GET request
   */
  if (method === "GET") {
    const queryString =
      params.toString();

    return {
      scriptPath: "/exercise.php",
      method: "GET",

      relativeUri: queryString
        ? `/exercise.php?${queryString}`
        : "/exercise.php",

      $_SERVER: {
        REQUEST_METHOD: "GET",

        QUERY_STRING:
          queryString,

        REQUEST_URI: queryString
          ? `/exercise.php?${queryString}`
          : "/exercise.php",
      },
    };
  }

  /*
   * POST request
   */
  const body =
    params.toString();

  return {
    scriptPath: "/exercise.php",

    method: "POST",

    relativeUri:
      "/exercise.php",

    body,

    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
    },

    $_SERVER: {
      REQUEST_METHOD: "POST",

      REQUEST_URI:
        "/exercise.php",

      CONTENT_TYPE:
        "application/x-www-form-urlencoded",

      CONTENT_LENGTH:
        String(
          new TextEncoder()
            .encode(body)
            .length
        ),
    },
  };
};

/*
|--------------------------------------------------------------------------
| Run Database Query
|--------------------------------------------------------------------------
|
| This is used by the automatic testing system.
|
| Important:
| The database query does NOT come from the student's PHP code.
| It is supplied by the exercise/test configuration.
|
| The internal PHP script connects to the same SQLite database used
| by the exercise and returns the query result as JSON.
|
*/

const runDatabaseQuery = async (
  query,
  databasePath = "/tmp/todo.db"
) => {
  const runtime =
    await initialisePHP();

  /*
   * JSON encoding gives us a safe way to
   * place the strings inside generated PHP.
   */
  const encodedDatabasePath =
    JSON.stringify(
      databasePath
    );

  const encodedQuery =
    JSON.stringify(
      query
    );

  const testScript = `<?php

try {
    $databasePath = ${encodedDatabasePath};
    $query = ${encodedQuery};

    $pdo = new PDO(
        "sqlite:" . $databasePath
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $statement =
        $pdo->query($query);

    $rows =
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        );

    echo json_encode([
        "success" => true,
        "rows" => $rows
    ]);
} catch (Throwable $error) {
    echo json_encode([
        "success" => false,
        "error" => $error->getMessage()
    ]);
}
`;

  runtime.writeFile(
    "/database-test.php",
    testScript
  );

  const response =
    await runtime.run({
      scriptPath:
        "/database-test.php",

      method: "GET",

      relativeUri:
        "/database-test.php",

      $_SERVER: {
        REQUEST_METHOD: "GET",

        REQUEST_URI:
          "/database-test.php",
      },
    });

  const rawOutput =
    response.text ?? "";

  let result;

  try {
    result =
      JSON.parse(rawOutput);
  } catch {
    throw new Error(
      `Unable to parse database test result: ${rawOutput}`
    );
  }

  if (!result.success) {
    throw new Error(
      result.error ||
        "Database query failed."
    );
  }

  return result.rows || [];
};

/*
|--------------------------------------------------------------------------
| Worker Messages
|--------------------------------------------------------------------------
*/

self.onmessage = async (
  event
) => {
  const {
    type,
    code,
    request,
    query,
    databasePath,
    testId,
  } = event.data;

  /*
  |--------------------------------------------------------------------------
  | Initialise
  |--------------------------------------------------------------------------
  */

  if (type === "init") {
    try {
      await initialisePHP();

      self.postMessage({
        type: "ready",
      });
    } catch (error) {
      console.error(
        "PHP INITIALISATION ERROR:",
        error
      );

      self.postMessage({
        type:
          "runtime-error",

        error:
          error?.stack ||
          error?.message ||
          String(error),
      });
    }

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Run PHP
  |--------------------------------------------------------------------------
  */

  if (type === "run") {
    try {
      const runtime =
        await initialisePHP();

      /*
       * Write student's PHP into the
       * PHP-WASM virtual filesystem.
       */
      runtime.writeFile(
        "/exercise.php",
        code
      );

      /*
       * Build request.
       *
       * Existing exercises that do not
       * provide a request default to GET.
       */
      const runOptions =
        buildRunOptions(
          request
        );

      /*
       * Execute student's PHP.
       */
      const response =
        await runtime.run(
          runOptions
        );

      const output =
        response.text ?? "";

      self.postMessage({
        type: "result",
        output,
      });
    } catch (error) {
      console.error(
        "PHP EXECUTION ERROR:",
        error
      );

      self.postMessage({
        type:
          "execution-error",

        error:
          error?.stack ||
          error?.message ||
          String(error),
      });
    }

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Database Test
  |--------------------------------------------------------------------------
  |
  | Runs a teacher-configured SELECT query against the exercise database.
  |
  */

  if (
    type === "database-test"
  ) {
    try {
      if (
        !query ||
        typeof query !== "string"
      ) {
        throw new Error(
          "Database test query is required."
        );
      }

      /*
       * For now database tests are
       * deliberately read-only.
       */
      const trimmedQuery =
        query.trim();

      if (
        !/^select\b/i.test(
          trimmedQuery
        )
      ) {
        throw new Error(
          "Database tests currently support SELECT queries only."
        );
      }

      const rows =
        await runDatabaseQuery(
          trimmedQuery,
          databasePath ||
            "/tmp/todo.db"
        );

      self.postMessage({
        type:
          "database-test-result",

        testId,

        rows,
      });
    } catch (error) {
      console.error(
        "DATABASE TEST ERROR:",
        error
      );

      self.postMessage({
        type:
          "database-test-error",

        testId,

        error:
          error?.stack ||
          error?.message ||
          String(error),
      });
    }
  }
};