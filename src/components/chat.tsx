"use client"
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr"
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendHorizonal, Send, Download } from "lucide-react"
import { getLanguage } from "../lib/language"

const SUGGESTIONS_EN = [
  "who is vinicius?",
  "tell me about your experiences",
  "what are your skills?",
  "what technologies do you work with?",
  "what are your main projects?"
]

const SUGGESTIONS_PT = [
  "quem é o vinicius?",
  "conte sobre suas experiências profissionais",
  "quais são suas habilidades?",
  "quais tecnologias você usa?",
  "quais são seus principais projetos?"
]

type LangKey = 'en' | 'pt-BR'

type Locale = {
  suggestions: string[]
  helper: string
  placeholderPrefix: string
  clear: string
  sendHint: string
}

const LOCALES: Record<LangKey, Locale> = {
  en: {
    suggestions: SUGGESTIONS_EN,
    helper: 'Ask something about Vinicius',
    placeholderPrefix: 'Try asking: ',
    clear: 'Clear chat',
    sendHint: 'Press Enter to send'
  },
  'pt-BR': {
    suggestions: SUGGESTIONS_PT,
    helper: 'Pergunte algo sobre o Vinicius',
    placeholderPrefix: 'Tente: ',
    clear: 'Limpar chat',
    sendHint: 'Enter para enviar'
  }
}

export default function ChatWidget() {
  const pathname = usePathname()
  // show chat only on homepage
  if (pathname !== "/") return null
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [lang, setLang] = useState(getLanguage())
  const rootRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const connectionRef = useRef<HubConnection | null>(null)
  const [loadingBot, setLoadingBot] = useState(false);

  const removeLoadingBot = useCallback(() => {
    if(loadingBot){
      messages[messages.length - 1] = messages[messages.length - 1].replace('.', ''); // remove os pontos de loading
      setMessages([...messages]);
    }
    setLoadingBot(false);
  }, [loadingBot]);

  const sendMessage = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, `you::${input}`, `bot::`]); // adiciona placeholder
        setLoadingBot(true);
        connectionRef.current?.invoke("SendMessage", input, getLanguage() == 'pt-BR');
        setInput("");
    };
    useEffect(() => {
        if (!loadingBot) return;

        let count = 0;
        const interval = setInterval(() => {
            setMessages(prev => {
                const last = prev[prev.length - 1] || "";
                if (last.startsWith("bot::")) {
                    const dots = ".".repeat((count % 3) + 1);
                    const newText = `bot::${dots}`;
                    count++;
                    return [...prev.slice(0, -1), newText];
                }
                return prev;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [loadingBot]);
    useEffect(() => {
        const conn = new HubConnectionBuilder()
            .withUrl("https://chatbotresume.viniverse.dev/chat")
            .withAutomaticReconnect()
            .build()

        connectionRef.current = conn

        conn.start().catch(err => console.error("SignalR connection error:", err))

        conn.on("ReceiveMessage", (message: string) => {
            removeLoadingBot();
            setMessages(prev => {
                const last = prev[prev.length - 1] || "";
                if (last.startsWith("bot::")) 
                    return [...prev.slice(0, -1), last + message];                
                return [...prev, `bot::${message}`];
            });
        })
        return () => {
            conn.stop()
        }
    }, [removeLoadingBot])

  const clearChat = () => {
    setMessages([])
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    function onLang(e: Event) {
      // @ts-ignore
      const l = e?.detail?.language || getLanguage()
      setLang(l)
    }
    window.addEventListener('app:language-changed', onLang as EventListener)
    return () => window.removeEventListener('app:language-changed', onLang as EventListener)
  }, [])

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

  return (
    <div className="h-full">
      <Card className="w-full h-full flex flex-col shadow-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-700">
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div ref={scrollRef} className="flex flex-col gap-3 p-4">
                {messages.map((msg, idx) => {
                  // message format: "role::text"
                  const [role, ...rest] = msg.split('::')
                  const text = rest.join('::')
                  const isYou = role === 'you'
                  return (
                    <div key={idx} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] text-sm px-3 py-2 rounded break-words ${isYou ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'}`}>
                        {text}
                      </div>
                    </div>
                  )
                })}
                <div ref={scrollRef} />
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* helper text and suggestions when no messages */}
          {messages.length === 0 && (
            <div className="px-4 space-y-4 py-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {LOCALES[lang].helper}
              </p>
              <div className="flex flex-wrap gap-2">
                {LOCALES[lang].suggestions.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="text-sm px-3 py-1.5 rounded bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 p-4 border-t dark:border-zinc-800">
            <div className="flex justify-between items-center ">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearChat}
                className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                disabled={messages.length === 0}
              >
                {lang === 'pt-BR' ? 'Limpar chat' : 'Clear chat'}
              </Button>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                {lang === 'pt-BR' ? 'Pressione enter para enviar' : 'Press Enter to send'}
              </p>
            </div>
            <div className="flex gap-2">
              <Textarea
                className="flex-1 resize-none bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100"
                value={input}
                placeholder={messages.length === 0 ? LOCALES[lang].placeholderPrefix + LOCALES[lang].suggestions[0] : (lang === 'pt-BR' ? 'Digite sua mensagem...' : 'Type your message...')}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              />
              <Button aria-label="Send message" className="dark:bg-zinc-800 dark:text-zinc-100" onClick={sendMessage}>
                <SendHorizonal strokeWidth={1.4} className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>      
    </div>
  )
}
