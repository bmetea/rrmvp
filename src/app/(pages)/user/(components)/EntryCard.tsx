import { useState } from "react";
import { CompetitionEntry } from "@/(pages)/user/(server)/entry.service";
import { Card, CardContent } from "@/shared/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/shared/lib/utils/price";

interface EntryCardProps {
  entry: CompetitionEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"tickets" | "prizes">("tickets");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getWinningTicketsCount = (entry: CompetitionEntry) => {
    return entry.winning_tickets?.length || 0;
  };

  const winningTicketsCount = getWinningTicketsCount(entry);
  const hasWinningTickets = winningTicketsCount > 0;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      onClick={toggleExpanded}
      style={{
        width: "100%",
        background: "#FFFFFF",
        border: hasWinningTickets ? "2px solid #E19841" : "1px solid #E7E7E7",
        borderRadius: 16,
        padding: 24,
        gap: 24,
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent style={{ padding: 0 }}>
        {/* Title and Content Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignSelf: "stretch",
            gap: 16,
          }}
        >
          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "stretch",
              gap: 4,
            }}
          >
            <div
              style={{
                alignSelf: "stretch",
                color: "#151515",
                fontSize: 22,
                fontFamily: "Crimson Pro",
                fontWeight: "500",
                lineHeight: "1.111328125em",
                wordWrap: "break-word",
              }}
            >
              {entry.competition.title}
            </div>
            <div
              style={{
                alignSelf: "stretch",
                color: "#313131",
                fontSize: 14,
                fontFamily: "Open Sans",
                fontWeight: "400",
                lineHeight: "1.5em",
                wordWrap: "break-word",
              }}
            >
              {`Drawer date: ${formatDate(
                entry.competition.end_date || entry.created_at
              )}`}
            </div>
          </div>

          {/* Ticket Info and Action Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              alignSelf: "stretch",
              gap: 16,
            }}
          >
            {/* Ticket Badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                background: hasWinningTickets ? "#E19841" : "#E7E7E7",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <path
                    d="M18 2H16V0H4V2H2C0.9 2 0 2.9 0 4V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V4C20 2.9 19.1 2 18 2ZM6 2H14V4H6V2ZM18 14H2V6H4V8H6V6H14V8H16V6H18V14Z"
                    fill="#313131"
                  />
                </svg>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <div
                  style={{
                    color: "#151515",
                    fontSize: 22,
                    fontFamily: "Crimson Pro",
                    fontWeight: "500",
                    wordWrap: "break-word",
                  }}
                >
                  {entry.tickets.length}
                </div>
                <div
                  style={{
                    color: "#313131",
                    fontSize: 14,
                    fontFamily: "Open Sans",
                    fontWeight: "400",
                    lineHeight: "1.5em",
                    wordWrap: "break-word",
                  }}
                >
                  Tickets
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <button
                onClick={toggleExpanded}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  background: "transparent",
                  border: "none",
                  borderRadius: 200,
                  cursor: "pointer",
                }}
              >
                {isExpanded ? (
                  <ChevronUp
                    style={{ color: "#3D2C8D", strokeWidth: 2 }}
                    size={24}
                  />
                ) : (
                  <ChevronDown
                    style={{ color: "#3D2C8D", strokeWidth: 2 }}
                    size={24}
                  />
                )}
              </button>
              <div
                style={{
                  color: "#3D2C8D",
                  fontSize: 16,
                  fontFamily: "Open Sans",
                  fontWeight: "400",
                  lineHeight: "1.5em",
                  wordWrap: "break-word",
                }}
              >
                {isExpanded ? "Hide results" : "Reveal results"}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <>
            {/* Tab Toggle */}
            {hasWinningTickets && (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  marginTop: 24,
                  background: "#E7E7E7",
                  borderRadius: 8,
                  padding: 4,
                  gap: 0,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("tickets");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 4,
                    border: "none",
                    background:
                      activeTab === "tickets" ? "#E19841" : "transparent",
                    color: activeTab === "tickets" ? "#FFFFFF" : "#313131",
                    fontSize: 14,
                    fontFamily: "Open Sans",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  Your Tickets ({entry.tickets.length})
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("prizes");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: 4,
                    border: "none",
                    background:
                      activeTab === "prizes" ? "#E19841" : "transparent",
                    color: activeTab === "prizes" ? "#FFFFFF" : "#313131",
                    fontSize: 14,
                    fontFamily: "Open Sans",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  Prizes ({winningTicketsCount})
                </button>
              </div>
            )}

            {/* Tickets Section */}
            {(activeTab === "tickets" || !hasWinningTickets) && (
              <div
                style={{
                  display: "flex",
                  alignSelf: "stretch",
                  gap: 24,
                  padding: 16,
                  background: "#F7F7F7",
                  borderRadius: 8,
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    flex: "1 1 0",
                    alignSelf: "stretch",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      alignSelf: "stretch",
                      color: "#313131",
                      fontSize: 14,
                      fontFamily: "Open Sans",
                      fontWeight: "400",
                      lineHeight: "1.5em",
                      wordWrap: "break-word",
                    }}
                  >
                    Your tickets
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    {entry.tickets.map((ticketNumber) => {
                      const winningTicket = entry.winning_tickets?.find(
                        (wt) => wt.ticket_number === ticketNumber
                      );
                      const isWinning = !!winningTicket;

                      if (isWinning) {
                        return (
                          <div
                            key={ticketNumber}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 10px",
                              background: "#E19841",
                              borderRadius: 4,
                            }}
                          >
                            <div
                              style={{
                                color: "#151515",
                                fontSize: 22,
                                fontFamily: "Crimson Pro",
                                fontWeight: "500",
                                wordWrap: "break-word",
                              }}
                            >
                              WIN
                            </div>
                            <div
                              style={{
                                color: "#313131",
                                fontSize: 14,
                                fontFamily: "Open Sans",
                                fontWeight: "400",
                                lineHeight: "1.5em",
                                wordWrap: "break-word",
                              }}
                            >
                              Ticket: {ticketNumber}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={ticketNumber}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            background: "#E7E7E7",
                            borderRadius: 4,
                          }}
                        >
                          <div
                            style={{
                              color: "#151515",
                              fontSize: 22,
                              fontFamily: "Crimson Pro",
                              fontWeight: "500",
                              wordWrap: "break-word",
                            }}
                          >
                            NO WIN
                          </div>
                          <div
                            style={{
                              color: "#313131",
                              fontSize: 14,
                              fontFamily: "Open Sans",
                              fontWeight: "400",
                              lineHeight: "1.5em",
                              wordWrap: "break-word",
                            }}
                          >
                            Ticket: {ticketNumber}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Prizes Section */}
            {activeTab === "prizes" && hasWinningTickets && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  marginTop: 16,
                }}
              >
                {entry.winning_tickets?.map((winningTicket) => (
                  <div
                    key={`${winningTicket.ticket_number}-${winningTicket.prize_id}`}
                    style={{
                      display: "flex",
                      alignSelf: "stretch",
                      gap: 24,
                      padding: 16,
                      background: "#F4E8D1",
                      borderRadius: 8,
                      marginTop: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "stretch",
                        gap: 16,
                        flex: "1 1 0",
                      }}
                    >
                      <div
                        style={{
                          alignSelf: "stretch",
                          color: "#151515",
                          fontSize: 22,
                          fontFamily: "Crimson Pro",
                          fontWeight: "500",
                          lineHeight: "1.111328125em",
                          textAlign: "center",
                          wordWrap: "break-word",
                        }}
                      >
                        You WON {winningTicket.prize_name}!
                      </div>
                      <div
                        style={{
                          alignSelf: "stretch",
                          color: "#313131",
                          fontSize: 16,
                          fontFamily: "Open Sans",
                          fontWeight: "400",
                          lineHeight: "1.5em",
                          textAlign: "center",
                          wordWrap: "break-word",
                        }}
                      >
                        Prize value: {formatPrice(winningTicket.prize_value)} •
                        Ticket #{winningTicket.ticket_number}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
