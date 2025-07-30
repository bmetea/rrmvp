import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";

interface CompetitionPrizeDetailProps {
  winningTickets: number[];
  claimedTickets: number[];
  description: string;
  totalPrizes: number;
  prizeName: string;
  isWalletCredit?: boolean;
}

export function CompetitionPrizeDetail({
  winningTickets,
  claimedTickets,
  description,
  totalPrizes,
  prizeName,
  isWalletCredit = false,
}: CompetitionPrizeDetailProps) {
  const [tab, setTab] = useState(isWalletCredit ? "description" : "tickets");
  const [page, setPage] = useState(1);
  const perPage = 30;
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
    <div className="bg-white">
      {/* Tabs */}
      {!isWalletCredit && (
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 font-bold text-base transition-colors ${
              tab === "tickets"
                ? "border-b-2 border-[#E19841] text-black"
                : "text-gray-500"
            }`}
            onClick={() => setTab("tickets")}
          >
            TICKETS
          </button>
          <button
            className={`flex-1 py-3 font-bold text-base transition-colors ${
              tab === "description"
                ? "border-b-2 border-[#E19841] text-black"
                : "text-gray-500"
            }`}
            onClick={() => setTab("description")}
          >
            DESCRIPTION
          </button>
        </div>
      )}

      {tab === "tickets" && !isWalletCredit && (
        <div className="p-4">
          {/* Mobile Grid */}
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: perPage }).map((_, idx) => {
              const ticket = paginatedTickets[idx];
              const claimed = ticket && claimedTickets.includes(ticket);
              const isAvailable =
                ticket && winningTickets.includes(ticket) && !claimed;
              if (!ticket) return <div key={"empty-" + idx} />;
              return (
                <div
                  key={ticket + "-" + idx}
                  className="relative aspect-square flex flex-col"
                >
                  <div
                    className={`absolute inset-0 rounded-lg flex items-center justify-center ${
                      isAvailable
                        ? "bg-[#E19841]/10 border-2 border-[#E19841]"
                        : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`font-mono text-xl font-bold ${
                        isAvailable ? "text-[#E19841]" : "text-black"
                      }`}
                    >
                      {ticket}
                    </span>
                  </div>
                  {claimed && (
                    <div className="absolute inset-x-0 bottom-0 bg-gray-200/90 py-1 rounded-b-lg">
                      <span className="text-[10px] font-bold text-gray-600 text-center block">
                        WON
                      </span>
                    </div>
                  )}
                  {isAvailable && (
                    <div className="absolute inset-x-0 bottom-0 bg-[#E19841]/90 py-1 rounded-b-lg">
                      <span className="text-[10px] font-bold text-white text-center block">
                        AVAILABLE
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={
                        page === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first page, current page, last page, and pages around current page
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    // Show ellipsis for gaps
                    if (
                      (pageNum === 2 && page > 3) ||
                      (pageNum === totalPages - 1 && page < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="pointer-events-none"
                          >
                            ...
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {(tab === "description" || isWalletCredit) && (
        <div className="p-4">
          <div className="prose prose-zinc prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description || "No description available."}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
