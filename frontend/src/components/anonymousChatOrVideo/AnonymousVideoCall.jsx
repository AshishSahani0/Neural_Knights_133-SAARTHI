import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { toast } from "react-toastify";
import { CameraIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import {
  CameraIcon as CameraSolidIcon,
  MicrophoneIcon as MicrophoneSolidIcon,
} from "@heroicons/react/24/solid";

export default function AnonymousVideoCall({ roomId, userId, socket }) {
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const localStreamRef = useRef(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const setupStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;

        stream.getVideoTracks().forEach((track) => (track.enabled = false));
        stream.getAudioTracks().forEach((track) => (track.enabled = false));

        if (myVideo.current) myVideo.current.srcObject = stream;
        socket.emit("joinAnonymousVideoRoom", { roomId, userId });
      } catch (err) {
        console.error("Cannot access camera/mic:", err);
        toast.error("Cannot access camera/microphone. Check permissions.");
      }
    };

    setupStream();

    const handleIncomingCall = ({ signal, callerId }) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: localStreamRef.current,
      });
      peer.signal(signal);

      peer.on("signal", (signalData) => {
        socket.emit("anonymousAcceptCall", { signal: signalData, to: callerId });
      });

      peer.on("stream", (remoteStream) => {
        if (userVideo.current) userVideo.current.srcObject = remoteStream;
        toast.success("Video call connected!");
      });

      connectionRef.current = peer;
    };

    const handleCallAccepted = (signal) => {
      connectionRef.current?.signal(signal);
      toast.success("Video call connected!");
    };

    const handleCallEnded = () => {
      if (connectionRef.current) connectionRef.current.destroy();
      toast.info("Video call ended.");
      connectionRef.current = null;
      if (userVideo.current) userVideo.current.srcObject = null;
    };

    const handlePartnerDisconnected = () => {
      handleCallEnded();
      toast.info("Partner disconnected. Video call reset.");
    };

    socket.on("anonymousIncomingCall", handleIncomingCall);
    socket.on("anonymousCallAccepted", handleCallAccepted);
    socket.on("anonymousCallEnded", handleCallEnded);
    socket.on("partnerDisconnected", handlePartnerDisconnected);

    return () => {
      connectionRef.current?.destroy();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());

      socket.off("anonymousIncomingCall", handleIncomingCall);
      socket.off("anonymousCallAccepted", handleCallAccepted);
      socket.off("anonymousCallEnded", handleCallEnded);
      socket.off("partnerDisconnected", handlePartnerDisconnected);
    };
  }, [roomId, userId, socket]);

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
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col gap-4 flex-1">
        <div className="relative w-full h-1/2 min-h-[150px]">
          <video
            ref={myVideo}
            playsInline
            muted
            autoPlay
            className="w-full h-full rounded-lg bg-black object-cover"
          />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 bg-black/40 px-4 py-2 rounded-full shadow-lg">
            <button
              onClick={toggleCamera}
              className="p-2 rounded-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-200 transition"
            >
              {isCameraOn ? <CameraSolidIcon className="h-6 w-6" /> : <CameraIcon className="h-6 w-6" />}
            </button>
            <button
              onClick={toggleMicrophone}
              className="p-2 rounded-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-200 transition"
            >
              {isMicOn ? <MicrophoneSolidIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="relative w-full h-1/2 min-h-[150px]">
          <video
            ref={userVideo}
            playsInline
            autoPlay
            className="w-full h-full rounded-lg bg-black object-cover"
          />
        </div>
      </div>
    </div>
  );
}
