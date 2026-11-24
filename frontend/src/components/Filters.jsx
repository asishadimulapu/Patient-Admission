export const FILTERS = [
  ["ward", "Ward"],
  ["department", "Department"],
  ["doctor", "Doctor"],
];
export const NO_FILTERS = { ward: "", department: "", doctor: "" };

export default function Filters({ options, search, setSearch, filters, setFilters }) {
  function clearAll() {
    setFilters(NO_FILTERS);
    setSearch("");
  }

  return (
    <section className="toolbar">
      <input
        type="search"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {options &&
        FILTERS.map(([key, label]) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
          >
            <option value="">All {label.toLowerCase()}s</option>
            {options[key].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}
      <button className="btn ghost" onClick={clearAll}>
        Clear
      </button>
    </section>
  );
}
