import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

export const GraphState = Annotation.Root({
  // Inputs
  companyName: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  roleTitle: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  jobDescription: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  baseResume: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  
  // Agent 1 Output
  researchInsights: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  companyInsights: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  
  // Agent 2 state
  tailorIterations: Annotation<number>({
    reducer: (state, action) => state + action,
    default: () => 0,
  }),
  currentTailoredResume: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  resumeHTML: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  
  // Agent 3 state
  originalScore: Annotation<number>({
    reducer: (state, action) => action ?? state,
    default: () => 0,
  }),
  criticFeedback: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  currentScore: Annotation<number>({
    reducer: (state, action) => action ?? state,
    default: () => 0,
  }),
  scoreHistory: Annotation<string[]>({
    reducer: (state, action) => [...state, ...action],
    default: () => [],
  }),
  improvedSections: Annotation<string>({
    reducer: (state, action) => action ?? state,
    default: () => "",
  }),
  
  // System State
  messages: Annotation<BaseMessage[]>({
    reducer: (state, action) => state.concat(action),
    default: () => [],
  }),
});

export type GraphStateType = typeof GraphState.State;
