import { useEffect } from "react";

export default function ChatlingBot() {
  useEffect(() => {
    // Prevent adding the script multiple times
    if (document.getElementById("chtl-script")) return;

    // Add configuration script
    const configScript = document.createElement("script");
    configScript.type = "text/javascript";
    configScript.text = `window.chtlConfig = { chatbotId: "7397249118" };`;
    document.body.appendChild(configScript);

    // Add Chatling embed script
    const chatScript = document.createElement("script");
    chatScript.id = "chtl-script";
    chatScript.type = "text/javascript";
    chatScript.async = true;
    chatScript.setAttribute("data-id", "7397249118");
    chatScript.src = "https://chatling.ai/js/embed.js";
    document.body.appendChild(chatScript);
  }, []);

  return null; // No visible UI
}
