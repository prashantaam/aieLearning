export default class LinuxRuntime {
  constructor() {
    this.worker = null;
  }

  createWorker() {
    this.worker = new Worker(
      new URL(
        "../workers/linuxWorker.js",
        import.meta.url
      )
    );

    return this.worker;
  }

  getName() {
    return "Linux Terminal";
  }

  getRuntimeKey() {
    return "linux-terminal";
  }

  createRunMessage(
    code,
    exercise
  ) {
    return {
      type: "run",
      code,
      settings:
        exercise?.settings || {},
    };
  }
}