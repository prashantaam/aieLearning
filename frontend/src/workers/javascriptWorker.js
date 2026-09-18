/*
|--------------------------------------------------------------------------
| JavaScript Exercise Worker
|--------------------------------------------------------------------------
|
| Executes student JavaScript away from the React UI thread.
|
| Supported initially:
| - console.log()
| - console.error()
| - console.warn()
| - normal JavaScript calculations
| - loops/functions/arrays/objects
|
*/

self.onmessage = async (event) => {
  const { type, code } = event.data;

  if (type === "init") {
    self.postMessage({
      type: "ready",
    });

    return;
  }

  if (type !== "run") {
    return;
  }

  const output = [];

  /*
  |--------------------------------------------------------------------------
  | Capture console output
  |--------------------------------------------------------------------------
  */

  const formatValue = (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (value === undefined) {
      return "undefined";
    }

    if (value === null) {
      return "null";
    }

    if (typeof value === "object") {
      try {
        return JSON.stringify(
          value,
          null,
          2
        );
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  const captureConsole = (
    ...values
  ) => {
    output.push(
      values
        .map(formatValue)
        .join(" ")
    );
  };

  /*
   * Replace console methods inside
   * this worker.
   */
  console.log = captureConsole;
  console.warn = captureConsole;
  console.error = captureConsole;

  try {
    /*
    |--------------------------------------------------------------------------
    | Execute Student JavaScript
    |--------------------------------------------------------------------------
    */

    const executeCode =
      new Function(code);

    const result =
      await executeCode();

    /*
     * If the student doesn't use
     * console.log(), but explicitly
     * returns something, display it.
     */
    if (
      result !== undefined &&
      output.length === 0
    ) {
      output.push(
        formatValue(result)
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Send Result
    |--------------------------------------------------------------------------
    */

    self.postMessage({
      type: "result",
      output: output.join("\n"),
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Send Execution Error
    |--------------------------------------------------------------------------
    */

    self.postMessage({
      type: "execution-error",
      error:
        error?.stack ||
        error?.message ||
        String(error),
    });
  }
};