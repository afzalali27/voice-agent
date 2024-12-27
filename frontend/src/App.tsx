import React, { useState } from "react";
import 'regenerator-runtime'
import axios from "axios";
import { useSpeechRecognition } from "react-speech-recognition";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const handleTextSubmit = async () => {
    if (!userInput.trim()) {
      toast.error("Please enter some text.");
      return;
    }
    try {
      const res = await axios.post(`http://127.0.0.1:8000/process-input/?text_input=${userInput}`);
      setResponse(res.data.response);
    } catch (error) {
      console.error(error);
      toast.error("Error processing your request.");
    }
  };

  const handleVoiceSubmit = async () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser does not support speech recognition.");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/process-input/", {
        text_input: transcript,
      });
      setResponse(res.data.response);
      resetTranscript();
    } catch (error) {
      console.error(error);
      toast.error("Error processing your request.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Voice Agent</h1>
      <div style={{ marginBottom: "20px" }}>
        <textarea
          rows={4}
          placeholder="Type your query here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />
        <button onClick={handleTextSubmit} style={{ marginTop: "10px" }}>
          Submit Text
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p>Use your voice:</p>
        <button onClick={handleVoiceSubmit}>Submit Voice</button>
        <p>{transcript}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Response:</h3>
        <p>{response}</p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
