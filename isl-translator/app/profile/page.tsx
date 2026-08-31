export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-3xl p-6 shadow-soft border border-primary-100/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">User Profile</h2>
            <p className="text-xs text-primary-600">Preferences & Settings</p>
          </div>
        </div>
        <div className="bg-primary-50/70 border border-primary-100 rounded-2xl p-4 text-center mt-4">
          <span className="text-2xl mb-1 block">⚙️</span>
          <h3 className="font-semibold text-primary-800 text-sm">Coming Soon</h3>
          <p className="text-xs text-primary-600 mt-1">
            Manage your account settings, dark mode preferences, and saved dictionaries.
          </p>
        </div>
      </div>
    </div>
  );
}
