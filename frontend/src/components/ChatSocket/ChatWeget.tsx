/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { FloatButton, Drawer, List, Input, Button, Typography } from "antd";
import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/ThemeContext";
import socket from "./socket";
import type { Message } from "../../models/locationInterface";

const { Text } = Typography;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const { id } = useAuth();

  // 🔹 Connect socket 1 lần khi user có id
  useEffect(() => {
    if (!id) return;

    socket.connect();

    const handleChatHistory = (values: any) => {
      console.log("values", values);
      localStorage.setItem("idChatAdmin", values.id);
      const msgs = Array.isArray(values) ? values : values?.messages || [];
      setMessages(msgs);
    };

    const handleNewMessage = (msg: Message) => {
      console.log("msg", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chatHistory", handleChatHistory);
    socket.on("newMessage", handleNewMessage);

    // cleanup khi logout hoặc component unmount
    return () => {
      socket.off("chatHistory", handleChatHistory);
      socket.off("newMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [id]);

  // 🔹 Khi Drawer mở, chỉ emit để lấy lịch sử chat
  useEffect(() => {
    if (open && id) {
      socket.emit("chatWithAdmin", id);
    }
  }, [open, id]);

  const handleSend = () => {
    if (!message.trim() || !id) return;
    const idChatAdmin = localStorage.getItem("idChatAdmin");
    socket.emit("sendMessage", {
      roomId: idChatAdmin,
      senderId: id,
      text: message.trim(),
    });
    setMessage("");
  };

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      />

      <Drawer
        title="💬 Chat với Admin"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={350}
      >
        <div style={{ height: "60vh", display: "flex", flexDirection: "column" }}>
          <List
            dataSource={messages}
            renderItem={(msg) => (
              <List.Item
                key={msg.id}
                style={{
                  justifyContent:
                    msg.senderId === id ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background:
                      msg.senderId === id ? "#1677ff" : "#f0f0f0",
                    color: msg.senderId === id ? "#fff" : "#000",
                    padding: "8px 12px",
                    borderRadius: 12,
                    maxWidth: "70%",
                    wordBreak: "break-word",
                  }}
                >
                  <Text>{msg.text}</Text>
                </div>
              </List.Item>
            )}
          />

          <div style={{ display: "flex", marginTop: "auto", gap: 8 }}>
            <Input.TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={1}
              placeholder="Nhập tin nhắn..."
              onPressEnter={(e) => {
                e.preventDefault();
                handleSend();
              }}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} />
          </div>
        </div>
      </Drawer>
    </>
  );
}
