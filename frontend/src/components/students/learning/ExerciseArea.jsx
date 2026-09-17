import {
  CheckCircle2,
  Code2,
  LoaderCircle,
  Play,
  RotateCcw,
  Terminal,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function ExerciseArea({
  exercise,
}) {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [code, setCode] = useState(
    exercise?.starter_code || ""
  );

  const [output, setOutput] =
    useState("");

  const [
    runtimeStatus,
    setRuntimeStatus,
  ] = useState("loading");

  const [
    isRunning,
    setIsRunning,
  ] = useState(false);

  const [
    resultStatus,
    setResultStatus,
  ] = useState(null);

  const [
    workerVersion,
    setWorkerVersion,
  ] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const workerRef = useRef(null);

  const timeoutRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Normalise Output
  |--------------------------------------------------------------------------
  |
  | Python print() normally adds a newline.
  |
  | Actual:
  | "10\n"
  |
  | Expected:
  | "10"
  |
  | These should be considered equal.
  |
  */

  const normalizeOutput = (value) =>
    String(value ?? "")
      .replace(/\r\n/g, "\n")
      .trim();

  /*
  |--------------------------------------------------------------------------
  | Clear Execution Timeout
  |--------------------------------------------------------------------------
  */

  const clearExecutionTimeout =
    () => {
      if (timeoutRef.current) {
        window.clearTimeout(
          timeoutRef.current
        );

        timeoutRef.current = null;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Reset When Exercise Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCode(
      exercise?.starter_code || ""
    );

    setOutput("");

    setResultStatus(null);

    setIsRunning(false);
  }, [exercise?.id]);

  /*
  |--------------------------------------------------------------------------
  | Create Python Worker
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    clearExecutionTimeout();

    /*
     * At the moment this runtime
     * supports Python only.
     */
    if (
      exercise?.language !== "python"
    ) {
      setRuntimeStatus(
        "unsupported"
      );

      workerRef.current = null;

      return undefined;
    }

    setRuntimeStatus("loading");

    setIsRunning(false);

    /*
     * Create the Web Worker.
     *
     * Vite resolves this URL during
     * development/build.
     */
    const pythonWorker =
      new Worker(
        new URL(
          "../../../workers/pythonWorker.js",
          import.meta.url
        )
      );

    workerRef.current =
      pythonWorker;

    /*
    |--------------------------------------------------------------------------
    | Worker Messages
    |--------------------------------------------------------------------------
    */

    pythonWorker.onmessage = (
      event
    ) => {
      const {
        type,
        output: workerOutput,
        error,
      } = event.data;

      /*
       * Pyodide has loaded.
       */
      if (type === "ready") {
        setRuntimeStatus(
          "ready"
        );

        return;
      }

      /*
       * Python execution completed.
       */
      if (type === "result") {
        clearExecutionTimeout();

        const finalOutput =
          workerOutput ||
          "Program finished with no output.";

        setOutput(finalOutput);

        /*
        |--------------------------------------------------------------------------
        | Check Expected Output
        |--------------------------------------------------------------------------
        */

        const actual =
          normalizeOutput(
            workerOutput
          );

        const expected =
          normalizeOutput(
            exercise
              ?.expected_output
          );

        /*
         * Only automatically grade
         * when expected_output exists.
         */
        if (
          exercise
            ?.expected_output !==
            null &&
          exercise
            ?.expected_output !==
            undefined &&
          expected !== ""
        ) {
          if (
            actual === expected
          ) {
            setResultStatus(
              "passed"
            );
          } else {
            setResultStatus(
              "failed"
            );
          }
        } else {
          setResultStatus(null);
        }

        setIsRunning(false);

        return;
      }

      /*
       * Pyodide failed to load.
       */
      if (
        type === "runtime-error"
      ) {
        clearExecutionTimeout();

        setOutput(
          error ||
            "Unable to load Python runtime."
        );

        setResultStatus(null);

        setRuntimeStatus(
          "error"
        );

        setIsRunning(false);

        return;
      }

      /*
       * Python execution failed.
       */
      if (
        type ===
        "execution-error"
      ) {
        clearExecutionTimeout();

        setOutput(
          error ||
            "Python execution failed."
        );

        setResultStatus(null);

        setRuntimeStatus(
          "ready"
        );

        setIsRunning(false);
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Worker JavaScript Error
    |--------------------------------------------------------------------------
    */

    pythonWorker.onerror = (
      error
    ) => {
      console.error(
        "Python worker error:",
        error
      );

      clearExecutionTimeout();

      setOutput(
        "Python worker encountered an error."
      );

      setResultStatus(null);

      setRuntimeStatus(
        "error"
      );

      setIsRunning(false);
    };

    /*
     * Tell the worker to initialise
     * Pyodide.
     */
    pythonWorker.postMessage({
      type: "init",
    });

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      clearExecutionTimeout();

      pythonWorker.terminate();

      if (
        workerRef.current ===
        pythonWorker
      ) {
        workerRef.current =
          null;
      }
    };
  }, [
    exercise?.id,
    exercise?.language,
    workerVersion,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Run Code
  |--------------------------------------------------------------------------
  */

  const handleRun = () => {
    /*
     * Python only for now.
     */
    if (
      exercise?.language !== "python"
    ) {
      setOutput(
        `Runtime for "${
          exercise?.language ||
          "unknown"
        }" is not supported yet.`
      );

      setResultStatus(null);

      return;
    }

    /*
     * Worker/Pyodide must be ready.
     */
    if (
      runtimeStatus !== "ready" ||
      !workerRef.current
    ) {
      setOutput(
        "Python runtime is still loading. Please wait..."
      );

      setResultStatus(null);

      return;
    }

    /*
     * Do not execute empty code.
     */
    if (!code.trim()) {
      setOutput(
        "Please write some Python code first."
      );

      setResultStatus(null);

      return;
    }

    /*
     * Remove any previous timer.
     */
    clearExecutionTimeout();

    /*
     * Clear the previous result before
     * starting another execution.
     */
    setIsRunning(true);

    setOutput("");

    setResultStatus(null);

    /*
    |--------------------------------------------------------------------------
    | Determine Timeout
    |--------------------------------------------------------------------------
    |
    | Example exercise settings:
    |
    | {
    |   "runtime": "pyodide",
    |   "timeout": 5000
    | }
    |
    */

    const configuredTimeout =
      Number(
        exercise.settings?.timeout
      );

    const timeout =
      Number.isFinite(
        configuredTimeout
      ) &&
      configuredTimeout > 0
        ? configuredTimeout
        : 5000;

    /*
     * Keep the exact worker that is
     * executing this run.
     */
    const activeWorker =
      workerRef.current;

    /*
    |--------------------------------------------------------------------------
    | Execute Python
    |--------------------------------------------------------------------------
    */

    activeWorker.postMessage({
      type: "run",
      code,
    });

    /*
    |--------------------------------------------------------------------------
    | Execution Timeout
    |--------------------------------------------------------------------------
    |
    | If the Python code runs for too
    | long, terminate the entire worker.
    |
    | This prevents code such as:
    |
    | while True:
    |     pass
    |
    | from freezing the application.
    |
    */

    timeoutRef.current =
      window.setTimeout(() => {
        /*
         * Kill the worker containing
         * the stuck Python execution.
         */
        activeWorker.terminate();

        if (
          workerRef.current ===
          activeWorker
        ) {
          workerRef.current =
            null;
        }

        timeoutRef.current =
          null;

        setIsRunning(false);

        setResultStatus(null);

        setOutput(
          `Execution timed out after ${
            timeout / 1000
          } seconds.`
        );

        /*
         * The terminated worker cannot
         * be reused.
         *
         * Set loading status and create
         * a completely fresh worker.
         */
        setRuntimeStatus(
          "loading"
        );

        setWorkerVersion(
          (previous) =>
            previous + 1
        );
      }, timeout);
  };

  /*
  |--------------------------------------------------------------------------
  | Reset Code
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    setCode(
      exercise?.starter_code || ""
    );

    setOutput("");

    setResultStatus(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Missing Exercise
  |--------------------------------------------------------------------------
  */

  if (!exercise) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-bold text-[#0B1F3A]">
          Exercise not available
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          This exercise could not be
          found.
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div>
      {/* Exercise Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            <Code2 size={14} />

            {exercise.language ||
              "Code"}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            {exercise.exercise_type ||
              "code"}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-[#0B1F3A]">
          {exercise.title}
        </h2>
      </div>

      {/* Workspace */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-h-[560px] lg:grid-cols-[40%_60%]">
          {/* LEFT SIDE */}
          <section className="border-b border-slate-200 bg-white p-6 lg:border-b-0 lg:border-r">
            {/* Instructions */}
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Instructions
            </p>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {exercise.instructions ||
                "Complete the coding exercise."}
            </div>

            {/* Expected Output */}
            {exercise.expected_output && (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Expected Output
                </p>

                <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700">
                  {
                    exercise.expected_output
                  }
                </pre>
              </div>
            )}

            {/* Runtime */}
            <div className="mt-8 border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400">
                Runtime
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-600">
                {exercise.settings
                  ?.runtime ||
                  "Not specified"}
              </p>

              {exercise.settings
                ?.timeout && (
                <p className="mt-1 text-xs text-slate-400">
                  Timeout:{" "}
                  {Number(
                    exercise.settings
                      .timeout
                  ) / 1000}{" "}
                  seconds
                </p>
              )}
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="flex min-w-0 flex-col bg-[#0F172A]">
            {/* Editor Header */}
            <div className="flex min-h-14 items-center justify-between border-b border-slate-700 px-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Code2
                  size={16}
                  className="text-[#F4C95D]"
                />

                Code Editor
              </div>

              <button
                type="button"
                onClick={handleReset}
                disabled={isRunning}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw
                  size={14}
                />

                Reset
              </button>
            </div>

            {/* Editor */}
            <textarea
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                )
              }
              disabled={isRunning}
              spellCheck="false"
              className="min-h-[300px] flex-1 resize-none bg-[#0F172A] p-5 font-mono text-sm leading-7 text-slate-100 outline-none disabled:opacity-70"
              placeholder="Write your code here..."
            />

            {/* Run Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 bg-[#111827] px-4 py-3">
              {/* Runtime Status */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-400">
                  {exercise.language ||
                    "code"}
                </span>

                {runtimeStatus ===
                  "loading" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <LoaderCircle
                      size={13}
                      className="animate-spin"
                    />

                    Loading Python...
                  </span>
                )}

                {runtimeStatus ===
                  "ready" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    Python Ready
                  </span>
                )}

                {runtimeStatus ===
                  "error" && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-400" />

                    Runtime Error
                  </span>
                )}

                {runtimeStatus ===
                  "unsupported" && (
                  <span className="text-xs font-semibold text-amber-400">
                    Runtime not supported
                  </span>
                )}
              </div>

              {/* Run Button */}
              <button
                type="button"
                onClick={handleRun}
                disabled={
                  isRunning ||
                  runtimeStatus !==
                    "ready"
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#F4C95D] px-5 py-2.5 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e8bc4f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRunning ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Play
                    size={16}
                    fill="currentColor"
                  />
                )}

                {isRunning
                  ? "Running..."
                  : runtimeStatus ===
                      "loading"
                    ? "Loading..."
                    : "Run Code"}
              </button>
            </div>

            {/* Output */}
            <div className="border-t border-slate-700 bg-black/20">
              {/* Output Header */}
              <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                <Terminal
                  size={14}
                />

                Output
              </div>

              {/* Output Content */}
              <pre className="min-h-[130px] max-h-[260px] overflow-auto whitespace-pre-wrap p-4 font-mono text-sm leading-6 text-slate-300">
                {output ||
                  "Run your code to see the output here."}
              </pre>

              {/* Passed */}
              {resultStatus ===
                "passed" && (
                <div className="border-t border-emerald-800/50 bg-emerald-950/40 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <div>
                      <p className="text-sm font-bold text-emerald-300">
                        Correct!
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-200/70">
                        Your output
                        matches the
                        expected result.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed */}
              {resultStatus ===
                "failed" && (
                <div className="border-t border-amber-800/50 bg-amber-950/30 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <XCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-400"
                    />

                    <div>
                      <p className="text-sm font-bold text-amber-300">
                        Not quite. Try
                        again.
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-200/70">
                        Compare your
                        output with the
                        expected output
                        and update your
                        code.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}