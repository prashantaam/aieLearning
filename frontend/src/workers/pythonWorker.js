/*
|--------------------------------------------------------------------------
| Python Web Worker
|--------------------------------------------------------------------------
|
| Runs Pyodide outside React's main browser thread.
|
*/

let pyodide = null;

const PYODIDE_BASE_URL =
  "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/";

/*
|--------------------------------------------------------------------------
| Load Pyodide
|--------------------------------------------------------------------------
*/

const initialisePyodide = async () => {
  if (pyodide) {
    return pyodide;
  }

  importScripts(
    `${PYODIDE_BASE_URL}pyodide.js`
  );

  pyodide = await loadPyodide({
    indexURL: PYODIDE_BASE_URL,
  });

  return pyodide;
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
  } = event.data;

  /*
   * Initialise runtime
   */
  if (type === "init") {
    try {
      await initialisePyodide();

      self.postMessage({
        type: "ready",
      });
    } catch (error) {
      self.postMessage({
        type: "runtime-error",
        error:
          error?.message ||
          "Unable to load Python runtime.",
      });
    }

    return;
  }

  /*
   * Run Python
   */
  if (type === "run") {
    try {
      const runtime =
        await initialisePyodide();

      /*
       * Create stdout/stderr buffers.
       */
      await runtime.runPythonAsync(`
import sys
import io

_worker_stdout = io.StringIO()
_worker_stderr = io.StringIO()

sys.stdout = _worker_stdout
sys.stderr = _worker_stderr
      `);

      /*
       * Execute student code.
       */
      try {
        await runtime.runPythonAsync(
          code
        );
      } catch (pythonError) {
        await runtime.runPythonAsync(`
import traceback
traceback.print_exc()
        `);
      }

      /*
       * Retrieve output.
       */
      const stdout =
        runtime.runPython(
          "_worker_stdout.getvalue()"
        );

      const stderr =
        runtime.runPython(
          "_worker_stderr.getvalue()"
        );

      const output = [
        stdout,
        stderr,
      ]
        .filter(Boolean)
        .join("");

      /*
       * Restore streams.
       */
      await runtime.runPythonAsync(`
import sys

sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
      `);

      self.postMessage({
        type: "result",
        output:
          output ||
          "Program finished with no output.",
      });
    } catch (error) {
      self.postMessage({
        type: "execution-error",
        error:
          error?.message ||
          "Unable to execute Python code.",
      });
    }
  }
};