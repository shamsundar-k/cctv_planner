import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { RefreshCw } from "lucide-react";
import { useProjectStore } from "../../../store/projectSlice";
import type { SortBy } from "../../../store/projectSlice";

const SORT_LABELS: Record<SortBy, string> = {
  modified_desc: "Last Modified (Newest)",
  modified_asc: "Last Modified (Oldest)",
  name_asc: "Name (A–Z)",
  name_desc: "Name (Z–A)",
};

interface HeaderProps {
  pageTitle: string;
  filteredCount: number;
  onCreateClick: () => void;
  onRefresh: () => void;
  isFetching: boolean;
  dataUpdatedAt?: number;
}

function formatUpdatedAt(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return "over a day ago";
}

export default function Header({
  pageTitle,
  filteredCount,
  onCreateClick,
  onRefresh,
  isFetching,
  dataUpdatedAt,
}: HeaderProps) {
  const { sortBy, searchQuery, setSortBy, setSearchQuery } = useProjectStore();

  const [sortOpen, setSortOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setSortOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Ctrl+N opens create modal
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        onCreateClick();
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onCreateClick]);

  function handleSearchChange(value: string) {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
      debounceRef.current = null;
    }, 300);
  }

  function handleRefresh() {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setSpinning(true);
    onRefresh();
    refreshTimerRef.current = setTimeout(() => {
      setSpinning(false);
      refreshTimerRef.current = null;
    }, 600);
  }

  const btnCls =
    "h-9 px-3.5 border border-panel-border rounded-lg text-sm bg-panel text-text-secondary cursor-pointer flex items-center gap-1.5 whitespace-nowrap hover:bg-divider/60 hover:text-text-primary transition-colors";
  const dropdownCls =
    "absolute top-[calc(100%+4px)] left-0 bg-panel border border-panel-border rounded-lg shadow-[0_12px_32px_rgba(15,23,42,0.18)] min-w-[200px] z-50 py-1 overflow-hidden";
  const menuItemCls = (active: boolean) =>
    `flex items-center gap-2 w-full text-left bg-transparent border-none px-3.5 py-2.5 text-sm text-text-secondary cursor-pointer hover:bg-divider/60 hover:text-text-primary transition-colors ${active ? "font-bold" : "font-normal"}`;

  return (
    <div className="mb-8">
      {/* Title row */}
      <h1 className="text-[32px] font-extrabold text-text-primary mb-5 tracking-tight">
        {pageTitle}
      </h1>

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Create button */}
        <button
          onClick={onCreateClick}
          className="h-9 px-4 bg-primary hover:bg-primary-hover text-primary-foreground border-none rounded-lg text-sm font-bold cursor-pointer transition-colors shadow-md shadow-primary/20"
          title="Create Project (Ctrl+N)"
        >
          + Create Project
        </button>

        <Link
          to="/tools/fov-visualiser"
          className="h-9 px-4 border border-primary/40 rounded-lg text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors flex items-center"
        >
          FOV visualiser
        </Link>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={localSearch}
            placeholder="Search projects..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 w-64 pl-3 pr-8 border border-panel-border rounded-lg text-sm bg-panel text-text-primary placeholder:text-text-muted outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          {localSearch && (
            <button
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted hover:text-text-primary text-base leading-none p-0"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative">
          <button
            className={btnCls}
            onClick={() => {
              setSortOpen((o) => !o);
            }}
          >
            Sort: {SORT_LABELS[sortBy]}
            <span className="text-[10px] ml-0.5">▼</span>
          </button>
          {sortOpen && (
            <div className={dropdownCls}>
              {(Object.entries(SORT_LABELS) as [SortBy, string][]).map(
                ([value, label]) => (
                  <button
                    key={value}
                    className={menuItemCls(sortBy === value)}
                    onClick={() => {
                      setSortBy(value);
                      setSortOpen(false);
                    }}
                  >
                    <span className="w-4 text-text-muted">
                      {sortBy === value ? "✓" : ""}
                    </span>
                    {label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          aria-label="Refresh projects"
          className="w-9 h-9 bg-panel border border-panel-border rounded-lg cursor-pointer flex items-center justify-center text-text-muted hover:bg-divider/60 hover:text-text-primary transition-colors"
        >
          <RefreshCw
            size={16}
            className={spinning || isFetching ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Metadata line */}
      <p className="text-sm text-text-muted mt-3">
        {filteredCount} project{filteredCount !== 1 ? "s" : ""}
        {dataUpdatedAt ? ` · Updated ${formatUpdatedAt(dataUpdatedAt)}` : ""}
      </p>
    </div>
  );
}
