import { StateGraph } from "@langchain/langgraph";
import { GraphState } from "./state";
import { researcherAgent, scoreResumeAgent, tailorAgent, concisennessAgent, criticAgent, evaluateLoop } from "./nodes";

// Define the graph passing the Annotation.Root directly 
const workflow = new StateGraph(GraphState)
  .addNode("researcher", researcherAgent)
  .addNode("scorer", scoreResumeAgent)
  .addNode("tailor", tailorAgent)
  .addNode("conciseness", concisennessAgent)
  .addNode("critic", criticAgent)
  .addEdge("researcher", "scorer")
  .addEdge("scorer", "tailor")
  .addEdge("tailor", "conciseness")
  .addEdge("conciseness", "critic")
  .addConditionalEdges("critic", evaluateLoop, {
    end: "__end__",
    tailor: "tailor"
  });

// Set the entry point
workflow.setEntryPoint("researcher");

// Compile the graph
export const appRunner = workflow.compile();
