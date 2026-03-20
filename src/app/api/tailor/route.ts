import { NextRequest, NextResponse } from "next/server";
import { appRunner } from "@/lib/agents/graph";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./../auth/[...nextauth]/route";
import { getGoogleClients, getDriveFileText, uploadTailoredResume, ensureTrackingSheet, appendToTracker } from "@/lib/google/api";

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendStatus = (msg: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(msg) + "\n"));
      };

      try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.accessToken) {
          sendStatus({ error: "Unauthorized. Please log in with Google." });
          controller.close();
          return;
        }

        const body = await req.json();
        const { companyName, jobDescription, baseResumeFileId, trackingSheetId } = body;

        if (!companyName || !jobDescription || !baseResumeFileId) {
          sendStatus({ error: "Missing required fields" });
          controller.close();
          return;
        }

        const { drive, sheets } = getGoogleClients(session.accessToken);
        
        sendStatus({ status: "Reading resume from Google Drive..." });
        const baseResumeContent = await getDriveFileText(drive, baseResumeFileId);

        const initialState = {
          companyName,
          jobDescription,
          baseResume: baseResumeContent,
          tailorIterations: 0,
          messages: []
        };

        sendStatus({ status: "Starting Multi-Agent Workflow..." });

        // Use .stream() to get updates from the graph as nodes complete
        const eventStream = await appRunner.stream(initialState, {
          streamMode: "values"
        });

        let finalState: any = null;
        for await (const update of eventStream) {
          finalState = update;
          if (finalState.currentScore > 0) {
            sendStatus({ status: `Current ATS Score: ${finalState.currentScore} (Iteration ${finalState.tailorIterations})` });
          } else if (finalState.researchInsights && !finalState.currentTailoredResume) {
            sendStatus({ status: "Researcher Agent complete. Tailoring resume..." });
          } else if (finalState.currentTailoredResume) {
             sendStatus({ status: "Tailor Agent complete. Critic evaluating..." });
          }
        }

        sendStatus({ status: "Finalizing: Uploading to Drive and updating Tracking Sheet..." });

        const uploadResult = await uploadTailoredResume(
          drive, 
          finalState.currentTailoredResume, 
          companyName, 
          "Tailored Resume"
        );

        let finalSheetId = trackingSheetId;
        if (!finalSheetId) {
          finalSheetId = await ensureTrackingSheet(drive, sheets);
        }
        
        await appendToTracker(
          sheets, 
          finalSheetId, 
          companyName, 
          "Tailored Role", 
          "JD Input", 
          finalState.currentScore, 
          uploadResult.link || ""
        );

        sendStatus({ 
          done: true,
          finalScore: finalState.currentScore,
          iterations: finalState.tailorIterations,
          originalScore: finalState.originalScore,
          scoreHistory: finalState.scoreHistory || [],
          tailoredResume: finalState.currentTailoredResume,
          criticFeedback: finalState.criticFeedback,
          researchInsights: finalState.researchInsights,
          driveUrl: uploadResult.link
        });

      } catch (error: any) {
        console.error("Error in tailor API:", error);
        sendStatus({ error: error.message });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
