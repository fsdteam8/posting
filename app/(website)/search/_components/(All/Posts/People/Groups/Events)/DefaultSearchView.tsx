const RECENT_USERS = [
  { name: "Issac Newton", updates: "1 new update" },
  { name: "Fouzia Amin", updates: "2 new update" },
  { name: "Sristy Rodriques", updates: "8 new update" },
  { name: "Sarah Rozario", updates: "4 new update" },
];

const PEOPLE_YOU_MAY_KNOW = [
  { name: "Issac Newton", mutual: "143 mutual friends" },
  { name: "Fouzia Amin", mutual: "8 mutual friends" },
  { name: "Sarah Rozario", mutual: "8 mutual friends" },
  { name: "Rain Corraya", mutual: "8 mutual friends" },
  { name: "Joseph", mutual: "8 mutual friends" },
  { name: "Plaize Rosline", mutual: "8 mutual friends" },
];

export default function DefaultSearchView() {
  return (
    <div className="space-y-6">
      {/* Top section: Trending + Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trending Hashtags */}
        <div>
          <h2 className="font-bold text-[#1C1E21] mb-4 text-base">
            Trending Hashtags
          </h2>
          <ul className="space-y-3">
            {[
              { tag: "#LordRain", posts: "400 posts" },
              { tag: "#happybirthday", posts: "800 posts" },
              { tag: "#happybirthday", posts: "800 posts" },
              { tag: "#nature", posts: "100 posts" },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#65676B] text-sm w-5">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1C1E21] hover:text-[#1877F2] cursor-pointer transition-colors">
                    {item.tag}
                  </p>
                  <p className="text-xs text-[#65676B]">{item.posts}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent */}
        <div>
          <h2 className="font-bold text-[#1C1E21] mb-4 text-base">Recent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RECENT_USERS.map((u, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2F5] cursor-pointer transition-colors group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1877F2] to-[#42B72A] flex items-center justify-center text-white text-xs font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#42B72A] rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1C1E21] truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-[#1877F2]">{u.updates}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#65676B] hover:text-[#1C1E21]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* People you may know */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1C1E21] text-base">
            People you may know
          </h2>
          <button className="text-sm text-[#1877F2] font-medium hover:underline">
            See All
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {PEOPLE_YOU_MAY_KNOW.map((p, i) => (
            <div
              key={i}
              className="shrink-0 w-35 bg-white border border-[#E4E6EB] rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#1877F2]/20 to-[#42B72A]/20 flex items-center justify-center text-[#1877F2] text-xl font-bold border-2 border-[#E4E6EB]">
                {p.name.charAt(0)}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-[#1C1E21] leading-tight">
                  {p.name}
                </p>
                <p className="text-[10px] text-[#65676B] mt-0.5">{p.mutual}</p>
              </div>
              <button className="w-full mt-1 py-1.5 bg-[#E7F3FF] text-[#1877F2] text-xs font-semibold rounded-lg hover:bg-[#1877F2] hover:text-white transition-colors flex items-center justify-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Add Friend
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
