import React, { useState } from "react";
import "regenerator-runtime/runtime";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { debounce } from "lodash";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleApiRequest = async (input: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/process-input?text_input=${encodeURIComponent(input)}`);
      if (res.data && res.data.response) {
        setResponse(res.data.response);
        // playAudio(res.data.response);
      } else {
        throw new Error("Invalid response format.");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleTextSubmit = () => {
    if (!userInput.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    handleApiRequest(userInput);
  };

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser does not support speech recognition.");
      return;
    }
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };

  const stopListening = debounce(() => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      handleApiRequest(transcript);
      resetTranscript();
    } else {
      toast.error("No voice input detected. Please try again.");
    }
  }, 500);

  const playAudio = (text: string) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Voice Agent</h1>

      {/* Text Input Section */}
      <div style={{ marginBottom: "20px" }}>
        <textarea
          rows={4}
          placeholder="Type your query here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />
        <button
          onClick={handleTextSubmit}
          style={{ marginTop: "10px" }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit Text"}
        </button>
      </div>

      {/* Voice Input Section */}
      <div style={{ marginBottom: "20px" }}>
        <p>Microphone: {listening ? "ON" : "OFF"}</p>
        <button onClick={startListening} style={{ marginRight: "10px" }} disabled={loading}>
          Start Listening
        </button>
        <button onClick={stopListening} disabled={loading}>
          Stop Listening
        </button>
      </div>

      {/* Transcript Display */}
      <div style={{ marginBottom: "20px" }}>
        <p>Transcript:</p>
        <textarea
          rows={4}
          value={transcript}
          placeholder="Your voice input will appear here..."
          readOnly
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      {/* Response Display */}
      <div style={{ marginTop: "20px" }}>
        <h3>Response:</h3>
        <p>{response}</p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
