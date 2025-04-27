import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectHMSMessages,
  selectPeers,
  selectLocalPeer,
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
} from "@100mslive/react-sdk";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Settings,
  ChevronLeft,
  AlertCircle
} from "lucide-react";

const VideoRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const hmsActions = useHMSActions();
  const { user } = useSelector((state) => state.auth);
  
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const messages = useHMSStore(selectHMSMessages);

  const [roomConfig, setRoomConfig] = useState({
    name: "",
    token: "",
    isLoading: true,
    error: null
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);

  useEffect(() => {
    // Clean up the room connection when the component unmounts
    return () => {
      if (isConnected) {
        hmsActions.leave();
      }
    };
  }, [hmsActions, isConnected]);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        setRoomConfig({
          isLoading: false,
          error: "Session ID is missing"
        });
        return;
      }

      try {
        setRoomConfig(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Fetch session details from your backend
        const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch session details");
        }

        const sessionData = await response.json();
        
        if (!sessionData.data) {
          throw new Error("Invalid session data");
        }

        // Now get a token from your token endpoint (this should be implemented on your backend)
        const tokenResponse = await fetch(`http://localhost:5000/api/video/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            sessionId: sessionId,
            role: user.role, // 'student' or 'tutor'
            userId: user._id,
            name: user.name
          })
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to get video token");
        }

        const tokenData = await tokenResponse.json();
        
        setRoomConfig({
          isLoading: false,
          name: `${sessionData.data.subject} - ${new Date(sessionData.data.date).toLocaleDateString()}`,
          token: tokenData.token,
          error: null
        });

        // Join the room automatically
        joinRoom(tokenData.token);
      } catch (error) {
        console.error("Error setting up video room:", error);
        setRoomConfig({
          isLoading: false,
          error: error.message || "Failed to set up video room"
        });
      }
    };

    fetchSessionDetails();
  }, [sessionId, user, hmsActions]);

  // const joinRoom = async (token) => {
  //   try {
  //     await hmsActions.join({
  //       authToken: token,
  //       settings: {
  //         isAudioMuted: false,
  //         isVideoMuted: false
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error joining room:", error);
  //     setRoomConfig(prev => ({
  //       ...prev,
  //       error: "Failed to join video room: " + error.message
  //     }));
  //   }
  // };


  const joinRoom = async (token) => {
    try {
      console.log("Attempting to join room with token:", token.substring(0, 20) + "...");
      
      // Check if this is our mock token format
      if (token.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")) {
        console.log("Using mock token for development - creating simulated video room");
        
        // Create simulated peers for testing
        setTimeout(() => {
          // In a real implementation, we would connect to the HMS API
          console.log("Simulated room joined successfully");
          
          // Here you could add code to simulate a connected state if needed
        }, 1000);
        
        return;
      }
  
      // Real implementation for production use
      await hmsActions.join({
        authToken: token,
        settings: {
          isAudioMuted: false,
          isVideoMuted: false
        }
      });
    } catch (error) {
      console.error("Error joining room:", error);
      setRoomConfig(prev => ({
        ...prev,
        error: "Failed to join video room: " + error.message
      }));
    }
  };

  const toggleAudio = async () => {
    try {
      await hmsActions.setLocalAudioEnabled(!localAudioEnabled);
      setLocalAudioEnabled(!localAudioEnabled);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const toggleVideo = async () => {
    try {
      await hmsActions.setLocalVideoEnabled(!localVideoEnabled);
      setLocalVideoEnabled(!localVideoEnabled);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const leaveRoom = async () => {
    try {
      await hmsActions.leave();
      // Navigate back to meetings page based on role
      navigate(user.role === "tutor" ? "/tutor/meetings" : "/student/meetings");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await hmsActions.sendBroadcastMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (roomConfig.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (roomConfig.error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        
        <div className="bg-rose-50 text-rose-600 p-4 rounded-lg mb-4 flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p>{roomConfig.error}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Could not join video session</h2>
          <p className="text-gray-600 mb-4">
            There was a problem joining the video session. You can try again or contact support if the issue persists.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMockSession = roomConfig.token && roomConfig.token.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");

  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="mr-3 text-gray-600 hover:text-gray-900"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{roomConfig.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {isConnected ? "Connected" : "Connecting..."}
          </span>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setParticipantsOpen(!participantsOpen)}
          >
            <Users className="w-5 h-5 text-gray-700" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setChatOpen(!chatOpen)}
          >
            <MessageSquare className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden bg-gray-100">
        {/* Video grid */}
        <div className={`flex-1 p-4 ${chatOpen || participantsOpen ? 'lg:pr-80' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {peers.map((peer) => (
              <VideoTile key={peer.id} peer={peer} />
            ))}
          </div>
        </div>

        {/* Side panel (chat or participants) */}
        {(chatOpen || participantsOpen) && (
          <div className="w-full lg:w-80 bg-white border-l border-gray-200 flex flex-col h-full absolute lg:relative right-0 top-0 z-10" style={{ top: "57px", height: "calc(100% - 57px)" }}>
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-medium">
                {chatOpen ? "Chat" : "Participants"}
              </h2>
              <button
                onClick={() => {
                  setChatOpen(false);
                  setParticipantsOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {chatOpen && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <div key={index} className="break-words">
                          <span className="font-medium text-indigo-600">{msg.senderName}: </span>
                          <span>{msg.message}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center pt-8">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>
              )}

              {participantsOpen && (
                <div className="space-y-3">
                  {peers.map((peer) => (
                    <div key={peer.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-2">
                          {peer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{peer.name}</p>
                          <p className="text-xs text-gray-500">
                            {peer.roleName === "tutor" ? "Tutor" : "Student"}
                            {peer.isLocal ? " (You)" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!peer.isLocal && (
                          <>
                            {peer.audioEnabled ? (
                              <Mic className="w-4 h-4 text-gray-700" />
                            ) : (
                              <MicOff className="w-4 h-4 text-gray-400" />
                            )}
                            {peer.videoEnabled ? (
                              <Video className="w-4 h-4 text-gray-700" />
                            ) : (
                              <VideoOff className="w-4 h-4 text-gray-400" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/*todo: idk if it goes here */}
            {isMockSession ? "Mock Session Active" : (isConnected ? "Connected" : "Connecting...")}
            {/* Chat Input */}
            {chatOpen && (
              <div className="p-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendChatMessage();
                      }
                    }}
                  />
                  <button
                    onClick={sendChatMessage}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white border-t px-4 py-3 flex justify-center">
        <div className="flex space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              localAudioEnabled
                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            } transition-colors`}
          >
            {localAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              localVideoEnabled
                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            } transition-colors`}
          >
            {localVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={leaveRoom}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Video tile component for rendering individual participant videos
const VideoTile = ({ peer }) => {
  if (!peer) return null;

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden h-64 flex justify-center items-center">
      {peer.videoEnabled ? (
        <video
          ref={(node) => {
            if (node) {
              node.srcObject = peer.videoTrack;
              node.play().catch(error => console.error("Error playing video:", error));
            }
          }}
          autoPlay
          muted={peer.isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl font-semibold">{peer.name.charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-sm">{peer.name}</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-3 py-1 bg-black bg-opacity-60 text-white rounded-lg">
        <span className="text-sm truncate">
          {peer.name} {peer.isLocal && "(You)"}
        </span>
        <div className="flex space-x-2">
          {!peer.audioEnabled && <MicOff className="w-4 h-4 text-red-500" />}
          {!peer.videoEnabled && <VideoOff className="w-4 h-4 text-red-500" />}
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;