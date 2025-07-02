import React, { useState } from "react";

export function CompetitionPrizeDetail({
  winningTickets,
  claimedTickets,
  description,
}) {
  const [tab, setTab] = useState("tickets");
  const [page, setPage] = useState(1);
  const perPage = 96;
  const totalPages = Math.ceil(
    new Set([...winningTickets, ...claimedTickets]).size / perPage
  );
  // Combine, dedupe, and sort tickets for pagination
  const allTickets = Array.from(
    new Set([...winningTickets, ...claimedTickets])
  ).sort((a, b) => a - b);
  const paginatedTickets = allTickets.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div>
      <div className="flex mb-4 rounded overflow-hidden border border-gray-200 dark:border-[#232326]">
        <button
          className={`flex-1 py-2 font-bold text-[18px] md:text-[20px] leading-[150%] transition-colors ${
            tab === "tickets"
              ? "bg-white dark:bg-[#232326] text-black dark:text-white"
              : "bg-gray-100 dark:bg-[#18181b] text-gray-500"
          }`}
          onClick={() => setTab("tickets")}
        >
          TICKETS
        </button>
        <button
          className={`flex-1 py-2 font-bold text-[18px] md:text-[20px] leading-[150%] transition-colors ${
            tab === "description"
              ? "bg-white dark:bg-[#232326] text-black dark:text-white"
              : "bg-gray-100 dark:bg-[#18181b] text-gray-500"
          }`}
          onClick={() => setTab("description")}
        >
          DESCRIPTION
        </button>
      </div>
      {tab === "tickets" && (
        <>
          {/* Responsive grid: 16x6 on mobile (scrollable), 6x16 on desktop (no scroll) */}
          <div className="overflow-x-auto md:overflow-x-visible">
            <div
              className="grid mb-4"
              style={{
                gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
                gridTemplateRows: "repeat(6, minmax(0, 1fr))",
                minWidth: "64rem",
                width: "max(100%, 64rem)",
                gap: "0.75rem",
              }}
            >
              {/* Desktop override: 6x16 */}
              <style>{`
                @media (min-width: 768px) {
                  .prize-ticket-grid {
                    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
                    grid-template-rows: repeat(16, minmax(0, 1fr)) !important;
                    min-width: 0 !important;
                    width: 100% !important;
                  }
                }
              `}</style>
              <div className="prize-ticket-grid contents">
                {Array.from({ length: 96 }).map((_, idx) => {
                  const ticket = paginatedTickets[idx];
                  const claimed = ticket && claimedTickets.includes(ticket);
                  const isWinning = ticket && winningTickets.includes(ticket);
                  if (!ticket)
                    return <div key={"empty-" + idx} className="h-20" />;
                  return (
                    <div
                      key={ticket + "-" + idx}
                      className="flex flex-col items-center bg-white dark:bg-[#232326] rounded-lg shadow border border-gray-200 dark:border-[#232326] p-2 min-w-[72px] max-w-[90px] w-full h-20 justify-center"
                    >
                      <span className="font-mono text-[16px] md:text-[18px] leading-[150%] font-bold mb-2 text-black dark:text-white">
                        {ticket}
                      </span>
                      <span
                        className={`w-full rounded py-1.5 font-bold text-[14px] leading-[150%] text-center transition-colors
                          ${
                            claimed
                              ? "bg-gray-300 dark:bg-gray-700 text-gray-500"
                              : isWinning
                              ? "bg-[#E19841] text-black hover:bg-[#D18A33]"
                              : ""
                          }`}
                        style={isWinning ? { cursor: "pointer" } : {}}
                      >
                        {claimed ? "ALREADY WON" : isWinning ? "WIN NOW" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <button
                className="px-2 py-1 rounded disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                &lt;
              </button>
              <span className="font-bold text-sm">
                {page > 2 && <span>...</span>}
                {page > 1 && <span className="mx-1">{page - 1}</span>}
                <span className="mx-1 text-[#E19841]">{page}</span>
                {page < totalPages && <span className="mx-1">{page + 1}</span>}
                {page < totalPages - 1 && <span>...</span>}
              </span>
              <button
                className="px-2 py-1 rounded disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
      {tab === "description" && (
        <div className="text-[16px] md:text-[18px] leading-[150%] text-black dark:text-white">
          {description}
        </div>
      )}
    </div>
  );
}
