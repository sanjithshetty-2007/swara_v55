export default function LearnPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-primary-100/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-accent-soft text-primary-600 rounded-2xl">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Learn ISL</h2>
            <p className="text-xs text-primary-600">Interactive Sign Language tutorials</p>
          </div>
        </div>
        <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-4 text-center mt-4">
          <span className="text-2xl mb-1 block">📚</span>
          <h3 className="font-semibold text-primary-800 text-sm">Coming Soon</h3>
          <p className="text-xs text-primary-600 mt-1">
            We are preparing flashcards, alphabets, and beginner lessons for Indian Sign Language.
          </p>
        </div>
      </div>
    </div>
  );
}
