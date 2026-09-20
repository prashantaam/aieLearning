import { useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Code2,
  Eye,
  Loader2,
  MonitorPlay,
  Save,
} from "lucide-react";

import axiosInstance from "../../../utils/axiosInstance";
import TeacherLayout from "../../../components/teachers/TeacherLayout";

const InteractiveDemoCreatePage = () => {
  const {
    lessonId,
    sublessonId,
  } = useParams();

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [form, setForm] = useState({
    title: "",
    instruction: "",
    code: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Preview State
  |--------------------------------------------------------------------------
  |
  | We keep preview separate from form.code so the demo only re-runs when
  | the teacher clicks "Run Preview".
  |
  */

  const [previewCode, setPreviewCode] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Preview
  |--------------------------------------------------------------------------
  */

  const handlePreview = () => {
    setError("");

    if (!form.code.trim()) {
      setError(
        "Please enter demo code before running the preview."
      );

      return;
    }

    setPreviewCode(form.code);
  };

  /*
  |--------------------------------------------------------------------------
  | Save Demo
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /*
    |--------------------------------------------------------------------------
    | Frontend Validation
    |--------------------------------------------------------------------------
    */

    if (!form.title.trim()) {
      setError(
        "Please enter a title for the interactive demo."
      );

      return;
    }

    if (!form.instruction.trim()) {
      setError(
        "Please enter instructions for the student."
      );

      return;
    }

    if (!form.code.trim()) {
      setError(
        "Please enter the interactive demo code."
      );

      return;
    }

    try {
      setSaving(true);

      /*
      |--------------------------------------------------------------------------
      | API Payload
      |--------------------------------------------------------------------------
      |
      | The demo now contains:
      |
      | title
      | instruction
      | code
      |
      | The code field contains the complete HTML document including any
      | CSS and JavaScript required by the interactive demo.
      |
      */

      const payload = {
        title: form.title.trim(),
        instruction: form.instruction.trim(),
        code: form.code,

        settings: {
          renderer: "browser",
          version: 1,
        },

        source_type: "manual",
      };

      await axiosInstance.post(
        `/api/teacher/sublessons/${sublessonId}/demos`,
        payload
      );

      /*
      |--------------------------------------------------------------------------
      | Return to Demo List
      |--------------------------------------------------------------------------
      */

      navigate(
        `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/demos`
      );
    } catch (err) {
      console.error(
        "Failed to create interactive demo:",
        err
      );

      const validationErrors =
        err.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(
            validationErrors
          )?.[0]?.[0];

        setError(
          firstError ||
            "Please check the form and try again."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create interactive demo."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Back
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    navigate(
      `/teacher/lessons/${lessonId}/sublessons/${sublessonId}/demos`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <TeacherLayout>

      <div className="p-6 lg:p-8">

        <div className="mx-auto max-w-7xl">

          {/* Back */}

          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Interactive Demos
          </button>

          {/* Header */}

          <div className="mb-8">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                <MonitorPlay className="h-6 w-6" />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Create Interactive Demo
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Add student instructions and build an
                  interactive browser-based demonstration.
                </p>

              </div>

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ============================================================
                TITLE
            ============================================================ */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-gray-900">
                Demo Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Give the interactive activity a clear,
                student-friendly title.
              </p>

              <div className="mt-5">

                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Live Counter"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />

              </div>

            </div>

            {/* ============================================================
                INSTRUCTION
            ============================================================ */}

            <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

              <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">

                <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="text-sm font-semibold text-gray-900">
                    Student Instruction
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    This content will appear on the left
                    side of the student learning screen.
                  </p>

                </div>

              </div>

              <div className="p-5">

                <label
                  htmlFor="instruction"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Instruction
                </label>

                <textarea
                  id="instruction"
                  name="instruction"
                  value={form.instruction}
                  onChange={handleChange}
                  rows={10}
                  placeholder={`## Try the counter

Click **+1** to increase the number.

Click **-1** to decrease the number.

Click **Reset** to return the counter to zero.

Notice how the displayed value changes immediately.`}
                  className="block w-full resize-y rounded-xl border border-gray-300 bg-white p-4 font-mono text-sm leading-6 text-gray-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Markdown can be used for headings,
                  bold text, lists and code examples.
                </p>

              </div>

            </div>

            {/* ============================================================
                CODE + PREVIEW
            ============================================================ */}

            <div className="grid gap-6 xl:grid-cols-2">

              {/* ----------------------------------------------------------
                  DEMO CODE
              ---------------------------------------------------------- */}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                      <Code2 className="h-5 w-5" />
                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-gray-900">
                        Demo Code
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        HTML, CSS and JavaScript in one
                        self-contained document.
                      </p>

                    </div>

                  </div>

                </div>

                <textarea
                  id="code"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  spellCheck={false}
                  rows={32}
                  placeholder={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 40px;
    }

    .counter {
      font-size: 64px;
      font-weight: bold;
      margin: 30px 0;
    }

    button {
      padding: 10px 18px;
      margin: 5px;
      cursor: pointer;
    }
  </style>
</head>

<body>

  <h2>Live Counter</h2>

  <div
    id="count"
    class="counter"
  >
    0
  </div>

  <button id="minus">
    -1
  </button>

  <button id="add">
    +1
  </button>

  <button id="reset">
    Reset
  </button>

  <script>
    let count = 0;

    const countElement =
      document.getElementById("count");

    function updateCounter() {
      countElement.textContent = count;
    }

    document
      .getElementById("add")
      .addEventListener("click", () => {
        count++;
        updateCounter();
      });

    document
      .getElementById("minus")
      .addEventListener("click", () => {
        count--;
        updateCounter();
      });

    document
      .getElementById("reset")
      .addEventListener("click", () => {
        count = 0;
        updateCounter();
      });
  <\/script>

</body>
</html>`}
                  className="block min-h-[700px] w-full resize-y border-0 bg-gray-950 p-5 font-mono text-sm leading-6 text-gray-100 outline-none"
                />

              </div>

              {/* ----------------------------------------------------------
                  LIVE PREVIEW
              ---------------------------------------------------------- */}

              <div>

                <div className="sticky top-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                  {/* Preview Header */}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
                        <Eye className="h-5 w-5" />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-gray-900">
                          Interactive Preview
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Preview exactly what the student
                          will interact with.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handlePreview}
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      <Eye className="h-4 w-4" />

                      Run Preview
                    </button>

                  </div>

                  {/* Browser Bar */}

                  <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">

                    <span className="h-3 w-3 rounded-full bg-red-400" />

                    <span className="h-3 w-3 rounded-full bg-yellow-400" />

                    <span className="h-3 w-3 rounded-full bg-green-400" />

                    <div className="ml-2 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-500">
                      Student Demo Preview
                    </div>

                  </div>

                  {/* Preview */}

                  {previewCode ? (
                    <iframe
                      key={previewCode}
                      title="Interactive demo preview"
                      sandbox="allow-scripts"
                      srcDoc={previewCode}
                      className="h-[700px] w-full border-0 bg-white"
                    />
                  ) : (
                    <div className="flex h-[700px] items-center justify-center bg-gray-50 p-8">

                      <div className="max-w-sm text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                          <MonitorPlay className="h-7 w-7" />
                        </div>

                        <h3 className="mt-4 font-semibold text-gray-900">
                          Preview your demo
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          Enter your interactive demo code
                          and click Run Preview to test it
                          before saving.
                        </p>

                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* ============================================================
                ACTIONS
            ============================================================ */}

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-6">

              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePreview}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />

                Preview
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />

                    Save Demo
                  </>
                )}
              </button>

            </div>

          </form>

        </div>

      </div>

    </TeacherLayout>
  );
};

export default InteractiveDemoCreatePage;
