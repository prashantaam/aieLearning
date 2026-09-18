import PythonRuntime from "./PythonRuntime";
import JavaScriptRuntime from "./JavaScriptRuntime";
import SqlRuntime from "./SqlRuntime";
import LinuxRuntime from "./LinuxRuntime";
import PHPRuntime from "./PHPRuntime";

/*
|--------------------------------------------------------------------------
| Runtime Registry
|--------------------------------------------------------------------------
|
| Every supported runtime is registered here.
|
| Adding a new runtime should normally
| require only:
|
| 1. Runtime adapter
| 2. Worker/runtime implementation
| 3. Registration here
|
*/

const runtimeRegistry = {
  pyodide: () =>
    new PythonRuntime(),

  javascript: () =>
    new JavaScriptRuntime(),

  sqlite: () =>
    new SqlRuntime(),

   "linux-terminal": () =>
    new LinuxRuntime(),

   "php-wasm": () => new PHPRuntime(),
};

/*
|--------------------------------------------------------------------------
| Create Runtime
|--------------------------------------------------------------------------
*/

export const createRuntime = (
  runtimeKey
) => {
  const runtimeFactory =
    runtimeRegistry[runtimeKey];

  if (!runtimeFactory) {
    return null;
  }

  return runtimeFactory();
};

/*
|--------------------------------------------------------------------------
| Check Runtime Support
|--------------------------------------------------------------------------
*/

export const isRuntimeSupported = (
  runtimeKey
) => {
  return Boolean(
    runtimeRegistry[runtimeKey]
  );
};

/*
|--------------------------------------------------------------------------
| Get Available Runtimes
|--------------------------------------------------------------------------
*/

export const getAvailableRuntimes =
  () => {
    return Object.keys(
      runtimeRegistry
    );
  };

export default runtimeRegistry;