import BookOpen from "lucide-react/dist/esm/icons/book-open";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";


export default function ContentArea({
  sublesson,
}) {
  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  */

  const contents =
    Array.isArray(
      sublesson?.contents
    )
      ? sublesson.contents
      : [];


  /*
  |--------------------------------------------------------------------------
  | Markdown Components
  |--------------------------------------------------------------------------
  */

  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className="mb-4 mt-10 text-3xl font-bold tracking-tight text-[#0B1F3A] first:mt-0">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="mb-4 mt-9 text-2xl font-bold tracking-tight text-[#0B1F3A] first:mt-0">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="mb-3 mt-7 text-xl font-bold text-[#0B1F3A]">
        {children}
      </h3>
    ),

    h4: ({ children }) => (
      <h4 className="mb-3 mt-6 text-lg font-bold text-[#0B1F3A]">
        {children}
      </h4>
    ),

    p: ({ children }) => (
      <p className="mb-5 text-base leading-8 text-slate-700">
        {children}
      </p>
    ),

    strong: ({ children }) => (
      <strong className="font-bold text-[#0B1F3A]">
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="italic">
        {children}
      </em>
    ),

    ul: ({ children }) => (
      <ul className="mb-6 list-disc space-y-2 pl-7 text-base leading-7 text-slate-700">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="mb-6 list-decimal space-y-2 pl-7 text-base leading-7 text-slate-700">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="pl-1">
        {children}
      </li>
    ),

    blockquote: ({
      children,
    }) => (
      <blockquote className="my-7 border-l-4 border-[#F4C95D] bg-amber-50 px-5 py-4 text-slate-700">
        {children}
      </blockquote>
    ),

    hr: () => (
      <hr className="my-8 border-slate-200" />
    ),

    a: ({
      href,
      children,
    }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-blue-600 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-800"
      >
        {children}
      </a>
    ),

    table: ({ children }) => (
      <div className="my-7 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-slate-100 text-[#0B1F3A]">
        {children}
      </thead>
    ),

    tbody: ({ children }) => (
      <tbody className="divide-y divide-slate-200 bg-white">
        {children}
      </tbody>
    ),

    th: ({ children }) => (
      <th className="border-r border-slate-200 px-4 py-3 font-bold last:border-r-0">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="border-r border-slate-200 px-4 py-3 text-slate-700 last:border-r-0">
        {children}
      </td>
    ),

    code({
      inline,
      className,
      children,
      ...props
    }) {
      const match =
        /language-(\w+)/.exec(
          className || ""
        );

      const codeValue =
        String(children)
          .replace(/\n$/, "");

      if (
        !inline &&
        (
          match ||
          codeValue.includes("\n")
        )
      ) {
        const language =
          match?.[1] ||
          "text";

        return (
          <div className="my-7 overflow-hidden rounded-xl bg-[#0B1F3A] shadow-sm">

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {language}
              </span>

            </div>

            <SyntaxHighlighter
              language={language}
              style={oneDark}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "1.25rem",
                background:
                  "#0B1F3A",
                fontSize:
                  "0.875rem",
                lineHeight:
                  "1.75",
              }}
              {...props}
            >
              {codeValue}
            </SyntaxHighlighter>

          </div>
        );
      }

      return (
        <code
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm font-medium text-[#0B1F3A]"
          {...props}
        >
          {children}
        </code>
      );
    },
  };


  /*
  |--------------------------------------------------------------------------
  | Render Content Block
  |--------------------------------------------------------------------------
  */

  const renderContent = (
    content
  ) => {
    const type =
      content?.type ||
      "text";

    const value =
      content?.content ||
      "";

    switch (type) {
      /*
      |--------------------------------------------------------------------------
      | Heading
      |--------------------------------------------------------------------------
      */

      case "heading":
        return (
          <h2 className="mt-10 text-2xl font-bold tracking-tight text-[#0B1F3A] first:mt-0">
            {value}
          </h2>
        );


      /*
      |--------------------------------------------------------------------------
      | Code
      |--------------------------------------------------------------------------
      */

      case "code": {
        const language =
          content?.settings
            ?.language ||
          "javascript";

        return (
          <div className="my-7 overflow-hidden rounded-xl bg-[#0B1F3A] shadow-sm">

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {language}
              </span>

            </div>

            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: "1.25rem",
                background:
                  "#0B1F3A",
                fontSize:
                  "0.875rem",
                lineHeight:
                  "1.75",
              }}
            >
              {value}
            </SyntaxHighlighter>

          </div>
        );
      }


      /*
      |--------------------------------------------------------------------------
      | Image
      |--------------------------------------------------------------------------
      */

      case "image":
        return (
          <div className="my-7">

            <img
              src={value}
              alt={
                content?.settings
                  ?.alt ||
                sublesson?.title ||
                ""
              }
              className="max-w-full rounded-xl"
            />

          </div>
        );


      /*
      |--------------------------------------------------------------------------
      | Video
      |--------------------------------------------------------------------------
      */

      case "video":
        return (
          <div className="my-7 overflow-hidden rounded-xl bg-black">

            <video
              controls
              className="w-full"
            >
              <source
                src={value}
              />

              Your browser does not
              support video playback.
            </video>

          </div>
        );


      /*
      |--------------------------------------------------------------------------
      | Markdown
      |--------------------------------------------------------------------------
      */

      case "markdown":
        return (
          <div className="markdown-content">

            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
              components={
                markdownComponents
              }
            >
              {value}
            </ReactMarkdown>

          </div>
        );


      /*
      |--------------------------------------------------------------------------
      | Text
      |--------------------------------------------------------------------------
      */

      case "text":
      default:
        return (
          <div className="whitespace-pre-wrap text-base leading-8 text-slate-700">
            {value}
          </div>
        );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <article className="min-w-0">

      {/* Sublesson Title */}
      <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A] md:text-4xl">

        {sublesson?.lessonIndex + 1}

        .

        {sublesson?.sublessonIndex + 1}

        {" "}

        {sublesson?.title}

      </h1>


      {/* Description */}
      {sublesson?.description && (

        <p className="mt-4 text-lg leading-8 text-slate-500">
          {sublesson.description}
        </p>

      )}


      {/* Divider */}
      <div className="my-8 border-t border-slate-200" />


      {/* Content */}
      {contents.length > 0 ? (

        <div className="space-y-6">

          {contents.map(
            (content) => (

              <div
                key={
                  content.id
                }
              >
                {renderContent(
                  content
                )}
              </div>

            )
          )}

        </div>

      ) : (

        <div className="py-10">

          <BookOpen
            size={30}
            className="text-slate-300"
          />

          <p className="mt-3 text-sm text-slate-500">
            No learning content has
            been published for this
            sublesson yet.
          </p>

        </div>

      )}

    </article>
  );
}