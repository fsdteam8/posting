"use client";

interface StepNameProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepName({ value, onChange }: StepNameProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Get started with a Page
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Use the name of your business, brand or organisation, or a name that
          helps explain your Page.{" "}
          <button className="text-blue-500 hover:underline text-sm font-medium">
            Learn more
          </button>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page name
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write profile name here. . ."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>
  );
}
