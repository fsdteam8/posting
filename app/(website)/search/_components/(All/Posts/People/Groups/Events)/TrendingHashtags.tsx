const TRENDING = [
  { tag: "#LordRain", posts: "400 posts" },
  { tag: "#happybirthday", posts: "800 posts" },
  { tag: "#happybirthday", posts: "800 posts" },
  { tag: "#nature", posts: "100 posts" },
];

export default function TrendingHashtags() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E4E6EB]">
      <h3 className="font-semibold text-[#1C1E21] mb-3 text-sm">
        Trending Hashtags
      </h3>
      <ul className="space-y-3">
        {TRENDING.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-[#65676B] text-xs w-4 pt-0.5">{i + 1}</span>
            <div>
              <p className="text-sm font-medium text-[#1C1E21] hover:text-[#1877F2] cursor-pointer transition-colors">
                {item.tag}
              </p>
              <p className="text-xs text-[#65676B]">{item.posts}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
