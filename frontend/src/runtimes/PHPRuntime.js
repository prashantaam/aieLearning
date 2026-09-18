export default class PHPRuntime {
  constructor() {
    this.worker = null;
  }

  createWorker() {
    this.worker = new Worker(
      new URL(
        "../workers/phpWorker.js",
        import.meta.url
      ),
      { type: "module" }
    );

    return this.worker;
  }

  getName() {
    return "PHP";
  }

  getRuntimeKey() {
    return "php-wasm";
  }

  createRunMessage(code) {
    return {
      type: "run",
      code,
    };
  }
}