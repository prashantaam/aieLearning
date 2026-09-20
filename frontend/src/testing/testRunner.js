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
| Normalise Comparable Value
|--------------------------------------------------------------------------
|
| SQLite/PHP may return values such as 1 as either a number or string.
| Converting both sides to strings keeps simple database comparisons
| predictable.
|
*/

const normalizeValue = (value) =>
  String(value ?? "").trim();

/*
|--------------------------------------------------------------------------
| Output Test
|--------------------------------------------------------------------------
*/

const runOutputTest = (
  test,
  context
) => {
  const actual = normalizeOutput(
    context.output
  );

  const expected = normalizeOutput(
    test.expected
  );

  return actual === expected;
};

/*
|--------------------------------------------------------------------------
| Contains Test
|--------------------------------------------------------------------------
*/

const runContainsTest = (
  test,
  context
) => {
  const actual = String(
    context.output ?? ""
  );

  const expected = String(
    test.expected ?? ""
  );

  return actual.includes(expected);
};

/*
|--------------------------------------------------------------------------
| DOM Test
|--------------------------------------------------------------------------
|
| Parses HTML returned by PHP/HTML exercises.
|
| Examples:
|
| h1
| form
| input[name="title"]
| button[type="submit"]
| .todo-item
|
*/

const runDomTest = (
  test,
  context
) => {
  const html = String(
    context.output ?? ""
  );

  if (!html.trim()) {
    return false;
  }

  const selector = String(
    test.selector ?? ""
  ).trim();

  if (!selector) {
    return false;
  }

  const parser =
    new DOMParser();

  const document =
    parser.parseFromString(
      html,
      "text/html"
    );

  const element =
    document.querySelector(
      selector
    );

  if (!element) {
    return false;
  }

  /*
   * If no expected text is supplied,
   * finding the element is enough.
   */
  if (
    test.expected === undefined ||
    test.expected === null ||
    String(test.expected).trim() === ""
  ) {
    return true;
  }

  /*
   * Otherwise check text inside
   * the selected element.
   */
  const actualText =
    normalizeOutput(
      element.textContent
    );

  const expectedText =
    normalizeOutput(
      test.expected
    );

  return actualText.includes(
    expectedText
  );
};

/*
|--------------------------------------------------------------------------
| Database Test
|--------------------------------------------------------------------------
|
| The SQL query itself is NOT executed here.
|
| phpWorker.js executes the SELECT query against SQLite and
| ExerciseArea passes the returned rows into this function:
|
| context.databaseRows
|
| Example rows:
|
| [
|   {
|     count: 1
|   }
| ]
|
*/

const runDatabaseTest = (
  test,
  context
) => {
  const rows =
    context.databaseRows;

  if (!Array.isArray(rows)) {
    throw new Error(
      "Database test result is not available."
    );
  }

  /*
   * If the test only wants to know whether
   * the query returned at least one row.
   */
  if (
    test.column === undefined ||
    test.column === null ||
    String(test.column).trim() === ""
  ) {
    return rows.length > 0;
  }

  const column =
    String(test.column).trim();

  /*
   * Query returned no rows.
   */
  if (rows.length === 0) {
    return false;
  }

  /*
   * Use the first returned row.
   */
  const firstRow =
    rows[0];

  if (
    !Object.prototype.hasOwnProperty.call(
      firstRow,
      column
    )
  ) {
    throw new Error(
      `Database result does not contain column "${column}".`
    );
  }

  /*
   * If no expected value is configured,
   * merely finding the column is enough.
   */
  if (
    test.expected === undefined ||
    test.expected === null
  ) {
    return true;
  }

  const actual =
    normalizeValue(
      firstRow[column]
    );

  const expected =
    normalizeValue(
      test.expected
    );

  return actual === expected;
};

/*
|--------------------------------------------------------------------------
| Run One Test
|--------------------------------------------------------------------------
*/

const runSingleTest = (
  test,
  context
) => {
  switch (test.type) {
    case "output":
      return runOutputTest(
        test,
        context
      );

    case "contains":
      return runContainsTest(
        test,
        context
      );

    case "dom":
      return runDomTest(
        test,
        context
      );

    case "database":
      return runDatabaseTest(
        test,
        context
      );

    default:
      throw new Error(
        `Unsupported test type: ${test.type}`
      );
  }
};

/*
|--------------------------------------------------------------------------
| Run Exercise Tests
|--------------------------------------------------------------------------
*/

export const runExerciseTests = (
  tests = [],
  context = {}
) => {
  if (!Array.isArray(tests)) {
    return [];
  }

  return tests.map(
    (test, index) => {
      try {
        const passed =
          runSingleTest(
            test,
            context
          );

        return {
          id:
            test.id ??
            `test-${index}`,

          name:
            test.name ??
            `Test ${index + 1}`,

          type:
            test.type,

          passed,

          error: null,
        };
      } catch (error) {
        return {
          id:
            test.id ??
            `test-${index}`,

          name:
            test.name ??
            `Test ${index + 1}`,

          type:
            test.type,

          passed: false,

          error:
            error?.message ||
            "Test failed.",
        };
      }
    }
  );
};

/*
|--------------------------------------------------------------------------
| All Tests Passed
|--------------------------------------------------------------------------
*/

export const didAllTestsPass = (
  results = []
) => {
  return (
    results.length > 0 &&
    results.every(
      (result) =>
        result.passed
    )
  );
};