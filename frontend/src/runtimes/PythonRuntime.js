export default class PythonRuntime {
  constructor() {
    this.worker = null;
  }

  createWorker() {
    this.worker = new Worker(
      new URL(
        "../workers/pythonWorker.js",
        import.meta.url
      )
    );

    return this.worker;
  }

  getName() {
    return "Python";
  }

  getRuntimeKey() {
    return "pyodide";
  }

  createRunMessage(code) {
    return {
      type: "run",
      code,
    };
  }
}