import React from "react";
import { isSurveyElement, SurveyElement, getSurveyResults } from "@excalidraw/element";

interface SurveyElementProps {
  element: SurveyElement;
  isInteractive?: boolean;
  onVote?: (optionId: string) => void;
  userId?: string;
}

export const SurveyElementComponent: React.FC<SurveyElementProps> = ({
  element,
  isInteractive = false,
  onVote,
  userId,
}) => {
  const results = getSurveyResults(element);
  const hasVoted = userId && element.votes.some(vote => vote.userId === userId);
  const canVote = isInteractive && !hasVoted && !element.allowMultipleVotes;

  const handleVote = (optionId: string) => {
    if (canVote && onVote) {
      onVote(optionId);
    }
  };

  return (
    <div
      className="survey-element"
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: "white",
        border: "2px solid #000000",
        borderRadius: "8px",
        padding: "1rem",
        fontFamily: "Virgil, Segoe UI Emoji, sans-serif",
        fontSize: "16px",
        color: "#000000",
        boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
        cursor: canVote ? "pointer" : "default",
      }}
    >
      {/* Question */}
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "1rem",
          fontSize: "18px",
          textAlign: "center",
        }}
      >
        {element.question}
      </div>

      {/* Options */}
      <div style={{ marginBottom: "1rem" }}>
        {element.options.map((option, index) => (
          <div
            key={option.id}
            className="survey-option"
            onClick={() => handleVote(option.id)}
            style={{
              padding: "0.75rem",
              marginBottom: "0.5rem",
              backgroundColor: canVote ? "#f8f9fa" : "#ffffff",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              cursor: canVote ? "pointer" : "default",
              transition: "all 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (canVote) {
                e.currentTarget.style.backgroundColor = "#e9ecef";
                e.currentTarget.style.borderColor = "#007bff";
              }
            }}
            onMouseLeave={(e) => {
              if (canVote) {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#dee2e6";
              }
            }}
          >
            {/* Progress bar for results */}
            {results.totalVotes > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${results.results.find(r => r.id === option.id)?.percentage || 0}%`,
                  backgroundColor: "#007bff",
                  opacity: 0.2,
                  transition: "width 0.3s ease",
                }}
              />
            )}

            {/* Option text and vote count */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <span>{option.text}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {results.totalVotes > 0 && (
                  <span style={{ fontSize: "14px", color: "#6c757d" }}>
                    {option.votes} ({results.results.find(r => r.id === option.id)?.percentage.toFixed(1)}%)
                  </span>
                )}
                {hasVoted && element.votes.some(vote => vote.optionId === option.id) && (
                  <span style={{ color: "#28a745", fontSize: "18px" }}>✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Survey info */}
      <div
        style={{
          fontSize: "12px",
          color: "#6c757d",
          textAlign: "center",
          paddingTop: "0.5rem",
          borderTop: "1px solid #dee2e6",
        }}
      >
        {results.totalVotes} {results.totalVotes === 1 ? "vote" : "votes"}
        {element.isAnonymous && " • Anonymous"}
        {element.allowMultipleVotes && " • Multiple votes allowed"}
      </div>

      {/* Voting status */}
      {isInteractive && (
        <div
          style={{
            fontSize: "12px",
            color: hasVoted ? "#28a745" : "#6c757d",
            textAlign: "center",
            marginTop: "0.5rem",
            fontStyle: "italic",
          }}
        >
          {hasVoted ? "You have voted" : canVote ? "Click an option to vote" : "Viewing results"}
        </div>
      )}
    </div>
  );
};

export default SurveyElementComponent;
