"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { generateResponse } from "@/ai/flows/generate-response";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import './global.css';

const mockUserAvatar = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Callie';
const mockAiAvatar = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Snowball';

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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const maxInputLength = 500;

  useEffect(() => {
    // Scroll to bottom on new messages
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
    const userMessage: Message = { id: uuidv4(), sender: 'User', content: input, timestamp, status: 'sent' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setCharacterCount(0);
    setIsTyping(true);

    try {
      // Simulate realistic response times
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      const aiResponse = await generateResponse({ query: input });

      if (aiResponse && aiResponse.response) {
        const timestamp = formatTimestamp(new Date());
        const aiMessage: Message = { id: uuidv4(), sender: 'AI', content: aiResponse.response, timestamp };
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
    setIsDarkMode(prevMode => !prevMode);
    // Apply dark mode class to the document body for theming
    document.body.classList.toggle('dark', !isDarkMode);
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col rounded-lg shadow-lg overflow-hidden w-3/4 h-screen">
        <Card className="mb-4 rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <h1 className="text-xl font-semibold">EduChat AI</h1>
            <div className="space-x-2">
              <Icons.sun className="h-4 w-4" />
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              <Icons.moon className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>

        <Card className="flex-1 overflow-hidden rounded-none">
          <CardContent className="h-full flex flex-col p-0">
            <ScrollArea className="flex-1 h-full px-4">
              <div className="flex flex-col gap-2 py-4">
                {messages.map((message, index) => (
                  <div key={message.id} className={`flex items-end ${message.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                    {message.sender === 'AI' && (
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={mockAiAvatar} alt="AI Avatar" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "rounded-md py-2 px-3 text-sm max-w-[75%]",
                      message.sender === 'User' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                    )}>
                      <p className="text-sm break-words">{message.content}</p>
                      <div className="flex items-center justify-end text-xs mt-1">
                        <span className="text-muted-foreground">{message.timestamp}</span>
                        {message.sender === 'User' && message.status && getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                    {message.sender === 'User' && (
                      <Avatar className="w-8 h-8 ml-2">
                        <AvatarImage src={mockUserAvatar} alt="User Avatar" />
                        <AvatarFallback>User</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="text-left italic">
                    AI is typing...
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            </ScrollArea>

            <div className="p-4 pt-2 border-t">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Enter your message..."
                  className="w-full rounded-md pr-12 resize-none"
                />
                <span className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                  {characterCount}/{maxInputLength}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Button onClick={sendMessage} disabled={isTyping} className="ml-auto">
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
