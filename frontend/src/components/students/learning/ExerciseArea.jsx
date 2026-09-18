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

import {
  createRuntime,
} from "../../../runtimes/runtimeRegistry";

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
    runtimeName,
    setRuntimeName,
  ] = useState("");

  const [
    isRunning,
    setIsRunning,
  ] = useState(false);

  const [
    resultStatus,
    setResultStatus,
  ] = useState(null);

  const [
    hasExecutionError,
    setHasExecutionError,
  ] = useState(false);

  const [
    workerVersion,
    setWorkerVersion,
  ] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Resizable Panel
  |--------------------------------------------------------------------------
  */

  const [
    instructionWidth,
    setInstructionWidth,
  ] = useState(38);

  const [
    isResizing,
    setIsResizing,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const workerRef = useRef(null);

  const runtimeRef = useRef(null);

  const timeoutRef = useRef(null);

  const workspaceRef = useRef(null);

  const previewIframeRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Runtime Key
  |--------------------------------------------------------------------------
  |
  | Runtime is controlled by the exercise,
  | not by ExerciseArea.
  |
  | Examples:
  |
  | pyodide
  | javascript
  | dotnet-wasm
  | php-wasm
  | sqlite
  |
  */

  const runtimeKey =
    exercise?.settings?.runtime;

  const outputMode =
  exercise?.settings?.output_mode ||
  "text";

  const isPreviewMode =
    outputMode === "preview";

  /*
  |--------------------------------------------------------------------------
  | Normalise Output
  |--------------------------------------------------------------------------
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

  const clearExecutionTimeout = () => {
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

    setHasExecutionError(false);

    setIsRunning(false);
  }, [exercise?.id]);

  /*
  |--------------------------------------------------------------------------
  | Create Runtime
  |--------------------------------------------------------------------------
  |
  | ExerciseArea no longer knows whether
  | this is Python, JavaScript, PHP, C#,
  | SQL, etc.
  |
  | It asks the Runtime Registry for the
  | correct runtime.
  |
  */

  useEffect(() => {
    clearExecutionTimeout();

    /*
     * Clean up previous worker.
     */
    if (workerRef.current) {
      workerRef.current.terminate();

      workerRef.current = null;
    }

    runtimeRef.current = null;

    /*
     * Runtime must be configured.
     */
    if (!runtimeKey) {
      setRuntimeName("");

      setRuntimeStatus(
        "unsupported"
      );

      return undefined;
    }

    /*
     * Ask registry for runtime.
     */
    const runtime =
      createRuntime(runtimeKey);

    /*
     * Runtime is not registered.
     */
    if (!runtime) {
      console.warn(
        `Unsupported runtime: ${runtimeKey}`
      );

      setRuntimeName(
        runtimeKey
      );

      setRuntimeStatus(
        "unsupported"
      );

      return undefined;
    }

    runtimeRef.current = runtime;

    setRuntimeName(
      runtime.getName()
    );

    setRuntimeStatus(
      "loading"
    );

    setIsRunning(false);

    /*
     * Runtime adapter creates the
     * appropriate worker.
     */
    const worker =
      runtime.createWorker();

    workerRef.current = worker;

    /*
    |--------------------------------------------------------------------------
    | Worker Messages
    |--------------------------------------------------------------------------
    */

    worker.onmessage = (
      event
    ) => {
      const {
        type,
        output: workerOutput,
        error,
      } = event.data;

      /*
       * Runtime loaded successfully.
       */
      if (type === "ready") {
        setRuntimeStatus(
          "ready"
        );

        setHasExecutionError(false);

        return;
      }

      /*
       * Code execution completed.
       */
      if (type === "result") {
        clearExecutionTimeout();

        const finalOutput =
          workerOutput ?? "";

        setHasExecutionError(false);

        setOutput(finalOutput);

        setIsRunning(false);

        return;
      }

      /*
       * Runtime failed to initialise.
       */
      if (
        type === "runtime-error"
      ) {
        clearExecutionTimeout();

        console.error(
          `${runtime.getName()} runtime initialisation error:`,
          error
        );

        setHasExecutionError(true);

        setOutput(
          error ||
            "Unable to load runtime."
        );

        setResultStatus(null);

        setRuntimeStatus(
          "error"
        );

        setIsRunning(false);

        return;
      }

      /*
       * Student code produced an error.
       */
      if (
        type ===
        "execution-error"
      ) {
        clearExecutionTimeout();

        console.error(
          `${runtime.getName()} execution error:`,
          error
        );

        setHasExecutionError(true);

        setOutput(
          error ||
            "Code execution failed."
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
    | Worker Error
    |--------------------------------------------------------------------------
    */

    worker.onerror = (error) => {
      console.error(
        `${runtime.getName()} worker error:`,
        error
      );

      clearExecutionTimeout();

      const workerErrorDetails = [
        error?.message,
        error?.filename
          ? `File: ${error.filename}`
          : "",
        error?.lineno
          ? `Line: ${error.lineno}`
          : "",
        error?.colno
          ? `Column: ${error.colno}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      setHasExecutionError(true);

      setOutput(
        workerErrorDetails ||
          `${runtime.getName()} runtime encountered an error. Check the browser console for the underlying worker error.`
      );

      setResultStatus(null);

      setRuntimeStatus(
        "error"
      );

      setIsRunning(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Initialise Runtime
    |--------------------------------------------------------------------------
    */

    worker.postMessage({
      type: "init",
    });

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      clearExecutionTimeout();

      worker.terminate();

      if (
        workerRef.current ===
        worker
      ) {
        workerRef.current =
          null;
      }

      if (
        runtimeRef.current ===
        runtime
      ) {
        runtimeRef.current =
          null;
      }
    };
  }, [
    exercise?.id,
    runtimeKey,
    workerVersion,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Grade Exercise
  |--------------------------------------------------------------------------
  |
  | Grading is completely independent
  | of the programming language/runtime.
  |
  | Python, JavaScript, PHP, C#, etc.
  | all return text output and this
  | component compares it with the
  | expected output.
  |
  */

  useEffect(() => {
    if (
      output === "" ||
      hasExecutionError
    ) {
      setResultStatus(null);

      return;
    }

    const expectedOutput =
      exercise?.expected_output;

    if (
      expectedOutput === null ||
      expectedOutput === undefined ||
      String(
        expectedOutput
      ).trim() === ""
    ) {
      setResultStatus(null);

      return;
    }

    const actual =
      normalizeOutput(output);

    const expected =
      normalizeOutput(
        expectedOutput
      );

    

    if (actual === expected) {
      setResultStatus(
        "passed"
      );
    } else {
      setResultStatus(
        "failed"
      );
    }
  }, [
    output,
    exercise?.expected_output,
    runtimeKey,
    hasExecutionError,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Execute Runtime Request
  |--------------------------------------------------------------------------
  |
  | Used by both the Run Code button and PHP preview form submissions.
  |
  */

  const executeRuntimeRequest = (
    request = undefined
  ) => {
    if (
      runtimeStatus !== "ready" ||
      !workerRef.current ||
      !runtimeRef.current
    ) {
      return;
    }

    clearExecutionTimeout();

    setIsRunning(true);
    setHasExecutionError(false);
    setResultStatus(null);

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

    const activeWorker =
      workerRef.current;

    const runMessage =
      runtimeRef.current
        .createRunMessage(
          code,
          exercise
        );

    if (request) {
      runMessage.request =
        request;
    }

    activeWorker.postMessage(
      runMessage
    );

    timeoutRef.current =
      window.setTimeout(() => {
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
        setHasExecutionError(true);

        setOutput(
          `Execution timed out after ${
            timeout / 1000
          } seconds.`
        );

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
  | Preview Loaded
  |--------------------------------------------------------------------------
  |
  | Attach a submit handler inside the same-origin srcDoc iframe.
  | The form is prevented from navigating and is sent back to PHP-WASM.
  |
  */

  const handlePreviewLoad = () => {
    if (
      !isPreviewMode ||
      runtimeKey !== "php-wasm"
    ) {
      return;
    }

    const iframe =
      previewIframeRef.current;

    const document =
      iframe?.contentDocument;

    if (!document) {
      return;
    }

    const forms =
      Array.from(
        document.querySelectorAll(
          "form"
        )
      );

    forms.forEach((form) => {
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const formData =
            new FormData(form);

          const data = {};

          for (
            const [
              key,
              value,
            ] of formData.entries()
          ) {
            const stringValue =
              value instanceof File
                ? value.name
                : String(value);

            if (
              Object.prototype.hasOwnProperty.call(
                data,
                key
              )
            ) {
              if (
                Array.isArray(
                  data[key]
                )
              ) {
                data[key].push(
                  stringValue
                );
              } else {
                data[key] = [
                  data[key],
                  stringValue,
                ];
              }
            } else {
              data[key] =
                stringValue;
            }
          }

          const method =
            (
              form.getAttribute(
                "method"
              ) || "GET"
            ).toUpperCase();

          executeRuntimeRequest({
            method:
              method === "POST"
                ? "POST"
                : "GET",
            data,
          });
        },
        { once: true }
      );
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Run Code
  |--------------------------------------------------------------------------
  */

  

  const handleRun = () => {
    setHasExecutionError(false);

    /*
     * Runtime must exist.
     */
    if (!runtimeKey) {
      setOutput(
        "No runtime has been configured for this exercise."
      );

      setResultStatus(null);

      return;
    }

    /*
     * Runtime must be registered.
     */
    if (
      runtimeStatus ===
      "unsupported"
    ) {
      setOutput(
        `Runtime "${runtimeKey}" is not supported yet.`
      );

      setResultStatus(null);

      return;
    }

    /*
     * Runtime must be ready.
     */
    if (
      runtimeStatus !== "ready" ||
      !workerRef.current
    ) {
      setOutput(
        `${runtimeName || "Runtime"} is still loading. Please wait...`
      );

      setResultStatus(null);

      return;
    }

    /*
     * Prevent empty execution.
     */
    if (!code.trim()) {
      setOutput(
        "Please write some code first."
      );

      setResultStatus(null);

      return;
    }

    setOutput("");

    executeRuntimeRequest();
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

    setHasExecutionError(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Resize Instructions Panel
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    const handleMouseMove = (
      event
    ) => {
      if (!workspaceRef.current) {
        return;
      }

      const rect =
        workspaceRef.current
          .getBoundingClientRect();

      const position =
        event.clientX -
        rect.left;

      const percentage =
        (position / rect.width) *
        100;

      const width = Math.min(
        65,
        Math.max(
          25,
          percentage
        )
      );

      setInstructionWidth(width);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );

    document.body.style.cursor =
      "col-resize";

    document.body.style.userSelect =
      "none";

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );

      document.body.style.cursor =
        "";

      document.body.style.userSelect =
        "";
    };
  }, [isResizing]);

  /*
  |--------------------------------------------------------------------------
  | Missing Exercise
  |--------------------------------------------------------------------------
  */

  if (!exercise) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-[#0B1F3A]">
            Exercise not available
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            This exercise could not be
            found.
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white">
      <div
        ref={workspaceRef}
        className="flex h-full min-h-0 w-full flex-col overflow-hidden lg:flex-row"
      >
        {/*
        |--------------------------------------------------------------------------
        | LEFT - Instructions
        |--------------------------------------------------------------------------
        */}

        <section
          className="flex min-h-0 min-w-0 flex-col border-b border-slate-200 bg-white lg:border-b-0"
          style={{
            flexBasis:
              `${instructionWidth}%`,
            flexGrow: 0,
            flexShrink: 0,
          }}
        >
          {/*
          |--------------------------------------------------------------------------
          | Instructions Header
          |--------------------------------------------------------------------------
          */}

          <div className="shrink-0 border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-blue-700">
                <Code2 size={13} />

                {exercise.language ||
                  "Code"}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {exercise.exercise_type ||
                  "code"}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-bold leading-6 text-[#0B1F3A]">
              {exercise.title}
            </h2>
          </div>

          {/*
          |--------------------------------------------------------------------------
          | Instructions Body
          |--------------------------------------------------------------------------
          */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Instructions
              </p>

              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {exercise.instructions ||
                  "Complete the coding exercise."}
              </div>

              {/*
              |--------------------------------------------------------------------------
              | Expected Output
              |--------------------------------------------------------------------------
              */}

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

              {/*
              |--------------------------------------------------------------------------
              | Runtime Information
              |--------------------------------------------------------------------------
              */}

              <div className="mt-8 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Runtime
                </p>

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">
                      Engine
                    </span>

                    <span className="text-sm font-semibold text-slate-700">
                      {runtimeName ||
                        runtimeKey ||
                        "Not specified"}
                    </span>
                  </div>

                  {exercise.settings
                    ?.timeout && (
                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
                      <span className="text-sm text-slate-500">
                        Timeout
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {Number(
                          exercise.settings
                            .timeout
                        ) / 1000}{" "}
                        seconds
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-6" />
            </div>
          </div>
        </section>

        {/*
        |--------------------------------------------------------------------------
        | RESIZE DIVIDER
        |--------------------------------------------------------------------------
        */}

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize instructions and code editor"
          onMouseDown={(event) => {
            event.preventDefault();

            setIsResizing(true);
          }}
          className={`group relative hidden w-2 shrink-0 cursor-col-resize lg:block ${
            isResizing
              ? "bg-blue-100"
              : "bg-slate-100 hover:bg-blue-50"
          }`}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 z-10" />

          <div
            className={`absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 transition ${
              isResizing
                ? "bg-blue-500"
                : "bg-slate-300 group-hover:bg-blue-400"
            }`}
          />

          <div
            className={`absolute left-1/2 top-1/2 h-14 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition ${
              isResizing
                ? "bg-blue-600"
                : "bg-slate-400 group-hover:bg-blue-500"
            }`}
          />
        </div>

        {/*
        |--------------------------------------------------------------------------
        | RIGHT - Coding Workspace
        |--------------------------------------------------------------------------
        */}

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#0F172A]">
          {/*
          |--------------------------------------------------------------------------
          | Editor Header
          |--------------------------------------------------------------------------
          */}

          <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-700 bg-[#111827] px-4">
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
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw
                size={14}
              />

              Reset
            </button>
          </div>

          {/*
          |--------------------------------------------------------------------------
          | Code Editor
          |--------------------------------------------------------------------------
          */}

          <div className="relative min-h-[160px] flex-1">
            <textarea
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                )
              }
              disabled={isRunning}
              spellCheck="false"
              className="absolute inset-0 h-full w-full resize-none overflow-auto bg-[#0F172A] p-5 font-mono text-sm leading-7 text-slate-100 outline-none disabled:opacity-70"
              placeholder="Write your code here..."
            />
          </div>

          {/*
          |--------------------------------------------------------------------------
          | Run Toolbar
          |--------------------------------------------------------------------------
          */}

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-700 bg-[#111827] px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
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

                  Loading{" "}
                  {runtimeName ||
                    "Runtime"}
                  ...
                </span>
              )}

              {runtimeStatus ===
                "ready" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  {runtimeName ||
                    "Runtime"}{" "}
                  Ready
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
                  Runtime not
                  supported
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRun}
              disabled={
                isRunning ||
                runtimeStatus !==
                  "ready"
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#F4C95D] px-5 py-2 text-sm font-bold text-[#0B1F3A] transition hover:bg-[#e8bc4f] disabled:cursor-not-allowed disabled:opacity-50"
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

          {/*
          |--------------------------------------------------------------------------
          | FEEDBACK
          |--------------------------------------------------------------------------
          */}

          {resultStatus ===
            "passed" && (
              <div className="shrink-0 border-y border-emerald-700/60 bg-emerald-950 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900">
                    <CheckCircle2
                      size={21}
                      className="text-emerald-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-emerald-300">
                      Correct!
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-emerald-200/80">
                      Your output
                      matches the
                      expected result.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {resultStatus ===
            "failed" && (
              <div className="shrink-0 border-y border-amber-700/60 bg-amber-950 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-900">
                    <XCircle
                      size={21}
                      className="text-amber-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-amber-300">
                      Not quite. Try
                      again.
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-amber-200/80">
                      Compare your
                      output with the
                      expected result
                      and update your
                      code.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/*
          |--------------------------------------------------------------------------
          | OUTPUT / PREVIEW
          |--------------------------------------------------------------------------
          */}

          <div className="flex h-[220px] shrink-0 flex-col border-t border-slate-700 bg-[#0B1220]">
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-slate-700 px-4 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Terminal
                size={14}
              />

              {isPreviewMode
                ? "Preview"
                : "Output"}
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              {isPreviewMode ? (
                output ? (
                  <iframe
                    ref={previewIframeRef}
                    title="PHP Preview"
                    srcDoc={output}
                    sandbox="allow-forms allow-same-origin"
                    onLoad={handlePreviewLoad}
                    className="h-full w-full border-0 bg-white"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white px-4 text-sm text-slate-400">
                    Run your code to see the preview.
                  </div>
                )
              ) : (
                <pre className="min-h-full whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-slate-300">
                  {output ||
                    "Run your code to see the output here."}
                </pre>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}