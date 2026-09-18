/*
|--------------------------------------------------------------------------
| Linux Terminal Worker
|--------------------------------------------------------------------------
|
| Browser-based Linux command simulator.
|
| This is NOT a real Linux operating system.
| It provides a safe virtual environment for
| introductory Linux exercises.
|
*/

let currentDirectory = "/home/student";

let fileSystem = {};

/*
|--------------------------------------------------------------------------
| Reset Virtual Environment
|--------------------------------------------------------------------------
*/

const resetEnvironment = () => {
  currentDirectory = "/home/student";

  fileSystem = {
    "/": {
      type: "directory",
    },

    "/home": {
      type: "directory",
    },

    "/home/student": {
      type: "directory",
    },

    "/home/student/readme.txt": {
      type: "file",
      content:
        "Welcome to the Linux course!",
    },
  };
};

/*
|--------------------------------------------------------------------------
| Normalise Path
|--------------------------------------------------------------------------
*/

const normalisePath = (path) => {
  if (!path) {
    return currentDirectory;
  }

  let fullPath;

  if (path.startsWith("/")) {
    fullPath = path;
  } else {
    fullPath =
      currentDirectory === "/"
        ? `/${path}`
        : `${currentDirectory}/${path}`;
  }

  const parts = [];

  for (const part of fullPath.split("/")) {
    if (
      !part ||
      part === "."
    ) {
      continue;
    }

    if (part === "..") {
      parts.pop();
      continue;
    }

    parts.push(part);
  }

  return `/${parts.join("/")}`;
};

/*
|--------------------------------------------------------------------------
| List Directory
|--------------------------------------------------------------------------
*/

const listDirectory = (directory) => {
  const prefix =
    directory === "/"
      ? "/"
      : `${directory}/`;

  const items = new Set();

  Object.keys(fileSystem).forEach(
    (path) => {
      if (!path.startsWith(prefix)) {
        return;
      }

      const remaining =
        path.slice(prefix.length);

      if (!remaining) {
        return;
      }

      const name =
        remaining.split("/")[0];

      items.add(name);
    }
  );

  return Array.from(items)
    .sort()
    .join("\n");
};

/*
|--------------------------------------------------------------------------
| Execute Command
|--------------------------------------------------------------------------
*/

const executeCommand = (
  commandLine
) => {
  const trimmed =
    commandLine.trim();

  if (!trimmed) {
    return "";
  }

  const parts =
    trimmed.split(/\s+/);

  const command =
    parts[0];

  const args =
    parts.slice(1);

  /*
  |--------------------------------------------------------------------------
  | pwd
  |--------------------------------------------------------------------------
  */

  if (command === "pwd") {
    return currentDirectory;
  }

  /*
  |--------------------------------------------------------------------------
  | whoami
  |--------------------------------------------------------------------------
  */

  if (command === "whoami") {
    return "student";
  }

  /*
  |--------------------------------------------------------------------------
  | ls
  |--------------------------------------------------------------------------
  */

  if (command === "ls") {
    const target =
      args[0]
        ? normalisePath(
            args[0]
          )
        : currentDirectory;

    if (
      !fileSystem[target] ||
      fileSystem[target].type !==
        "directory"
    ) {
      return `ls: cannot access '${args[0]}': No such file or directory`;
    }

    return listDirectory(target);
  }

  /*
  |--------------------------------------------------------------------------
  | cd
  |--------------------------------------------------------------------------
  */

  if (command === "cd") {
    const target =
      args[0]
        ? normalisePath(
            args[0]
          )
        : "/home/student";

    if (
      !fileSystem[target] ||
      fileSystem[target].type !==
        "directory"
    ) {
      return `cd: ${args[0]}: No such file or directory`;
    }

    currentDirectory = target;

    return "";
  }

  /*
  |--------------------------------------------------------------------------
  | mkdir
  |--------------------------------------------------------------------------
  */

  if (command === "mkdir") {
    if (!args[0]) {
      return "mkdir: missing operand";
    }

    const target =
      normalisePath(
        args[0]
      );

    fileSystem[target] = {
      type: "directory",
    };

    return "";
  }

  /*
  |--------------------------------------------------------------------------
  | touch
  |--------------------------------------------------------------------------
  */

  if (command === "touch") {
    if (!args[0]) {
      return "touch: missing file operand";
    }

    const target =
      normalisePath(
        args[0]
      );

    fileSystem[target] = {
      type: "file",
      content: "",
    };

    return "";
  }

  /*
  |--------------------------------------------------------------------------
  | cat
  |--------------------------------------------------------------------------
  */

  if (command === "cat") {
    if (!args[0]) {
      return "cat: missing file operand";
    }

    const target =
      normalisePath(
        args[0]
      );

    const file =
      fileSystem[target];

    if (
      !file ||
      file.type !== "file"
    ) {
      return `cat: ${args[0]}: No such file or directory`;
    }

    return file.content;
  }

  /*
  |--------------------------------------------------------------------------
  | Unsupported Command
  |--------------------------------------------------------------------------
  */

  return `${command}: command not found`;
};

/*
|--------------------------------------------------------------------------
| Worker Messages
|--------------------------------------------------------------------------
*/

self.onmessage = (event) => {
  const {
    type,
    code,
  } = event.data;

  /*
  |--------------------------------------------------------------------------
  | Initialise
  |--------------------------------------------------------------------------
  */

  if (type === "init") {
    resetEnvironment();

    self.postMessage({
      type: "ready",
    });

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Run
  |--------------------------------------------------------------------------
  */

  if (type === "run") {
    try {
      /*
       * Start each exercise attempt
       * from a clean environment.
       */
      resetEnvironment();

      const commands =
        code.split("\n");

      const output = [];

      for (
        const command of commands
      ) {
        if (!command.trim()) {
          continue;
        }

        const result =
          executeCommand(
            command
          );

        if (result) {
          output.push(result);
        }
      }

      self.postMessage({
        type: "result",
        output:
          output.join("\n"),
      });
    } catch (error) {
      self.postMessage({
        type:
          "execution-error",

        error:
          error?.message ||
          String(error),
      });
    }
  }
};