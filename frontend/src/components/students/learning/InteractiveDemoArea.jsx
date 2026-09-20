import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function InteractiveDemoArea({ demo }) {
  if (!demo) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h2 className="text-lg font-bold text-[#0B1F3A]">
            Interactive demo not available
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            This interactive demo could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 bg-slate-50">
      {/* Instruction + Interactive Demo */}
      <div className="grid min-h-0 lg:h-full lg:grid-cols-[42%_58%]">
        {/* =========================================================
            LEFT - TITLE + INSTRUCTION
        ========================================================= */}

        <section className="overflow-y-auto border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="mx-auto max-w-2xl px-6 py-7 lg:px-8 lg:py-8">
            {/* Demo Title */}

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Interactive Demo
              </p>

              <h1 className="mt-2 text-2xl font-bold leading-tight text-[#0B1F3A]">
                {demo.title}
              </h1>
            </div>

            {/* Divider */}

            <div className="mb-6 border-t border-slate-200" />

            {/* Instruction Label */}

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Instructions
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#0B1F3A]">
                Try it yourself
              </h2>
            </div>

            {/* Instruction Content */}

            <div className="prose prose-slate max-w-none prose-headings:text-[#0B1F3A] prose-a:text-cyan-700 prose-code:text-[#0B1F3A]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {demo.instruction || ""}
              </ReactMarkdown>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT - INTERACTIVE DEMO
        ========================================================= */}

        <section className="flex min-h-[500px] flex-col bg-slate-100 lg:min-h-0">
          {/* Playground Header */}

          <div className="flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-4">
            <span className="text-sm font-bold text-[#0B1F3A]">
              Play Ground
            </span>
          </div>

          {/* Demo */}

          <div className="min-h-0 flex-1 p-4">
            <div className="h-full min-h-[450px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:min-h-0">
              <iframe
                title={demo.title || "Interactive Demo"}
                srcDoc={demo.code || ""}
                sandbox="allow-scripts"
                className="h-full min-h-[450px] w-full border-0 bg-white lg:min-h-0"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}