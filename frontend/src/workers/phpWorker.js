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

  const runtime = await loadWebRuntime("8.5");

  php = new PHP(runtime);

  console.log("PHP WASM loaded successfully.");

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
        QUERY_STRING: queryString,
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

    relativeUri: "/exercise.php",

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
          new TextEncoder().encode(body)
            .length
        ),
    },
  };
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
    request,
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
        type: "runtime-error",

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
       * Existing Stage 1 / Stage 2
       * exercises don't send request,
       * therefore they default to GET.
       */
      const runOptions =
        buildRunOptions(request);

      /*
       * Execute PHP.
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
        type: "execution-error",

        error:
          error?.stack ||
          error?.message ||
          String(error),
      });
    }
  }
};