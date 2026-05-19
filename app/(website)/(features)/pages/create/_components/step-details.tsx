"use client";

import { PageFormData } from "./create-page-client";

const HOURS_OPTIONS = [
  {
    value: "No hours available",
    label: "No hours available",
    sub: "Don't show any hours.",
  },
  {
    value: "Always open",
    label: "Always open",
    sub: "You're open 24 hours every day.",
  },
  {
    value: "Selected hours",
    label: "Standard hours",
    sub: "Enter your specific hours.",
  },
  {
    value: "Temporarily closed",
    label: "Temporarily closed",
    sub: "You're closed for a period of time.",
  },
  {
    value: "Permanently closed",
    label: "Permanently closed",
    sub: "This page is no longer active.",
  },
];

interface StepDetailsProps {
  pageName: string;
  category: string;
  formData: PageFormData;
  onChange: (field: keyof PageFormData, value: string) => void;
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 mb-3">{label}</p>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

export function StepDetails({
  pageName,
  category,
  formData,
  onChange,
}: StepDetailsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          What category best describes {pageName}?
        </h2>
        {category && (
          <p className="text-sm text-gray-500">
            Category:{" "}
            <span className="font-medium text-gray-700">{category}</span>
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Choose one category to show on your page. You can add two extra
          categories to improve search results.
        </p>
      </div>

      {/* General */}
      <FieldGroup label="General">
        <Field label="Bio" sub="Describe what your page is about">
          <textarea
            value={formData.bio}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="Write here..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </FieldGroup>

      {/* Contact */}
      <FieldGroup label="Contact">
        <Field label="Website">
          <input
            type="url"
            value={formData.website}
            onChange={(e) => onChange("website", e.target.value)}
            placeholder="Write website URL here..."
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Write email address here..."
            className={inputClass}
          />
        </Field>
        <Field label="Phone number">
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="Write phone number here..."
            className={inputClass}
          />
        </Field>
      </FieldGroup>

      {/* Location */}
      <FieldGroup label="Location">
        <Field label="Address">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Write address here..."
            className={inputClass}
          />
        </Field>
        <Field label="City/town">
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Write city/town here..."
            className={inputClass}
          />
        </Field>
        <Field label="Postcode">
          <input
            type="text"
            value={formData.postcode}
            onChange={(e) => onChange("postcode", e.target.value)}
            placeholder="Write postcode here..."
            className={inputClass}
          />
        </Field>
      </FieldGroup>

      {/* Hours */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-0.5">Hours</p>
        <p className="text-xs text-gray-400 mb-3">
          Let people know your location&apos;s hours.
        </p>
        <div className="flex flex-col gap-0 rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {HOURS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.sub}</p>
              </div>
              <input
                type="radio"
                name="hours"
                value={opt.value}
                checked={formData.hoursStatus === opt.value}
                onChange={() => onChange("hoursStatus", opt.value)}
                className="w-4 h-4 accent-blue-600"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
