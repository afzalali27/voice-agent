import React, { useCallback, useEffect, useState } from "react";
import "regenerator-runtime/runtime";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { debounce } from "lodash";
import "./App.css";
import { TailSpin } from "react-loader-spinner";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const handleApiRequest = useCallback(async (input: string) => {
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
  }, []);

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
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  };

  const stopListening = debounce(() => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
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


useEffect(() => {
  if (!listening || !transcript.trim()) return;

  if (silenceTimer) {
    clearTimeout(silenceTimer);
  }

  // Set a new timer for 2 seconds
  const timer = setTimeout(() => {
    SpeechRecognition.stopListening();
    handleApiRequest(transcript);
    resetTranscript();
  }, 2000);

  setSilenceTimer(timer);

  return () => {
    clearTimeout(timer);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [transcript, listening]);

  return (
    <div className="app-container">
      <h1 className="app-title">Voice Agent</h1>

      {/* Text Input Section */}
      <div className="input-section">
        <textarea
          rows={4}
          placeholder="Type your query here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="text-input"
        />
        <button onClick={handleTextSubmit} className="submit-button" disabled={loading}>
          {loading ? <TailSpin height="20" width="20" color="#fff" ariaLabel="loading" />: "Submit"}
        </button>
      </div>

      {/* Voice Input Section */}
      <div className="voice-section">
        <div className={`mic-container ${listening ? "listening" : ""}`}>
          {listening && <div className="pulse"></div>}
        </div>
        {!listening ? <button onClick={startListening} className="mic-button" disabled={loading}>
          Start Listening
        </button> :
          <button onClick={stopListening} className="mic-button" disabled={loading}>
            Stop Listening
          </button>}
      </div>

      {/* Transcript Display */}
      <div className="transcript-section">
        <p>Transcript:</p>
        <textarea
          rows={4}
          value={transcript}
          placeholder="Your voice input will appear here..."
          readOnly
          className="transcript-input"
        />
      </div>

      {/* Response Display */}
      <div className="response-section">
        <h3>Response:</h3>
        <p>{response}</p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
