import React, { useState, useEffect } from "react";

import {
  isSurveyElement,
  createSurveyOption,
  SurveyElement,
  getSurveyResults,
  CaptureUpdateAction,
} from "@excalidraw/element";

import { register } from "./register";
import { getFormValue } from "./actionProperties";
import { ToolButton } from "../components/ToolButton";

import type { AppState } from "../types";
import type { Action } from "./types";

const elementToSurveyData = (element: any) => {
  if (!isSurveyElement(element)) {
    return null;
  }
  return {
    question: element.question,
    options: element.options.map((opt: any) => opt.text),
    allowMultipleVotes: element.allowMultipleVotes,
    isAnonymous: element.isAnonymous,
  };
};

const updateElement = (
  element: any,
  appState: AppState,
  formData: any,
): any => {
  if (!isSurveyElement(element)) {
    return element;
  }

  return {
    ...element,
    question: formData.question || "Survey Question",
    options: formData.options.map((text: string) => 
      text ? createSurveyOption(text) : createSurveyOption("Option")
    ),
    allowMultipleVotes: formData.allowMultipleVotes || false,
    isAnonymous: formData.isAnonymous || false,
  };
};

export const actionChangeSurvey: Action = {
  name: "changeSurvey",
  label: "Change Survey",
  trackEvent: { category: "element", action: "changeSurvey" },
  perform: (elements, appState, _, app) => {
    const selectedElements = elements.filter(el => isSurveyElement(el));
    if (selectedElements.length === 0) {
      return false;
    }

    return {
      elements,
      appState,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) => event.key === "s" && (event.ctrlKey || event.metaKey),
  PanelComponent: ({ elements, appState, updateData, app }) => {
    const selectedElements = elements.filter(el => isSurveyElement(el));
    
    if (selectedElements.length === 0) {
      return null;
    }

    // Get current survey data from selected elements
    const currentSurveyData = selectedElements.length > 0 
      ? elementToSurveyData(selectedElements[0])
      : {
          question: "What's your opinion?",
          options: ["Option 1", "Option 2"],
          allowMultipleVotes: false,
          isAnonymous: false,
        };

    const [question, setQuestion] = useState(currentSurveyData?.question || "");
    const [options, setOptions] = useState(currentSurveyData?.options || ["Option 1", "Option 2"]);
    const [allowMultipleVotes, setAllowMultipleVotes] = useState(currentSurveyData?.allowMultipleVotes || false);
    const [isAnonymous, setIsAnonymous] = useState(currentSurveyData?.isAnonymous || false);

    useEffect(() => {
      if (currentSurveyData) {
        setQuestion(currentSurveyData.question);
        setOptions(currentSurveyData.options);
        setAllowMultipleVotes(currentSurveyData.allowMultipleVotes);
        setIsAnonymous(currentSurveyData.isAnonymous);
      }
    }, [currentSurveyData]);

    const handleQuestionChange = (value: string) => {
      setQuestion(value);
      updateData({ question: value });
    };

    const handleOptionChange = (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
      updateData({ options: newOptions });
    };

    const addOption = () => {
      const newOptions = [...options, `Option ${options.length + 1}`];
      setOptions(newOptions);
      updateData({ options: newOptions });
    };

    const removeOption = (index: number) => {
      if (options.length > 1) {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        updateData({ options: newOptions });
      }
    };

    const handleMultipleVotesChange = (value: boolean) => {
      setAllowMultipleVotes(value);
      updateData({ allowMultipleVotes: value });
    };

    const handleAnonymousChange = (value: boolean) => {
      setIsAnonymous(value);
      updateData({ isAnonymous: value });
    };

    // Show results if there are votes
    const showResults = selectedElements.some(el => isSurveyElement(el) && (el as SurveyElement).votes.length > 0);
    const results = showResults ? getSurveyResults(selectedElements[0] as SurveyElement) : null;

    return (
      <fieldset>
        <legend>Survey</legend>
        
        {/* Question Input */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Question</label>
          <input
            type="text"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {/* Options */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Options</label>
          {options.map((option, index) => (
            <div key={index} style={{ display: "flex", marginBottom: "0.5rem", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                style={{ flex: 1, padding: "0.5rem" }}
              />
              {options.length > 1 && (
                <ToolButton
                  type="button"
                  icon="trash"
                  title="Remove option"
                  onClick={() => removeOption(index)}
                  aria-label="Remove option"
                  style={{ padding: "0.5rem" }}
                />
              )}
            </div>
          ))}
          <ToolButton
            type="button"
            icon="plus"
            title="Add option"
            onClick={addOption}
            aria-label="Add option"
            style={{ marginTop: "0.5rem" }}
          >
            Add Option
          </ToolButton>
        </div>

        {/* Settings */}
        <div style={{ marginBottom: "1rem" }}>
          <label>Settings</label>
          
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={allowMultipleVotes}
                onChange={(e) => handleMultipleVotesChange(e.target.checked)}
              />
              Allow multiple votes
            </label>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => handleAnonymousChange(e.target.checked)}
              />
              Anonymous voting
            </label>
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "var(--color-primary-light)", borderRadius: "4px" }}>
            <h4>Results ({results.totalVotes} votes)</h4>
            {results.results.map((result, index) => (
              <div key={result.id} style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span>{result.text}</span>
                  <span>{result.votes} ({result.percentage.toFixed(1)}%)</span>
                </div>
                <div style={{ 
                  height: "8px", 
                  backgroundColor: "var(--color-primary)", 
                  width: `${result.percentage}%`,
                  borderRadius: "4px",
                  transition: "width 0.3s ease"
                }} />
              </div>
            ))}
          </div>
        )}
      </fieldset>
    );
  },
};

register({
  name: "changeSurvey",
  label: "Change Survey",
  trackEvent: { category: "element", action: "changeSurvey" },
  perform: (elements, appState, _, app) => {
    const selectedElements = elements.filter(el => isSurveyElement(el));
    if (selectedElements.length === 0) {
      return false;
    }

    return {
      elements,
      appState,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    };
  },
  keyTest: (event) => event.key === "s" && (event.ctrlKey || event.metaKey),
  PanelComponent: actionChangeSurvey.PanelComponent,
});
