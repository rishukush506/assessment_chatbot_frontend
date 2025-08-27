"use client";

import type React from "react";

import { useState , useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  User,
  Bot,
  Brain,
  TrendingUp,
  X,
  UserCircle,
} from "lucide-react";

/**
 * Represents a chat message between user and AI
 */
interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

/**
 * Represents assessment data for a specific financial trait
 */
interface TraitData {
  trait: string;
  score?: number; // Score from 1-5
  confidence?: number; // Confidence level from 1-10
  sentence?: string; // Assessment description
  rationale?: string; // Reasoning behind the assessment
  timestamp?: Date; // When the assessment was made
}

/**
 * Main state structure for the chat application
 */
interface ChatState {
  messages: Message[]; // Array of all chat messages
  traitData: TraitData[]; // Array of all trait assessments
  currentPriority?: string; // Current trait being assessed
  currentIteration?: number; // Current iteration of assessment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backendState?: any; // Complete backend state for API calls
}

/**
 * Main Chat component for financial trait assessment
 * Provides a conversational interface to assess user's financial traits
 */


export default function Chat() {
  // User id for database 
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {

    // for database
    async function startSession() {
      try {
        const res = await fetch(`${API_BASE}/start-session`, {
          method: "POST",
        });
        const data = await res.json();
        console.log("Session started:", data);

        setUserId(data.user_id);
        setSessionId(data.session_id);

      } catch (err) {
        console.error("Failed to start session", err);
      }
    }
    startSession();
  }, []);


  // Input state for the message input field
  const [input, setInput] = useState("");

  // Loading state for API calls
  const [isLoading, setIsLoading] = useState(false);

  // State for controlling persona popup visibility
  const [showPersonaPopup, setShowPersonaPopup] = useState(false);

  // Generated persona data from backend
  const [personaData, setPersonaData] = useState<string>("");

  // Loading state for persona generation
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);

  const [isTerminated,setIsTerminated] = useState(false);

  // Main chat state containing messages and trait assessments
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    traitData: [],
  });

  // Controls whether user can continue chatting (disabled after assessment completion)
  const [shouldContinue, setShouldContinue] = useState(true);
  // Base URL for backend API from environment variable
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  /**
   * List of financial traits that the system can assess
   * These correspond to specific psychological and behavioral patterns
   */
  const traits = [
    "awareness",
    "self_control",
    "preparedness",
    "information_seeking",
    "risk_seeking",
    "reaction_to_external_events",
  ];

  /**
   * Converts snake_case trait names to human-readable format
   * @param trait - The trait name in snake_case
   * @returns Formatted trait name with proper capitalization
   */
  const getTraitDisplayName = (trait: string) => {
    return trait
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /**
   * Calculates average scores and confidence levels for each trait
   * Aggregates multiple assessments for the same trait over time
   * @returns Array of traits with their averaged scores and confidence levels
   */
  const getLatestTraitScores = () => {
    const traitAggregates: {
      [key: string]: {
        totalScore: number;
        totalConfidence: number;
        count: number;
      };
    } = {};

    // Aggregate all trait data by trait name
    chatState.traitData.forEach((data) => {
      if (data.score !== undefined) {
        if (!traitAggregates[data.trait]) {
          traitAggregates[data.trait] = {
            totalScore: 0,
            totalConfidence: 0,
            count: 0,
          };
        }

        traitAggregates[data.trait].totalScore += data.score;
        traitAggregates[data.trait].totalConfidence += data.confidence || 0;
        traitAggregates[data.trait].count += 1;
      }
    });

    // Calculate averages for each trait
    return Object.entries(traitAggregates).map(([trait, aggregate]) => ({
      trait,
      score: aggregate.totalScore / aggregate.count,
      confidence: aggregate.totalConfidence / aggregate.count,
    }));
  };

  // Alternative implementation that keeps only the latest score per trait
  // const getLatestTraitScores = () => {
  //   const latestScores: { [key: string]: TraitData } = {}

  //   chatState.traitData.forEach((data) => {
  //     if (data.score !== undefined) {
  //       latestScores[data.trait] = data
  //     }
  //   })

  //   return Object.values(latestScores)
  // }

  /**
   * Generates a personality profile based on the current assessment data
   * Sends the backend state to the persona generation endpoint
   */
  const generatePersona = async () => {
    // Validate that we have assessment data before generating persona
    if (!chatState.backendState) {
      alert("No assessment data available. Please have a conversation first.");
      return;
    }

    setIsGeneratingPersona(true);
    try {
      // Call backend persona generation endpoint
      const response = await fetch(`${API_BASE}/persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: chatState.backendState,
          user_id:userId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Persona response:", data);

      // Set the generated persona data and show popup
      setPersonaData(data.response);
      setIsTerminated(true);
      setShowPersonaPopup(true);
    } catch (error) {
      console.error("Error generating persona:", error);
      alert("Failed to generate persona. Please try again.");
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  /**
   * Handles form submission for chat messages
   * Sends user message to backend and processes the response
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create user message object
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat state
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    // Clear input and set loading state
    setInput("");
    setIsLoading(true);

    try {
      // Send message to backend chat endpoint
      // console.log("userId")
      // console.log(userId)
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          message: input.trim(),
          state: chatState.backendState || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);

      // // Terminating chat when user writes end

      if(data.response=="terminate"){
        console.log("chat terminated")
        setIsTerminated(true)
      }

      // Create AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response,
        timestamp: new Date(),
      };

      console.log(
        "should continue: ",
        data.updated_state.continue_conversation
      );

      // Check if conversation should end and show final persona
      if (!data.updated_state.continue_conversation) {
        setShouldContinue(false);
        console.log("loading persona data: ", data);
        aiMessage.content = data.updated_state.persona;
      }

      // Extract NEW trait data from backend state
      const newTraitData: TraitData[] = [];
      const currentTime = new Date();

      // Process each trait to extract new assessment data
      traits.forEach((trait) => {
        const scores = data.updated_state[`${trait}_score`] || [];
        const confidences = data.updated_state[`${trait}_confidence`] || [];
        const sentences = data.updated_state[`${trait}_sentences`] || [];
        const rationales = data.updated_state[`${trait}_rationale`] || [];

        console.log(`${trait} data:`, {
          scores,
          confidences,
          sentences,
          rationales,
        });

        // Get the count of existing trait data for this trait
        const existingCount = chatState.traitData.filter(
          (t) => t.trait === trait
        ).length;

        // If we have new data (more items than before), add the new ones
        if (
          scores.length > existingCount ||
          sentences.length > existingCount ||
          rationales.length > existingCount
        ) {
          const maxLength = Math.max(
            scores.length,
            sentences.length,
            rationales.length,
            confidences.length
          );

          // Add new trait data items
          for (let i = existingCount; i < maxLength; i++) {
            // Only add if we have at least a sentence or score
            if (sentences[i] || scores[i] !== undefined) {
              newTraitData.push({
                trait,
                score: scores[i],
                confidence: confidences[i],
                sentence: sentences[i],
                rationale: rationales[i],
                timestamp: new Date(
                  currentTime.getTime() + newTraitData.length
                ), // Unique timestamp for ordering
              });
            }
          }
        }
      });

      console.log("New trait data extracted:", newTraitData); // Debug log

      // Update chat state with new message and trait data
      setChatState((prev) => ({
        messages: [...prev.messages, aiMessage],
        traitData: [...prev.traitData, ...newTraitData],
        currentPriority: data.updated_state.current_priority,
        currentIteration: data.updated_state.current_iteration,
        backendState: data.updated_state,
      }));

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);

      // Create error message for display
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `I apologize, but I'm having trouble connecting right now. Please try again.\nError: ${
          error instanceof Error ? error.message : String(error)
        }`,
        timestamp: new Date(),
      };

      // Add error message to chat
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }));
      setIsLoading(false);
    }
  };

  // Get the calculated trait scores for display
  const latestScores = getLatestTraitScores();

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <div className="max-w-4xl mx-auto flex flex-col h-screen">
        {/* Header Section */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-semibold">
                Financial Assessment Chat. 
              </h1>
            </div>
            
            {/* Show assessment progress indicator */}
            {latestScores.length > 0 && (
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">
                  {latestScores.length} traits assessed
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <p style={{fontSize:"13px"}}>
              After your traits get assessed you can generate your persona and end the conversation.
              <br></br>
              If somewhere in between you wish to not continue you can either write "end" or "quit" to terminate. 
          </p>
          </div>
        </div>

        {/* Trait Scores Display Section */}
        {latestScores.length > 0 && (
          <div className="border-b border-gray-700 p-4">
            <div className="flex flex-wrap gap-2">
              {latestScores.map((trait, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-800 text-gray-200 hover:bg-gray-700"
                >
                  {getTraitDisplayName(trait.trait)}: {trait.score.toFixed(1)}/5
                  {/* Show confidence level if available */}
                  {trait.confidence && (
                    <span className="ml-1 text-xs opacity-70">
                      ({trait.confidence.toFixed(1)}/10)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Messages Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message when no messages exist */}
          {chatState.messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Welcome to Financial Assessment</p>
              <p className="text-sm">
                Start a conversation to begin your financial trait assessment. You can start with a simple "Hi".
              </p>
            </div>
          )}

          {/* Render all chat messages */}
          {chatState.messages.map((message, index) => {
            // Get trait assessments that were added after this message
            const messageTraitAssessments = chatState.traitData.filter(
              (trait) => {
                // Show assessments that have data and were created after this message
                return (
                  trait.timestamp &&
                  trait.timestamp > message.timestamp &&
                  (trait.sentence ||
                    trait.score !== undefined ||
                    trait.rationale) &&
                  // Only show for the most recent user message or if this is not the last message
                  message.type === "user" &&
                  (index === chatState.messages.length - 2 || // Second to last (user message before AI response)
                    index === chatState.messages.length - 1) // Or last message
                );
              }
            );

            return (
              <div key={message.id} className="space-y-4">
                {/* Regular message bubble */}
                <div
                  className={`flex items-start space-x-3 ${
                    message.type === "user" ? "justify-end" : ""
                  }`}
                >
                  {/* AI avatar */}
                  {message.type === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message content */}
                  <div
                    className={`max-w-3xl ${
                      message.type === "user" ? "order-first" : ""
                    }`}
                  >
                    <Card
                      className={`p-4 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white ml-auto"
                          : "bg-gray-800 text-gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </Card>
                  </div>

                  {/* User avatar */}
                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Show trait assessments after user messages */}
                {message.type === "user" &&
                  messageTraitAssessments.length > 0 && (
                    <div className="space-y-3">
                      {messageTraitAssessments.map((trait, traitIndex) => (
                        <div
                          key={`${message.id}-assessment-${traitIndex}`}
                          className="flex items-start space-x-3"
                        >
                          {/* Assessment avatar */}
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                            <Brain className="w-4 h-4" />
                          </div>

                          {/* Assessment content */}
                          <div className="max-w-3xl">
                            <Card className="bg-green-900/20 border-green-700/50 text-gray-100 p-4">
                              <div className="space-y-3">
                                {/* Header with trait name and scores */}
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant="outline"
                                    className="border-green-600 text-green-300"
                                  >
                                    {getTraitDisplayName(trait.trait)}{" "}
                                    Assessment
                                  </Badge>
                                  <div className="flex space-x-2">
                                    {/* Show score if available */}
                                    {trait.score !== undefined && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-800 text-green-200"
                                      >
                                        Score: {trait.score}/5
                                      </Badge>
                                    )}
                                    {/* Show confidence if available */}
                                    {trait.confidence !== undefined && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-800 text-green-200"
                                      >
                                        Confidence: {trait.confidence}/10
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Assessment content */}
                                <div className="space-y-2">
                                  {/* Assessment description */}
                                  {trait.sentence && (
                                    <div>
                                      <p className="text-xs text-green-400 font-medium mb-1">
                                        Assessment:
                                      </p>
                                      <p className="text-sm text-green-200">
                                        {trait.sentence}
                                      </p>
                                    </div>
                                  )}

                                  {/* Assessment rationale */}
                                  {trait.rationale && (
                                    <div>
                                      <p className="text-xs text-green-400 font-medium mb-1">
                                        Rationale:
                                      </p>
                                      <p className="text-xs text-green-300 italic">
                                        {trait.rationale}
                                      </p>
                                    </div>
                                  )}

                                  {/* Current priority and iteration info */}
                                  <div className="pt-2 border-t border-green-700/30">
                                    <p className="text-xs text-green-400">
                                      Current Priority:{" "}
                                      <span className="text-green-300">
                                        {chatState.currentPriority
                                          ? getTraitDisplayName(
                                              chatState.currentPriority
                                            )
                                          : "N/A"}
                                      </span>
                                      {chatState.currentIteration !==
                                        undefined && (
                                        <span className="ml-2">
                                          • Iteration:{" "}
                                          {chatState.currentIteration}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <Card className="bg-gray-800 text-gray-100 p-4">
                <div className="flex space-x-1">
                  {/* Animated dots for loading */}
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Input Section */}
        {!isTerminated && (
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              disabled={isLoading || !shouldContinue || isTerminated}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || !shouldContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
        )}
      </div>
         {/* Ending the chats after generating persona */}
      {isTerminated && (
        <div style={{ display: "flex",justifyContent: "center",alignItems: "center",height: "6vh"}}>
        <h1 className="text-xl font-semibold">
          Thank You for Trying our chatbot!!
        </h1>
        </div>
      )}

      {/* Floating Generate Persona Button */}
      {chatState.backendState && (
        <Button
          onClick={generatePersona}
          disabled={isGeneratingPersona || latestScores.length < 1}
          className="fixed bottom-20 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg z-50"
        >
          {isGeneratingPersona ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Generate Persona</span>
          )}
        </Button>
      )}

      {/* Persona Popup Modal */}
      {showPersonaPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Popup Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <UserCircle className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">
                  Financial Persona
                </h2>
              </div>
              <Button
                onClick={() => setShowPersonaPopup(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Popup Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {personaData ? (
                <div className="space-y-4">
                  <Card className="bg-gray-900/50 border-gray-700 p-4">
                    <pre className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
                      {personaData}
                    </pre>
                  </Card>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <UserCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No persona data available</p>
                </div>
              )}
            </div>

            {/* Popup Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <Button
                onClick={() => setShowPersonaPopup(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
