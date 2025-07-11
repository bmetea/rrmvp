import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface CompetitionDetailsProps {
  content: string; // Markdown content from the database
}

export function CompetitionDetails({ content }: CompetitionDetailsProps) {
  const components: Components = {
    // Customize heading rendering
    h1: ({ children }) => (
      <h1 className="flex items-center gap-2">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="flex items-center gap-2">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="flex items-center gap-2">{children}</h3>
    ),

    // Customize blockquote rendering
    blockquote: ({ children }) => (
      <blockquote className="bg-gray-50 border-l-4 border-gray-300 pl-4 py-2 my-4">
        {children}
      </blockquote>
    ),

    // Customize list rendering
    ul: ({ children }) => <ul className="space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="space-y-2">{children}</ol>,

    // Customize link rendering
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        {children}
      </a>
    ),

    // Customize pre/code rendering
    pre: ({ children }) => (
      <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
        {children}
      </pre>
    ),
    code: ({ children, className }) => (
      <code className={`${className} bg-gray-100 rounded px-1`}>
        {children}
      </code>
    ),

    // Custom checkbox rendering for task lists
    input: ({ type, checked }) =>
      type === "checkbox" ? (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="h-4 w-4 rounded border-gray-300"
        />
      ) : null,
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-h5:text-base prose-h6:text-sm prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-400">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
