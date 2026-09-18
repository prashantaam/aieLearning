export default class SqlRuntime {
  constructor() {
    this.worker = null;
  }

  createWorker() {
    this.worker = new Worker(
      new URL(
        "../workers/sqlWorker.js",
        import.meta.url
      ),
      {
        type: "module",
      }
    );

    return this.worker;
  }

  getName() {
    return "SQLite";
  }

  getRuntimeKey() {
    return "sqlite";
  }

  createRunMessage(
    code,
    exercise
  ) {
    const message = {
      type: "run",
      code,
      setupSql:
        exercise?.settings
          ?.setup_sql || "",
    };

    // Temporary debugging
    console.log(
      "SQL Runtime Message:",
      message
    );

    return message;
  }
}