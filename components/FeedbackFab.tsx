const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdl1NevcMpIa7jh7v2d6ec_IjzvCxTtt8L52F8whEuvq2HuEg/viewform";

export default function FeedbackFab() {
  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-[45] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 [bottom:max(1rem,env(safe-area-inset-bottom,0px))] [right:max(1rem,env(safe-area-inset-right,0px))] outline-none transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
      aria-label="回饋建議（開啟新分頁）"
    >
      <span className="whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-md shadow-slate-900/10 ring-1 ring-slate-200/90 backdrop-blur-sm">
        回饋建議
      </span>
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-600 text-2xl leading-none text-white shadow-lg shadow-purple-900/25 transition hover:bg-purple-700"
        aria-hidden
      >
        💬
      </span>
    </a>
  );
}
