"use client";

import React from "react";
import Link from "next/link";

type WorkItem = {
  id: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  workType?: string | null;
  link?: string | null;
  _sys: { filename: string };
};

type Category = {
  id: string;
  name: string;
};

export const WorkFilter = ({ items, categories }: { items: WorkItem[]; categories: Category[] }) => {
  const [active, setActive] = React.useState("All");
  const [leaving, setLeaving] = React.useState<Set<string>>(new Set());
  const [displayed, setDisplayed] = React.useState(items);
  const [entering, setEntering] = React.useState<Set<string>>(new Set());

  const currentIds = React.useMemo(() => {
    const filtered = active === "All" ? items : items.filter((item) => item.workType === active);
    return new Set(filtered.map((i) => i.id));
  }, [active, items]);

  const prevIds = React.useRef(currentIds);

  React.useEffect(() => {
    const removed = new Set<string>();
    for (const id of prevIds.current) {
      if (!currentIds.has(id)) removed.add(id);
    }

    if (removed.size === 0) {
      setDisplayed(active === "All" ? items : items.filter((item) => item.workType === active));
      return;
    }

    setLeaving(removed);

    const timeout = setTimeout(() => {
      const next = active === "All" ? items : items.filter((item) => item.workType === active);
      const added = new Set(next.map((i) => i.id));
      setEntering(added);
      setDisplayed(next);
      setLeaving(new Set());

      setTimeout(() => setEntering(new Set()), 300);
    }, 250);

    prevIds.current = currentIds;
    return () => clearTimeout(timeout);
  }, [active, items, currentIds]);

  const handleFilter = (name: string) => {
    if (name === active) return;
    prevIds.current = currentIds;
    setActive(name);
  };

  return (
    <>
      {categories.length > 0 && (
        <div className="wrapper">
          <div className="filter-tabs">
            <button
              className={`filter-tabs__btn${active === "All" ? " is-active" : ""}`}
              onClick={() => handleFilter("All")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`filter-tabs__btn${active === cat.name ? " is-active" : ""}`}
                onClick={() => handleFilter(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="separator-hearts">
        <img src="/images/eit-heart-layerz.png" alt="" />
      </div>

      <div className="wrapper section">
        <div className="grid" data-layout="3col">
          {displayed.map((item) => {
            const isLeaving = leaving.has(item.id);
            const isEntering = entering.has(item.id);

            return (
              <Link
                key={item.id}
                href={`/work/${item._sys.filename}`}
                className={`card card--linked${isEntering ? " card-enter" : ""}${isLeaving ? " card-leave" : ""}`}
              >
                <div className="card__image-wrap">
                  {item.image && (
                    <img src={item.image} alt="" className="card__image" loading="lazy" />
                  )}
                </div>
                <div className="card__body">
                  {item.workType && <span className="card__category">{item.workType}</span>}
                  <h2 className="card__title">{item.title}</h2>
                  {item.description && <p className="card__excerpt">{item.description.split('\n\n')[0]}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
