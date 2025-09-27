import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";

import {
  setCallStatus,
  setOffer,
  setAnswer,
  setPeerId,
  setRemotePeerId,
  clearVideoCall,
  addIceCandidate,
} from "../../redux/slices/videoSlice";
import ChatRoom from "./ChatRoom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import bookedSocket from "../../socket/bookedSocket";
import { CameraIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import {
  CameraIcon as CameraSolidIcon,
  MicrophoneIcon as MicrophoneSolidIcon,
} from "@heroicons/react/24/solid";

export default function VideoCall({ roomId, user, booking }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { callStatus, offer, answer, peerId, remotePeerId, iceCandidates } = useSelector(
    (state) => state.video
  );
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLocalStreamReady, setIsLocalStreamReady] = useState(false);

  useEffect(() => {
    if (!user?._id || !booking) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (myVideo.current) myVideo.current.srcObject = stream;
        setIsLocalStreamReady(true);
        dispatch(setCallStatus("ready"));
      })
      .catch((err) => {
        console.error("Failed to get media:", err);
        toast.error("Failed to access camera and microphone.");
      });

    const handleIncomingCall = ({ signal, from, bookingId }) => {
      if (bookingId === booking._id) {
        dispatch(setCallStatus("receiving"));
        dispatch(setRemotePeerId(from));
        dispatch(setOffer(signal));
        toast.info("Incoming video call from the other party!");
      }
    };

    const handleCallAccepted = (signal) => {
      dispatch(setAnswer(signal));
      dispatch(setCallStatus("connected"));
      connectionRef.current.signal(signal);
    };

    const handleIceCandidate = (candidate) => {
      dispatch(addIceCandidate(candidate));
    };

    const handleCallEnded = () => {
      toast.info("The video call has ended.");
      if (connectionRef.current) connectionRef.current.destroy();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
      if (remoteStreamRef.current) remoteStreamRef.current.getTracks().forEach(track => track.stop());
      dispatch(clearVideoCall());
    };

    bookedSocket.on("incomingCall", handleIncomingCall);
    bookedSocket.on("callAccepted", handleCallAccepted);
    bookedSocket.on("iceCandidate", handleIceCandidate);
    bookedSocket.on("callEnded", handleCallEnded);

    return () => {
      bookedSocket.off("incomingCall", handleIncomingCall);
      bookedSocket.off("callAccepted", handleCallAccepted);
      bookedSocket.off("iceCandidate", handleIceCandidate);
      bookedSocket.off("callEnded", handleCallEnded);
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      if (remoteStreamRef.current) remoteStreamRef.current.getTracks().forEach(t => t.stop());
      dispatch(clearVideoCall());
    };
  }, [roomId, user, booking, dispatch]);

  useEffect(() => {
    if (!isLocalStreamReady) return;

    const createPeer = (initiator) => {
      const peer = new Peer({ initiator, trickle: false, stream: localStreamRef.current });

      peer.on("signal", (signalData) => {
        if (initiator) {
          dispatch(setOffer(signalData));
        } else {
          dispatch(setAnswer(signalData));
          bookedSocket.emit("acceptCall", { to: remotePeerId, signal: signalData });
        }
      });

      peer.on("stream", (stream) => {
        remoteStreamRef.current = stream;
        if (userVideo.current) userVideo.current.srcObject = stream;
      });

      peer.on("close", () => {
        console.log("Peer connection closed");
        dispatch(clearVideoCall());
        navigate("/dashboard");
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err);
        dispatch(clearVideoCall());
        toast.error("Video call error. Ending session.");
      });

      connectionRef.current = peer;
    };

    if (callStatus === "ready" && remotePeerId) {
      createPeer(true);
      bookedSocket.emit("callUser", {
        userToCall: remotePeerId,
        signalData: offer,
        from: user._id,
        bookingId: booking._id,
      });
    }

    if (callStatus === "receiving" && offer) {
      createPeer(false);
      connectionRef.current.signal(offer);
    }

    if (callStatus === "connected" && connectionRef.current) {
      iceCandidates.forEach(candidate => connectionRef.current.signal(candidate));
      dispatch(addIceCandidate(null));
    }
  }, [callStatus, isLocalStreamReady, offer, remotePeerId, user, booking, dispatch, iceCandidates]);

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleMicrophone = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  return (
  <div className="flex flex-col md:flex-row h-screen w-full gap-2 p-2 md:p-4 bg-gray-100 dark:bg-gray-800">
    {/* Video Section */}
    <div className="flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-xl p-2 md:p-4 flex-[2] min-h-[300px] md:min-h-[500px]">
      <div className="flex flex-col w-full h-full gap-2">
        {/* Local Video */}
        <div className="relative w-full h-1/2">
          <video
            ref={myVideo}
            playsInline
            muted
            autoPlay
            className="w-full h-full rounded-lg bg-black object-cover"
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-2 py-1 rounded-full shadow-lg">
            <button
              onClick={toggleCamera}
              className="p-2 rounded-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-200 transition"
            >
              {isCameraOn ? <CameraSolidIcon className="h-5 w-5" /> : <CameraIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleMicrophone}
              className="p-2 rounded-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-200 transition"
            >
              {isMicOn ? <MicrophoneSolidIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative w-full h-1/2">
          <video
            ref={userVideo}
            playsInline
            autoPlay
            className="w-full h-full rounded-lg bg-black object-cover"
          />
        </div>
      </div>
    </div>

    {/* Chat Section */}
    <div className="flex-1 md:flex-[1] min-h-[200px] md:min-h-[500px]">
      <ChatRoom roomId={roomId} user={user} booking={booking} />
    </div>
  </div>
);
}