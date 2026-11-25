const FILTER_FIELDS = [
  ["ward", "All wards"],
  ["department", "All departments"],
  ["doctor", "All doctors"],
];

export default function Filters({ options, search, filters, onSearchChange, onFilterChange, onClear }) {
  return (
    <section className="toolbar">
      <input
        type="search"
        placeholder="Search by name..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {options &&
        FILTER_FIELDS.map(([field, allLabel]) => (
          <select
            key={field}
            value={filters[field]}
            onChange={(event) => onFilterChange(field, event.target.value)}
          >
            <option value="">{allLabel}</option>
            {options[field].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ))}

      <button className="btn ghost" onClick={onClear}>
        Clear
      </button>
    </section>
  );
}
