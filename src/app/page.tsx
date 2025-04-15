"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { generateResponse } from "@/ai/flows/generate-response";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';
import './global.css';
import { Sun, Moon } from 'lucide-react';

// Avatar URLs
const userAvatar = 'https://cdn.pixabay.com/photo/2021/11/24/05/19/user-6820232_1280.png';
const aiAvatar = 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg';

interface Message {
  id: string;
  sender: 'User' | 'AI';
  content: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TypingIndicator = () => {
  return (
    <div className="flex items-center">
      <Avatar className="w-8 h-8 mr-2">
        <AvatarImage src={aiAvatar} alt="AI Avatar" className="avatar-image" />
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="typing-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const maxInputLength = 500;

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    // Check if there's a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    } else {
      // If no saved preference, check system preference
      const prefersDark = window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDark) {
        setIsDarkMode(true);
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.setItem('theme', 'light');
      }
    }
    
    // Scroll to bottom on initial load
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxInputLength) {
      setInput(value);
      setCharacterCount(value.length);
    } else {
      toast({
        title: "Character Limit Exceeded",
        description: `You have reached the maximum character limit of ${maxInputLength}.`,
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const timestamp = formatTimestamp(new Date());
    const userMessage: Message = { 
      id: uuidv4(), 
      sender: 'User', 
      content: input, 
      timestamp, 
      status: 'sent' 
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setCharacterCount(0);
    setIsTyping(true);

    try {
      // Simulate realistic response times
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      const aiResponse = await generateResponse({ query: input });

      if (aiResponse && aiResponse.response) {
        const timestamp = formatTimestamp(new Date());
        const aiMessage: Message = { 
          id: uuidv4(), 
          sender: 'AI', 
          content: aiResponse.response, 
          timestamp 
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } else {
        toast({
          title: "AI Response Error",
          description: "Failed to generate a response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("AI Response Error:", error);
      toast({
        title: "AI Response Error",
        description: "An unexpected error occurred. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Apply dark mode class to the document body for theming
    document.body.classList.toggle('dark', newMode);
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Icons.check className="h-3 w-3 ml-1 text-muted-foreground" />;
      case 'delivered':
        return <Icons.doubleCheck className="h-3 w-3 ml-1 text-muted-foreground" />;
      case 'read':
        return <Icons.doubleCheck className="h-3 w-3 ml-1 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className={`main-background ${isDarkMode ? 'dark' : ''}`}>
      <div className="chat-container">
        {/* Compact Header */}
        <Card className="rounded-lg glassmorphism chat-header">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 compact-header">
            <div className="flex items-center">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarImage src={aiAvatar} alt="AI Avatar" className="avatar-image" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-semibold">Adi's Chatbot</h1>
            </div>
            <div className="space-x-2 flex items-center">
              {isDarkMode ? (
                <>
                  <Moon className="h-4 w-4" />
                  <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Chat Content Area */}
        <Card className="flex-1 overflow-hidden rounded-lg glassmorphism shadow-xl chat-content">
          <CardContent className="h-full flex flex-col p-0">
            <ScrollArea className="flex-1 h-full px-4 scroll-area">
              <div className="flex flex-col gap-2 py-4">
                {messages.length === 0 && (
                  <div className="welcome-message">
                    <div className="centered-text">
                      Welcome to the digital realm crafted by Aditya Mishra. This conversational companion harnesses the power of Gemini API to bring thoughts to life. What shall we discuss today?
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start ${message.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender === 'AI' && (
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={aiAvatar} alt="AI Avatar" className="avatar-image" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "rounded-xl py-2 px-3 text-sm max-w-[75%] break-words",
                      message.sender === 'User'
                        ? 'bg-[hsl(var(--message-user-bg))] text-[hsl(var(--message-user-text))]'
                        : 'bg-[hsl(var(--message-ai-bg))] text-[hsl(var(--message-ai-text))]',
                      'shadow-[var(--message-box-shadow)] glassmorphism'
                    )}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end text-xs mt-1">
                        <span className="text-muted-foreground">{message.timestamp}</span>
                        {message.sender === 'User' && message.status && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                    {message.sender === 'User' && (
                      <Avatar className="w-8 h-8 ml-2">
                        <AvatarImage src={userAvatar} alt="User Avatar" className="avatar-image" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <TypingIndicator />
                )}
                <div ref={chatBottomRef} />
              </div>
            </ScrollArea>

            {/* Compact Input Area */}
            <div className="p-2 border-t message-typing-area compact-input">
              <div className="relative flex items-center">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full rounded-md pr-12 resize-none glassmorphism message-input-area"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isTyping || input.trim().length === 0}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 send-button"
                >
                  <Icons.arrowRight className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
                <span className="absolute right-3 bottom-1 text-xs text-muted-foreground">
                  {characterCount}/{maxInputLength}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
