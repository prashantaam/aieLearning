export default class JavaScriptRuntime {
  constructor() {
    this.worker = null;
  }

  createWorker() {
    this.worker = new Worker(
      new URL(
        "../workers/javascriptWorker.js",
        import.meta.url
      )
    );

    return this.worker;
  }

  getName() {
    return "JavaScript";
  }

  getRuntimeKey() {
    return "javascript";
  }

  createRunMessage(code) {
    return {
      type: "run",
      code,
    };
  }
}