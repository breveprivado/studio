"use client";

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { Swords, Upload, X, Trash2, Image as ImageIcon, Bot, Send, Loader2 } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { type TournamentPost } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { tournamentChat } from '@/ai/flows/tournament-chat-flow';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const ChatPanel = ({ post, onNewMessage }: { post: TournamentPost, onNewMessage: (postId: string, updatedHistory: TournamentPost['chatHistory']) => void }) => {
    const [isPending, startTransition] = useTransition();
    const [userMessage, setUserMessage] = useState('');
    const chatHistory = post.chatHistory || [];

    const handleSendMessage = () => {
        if (!userMessage.trim()) return;

        const newUserMessage = { role: 'user' as const, content: userMessage };
        const updatedHistory = [...chatHistory, newUserMessage];

        onNewMessage(post.id, updatedHistory);
        setUserMessage('');
        
        startTransition(async () => {
            try {
                const response = await tournamentChat({
                    postText: post.text,
                    postImage: post.imageUrl,
                    chatHistory: updatedHistory,
                });
                const modelResponse = { role: 'model' as const, content: response };
                onNewMessage(post.id, [...updatedHistory, modelResponse]);
            } catch (error) {
                console.error("Error calling AI chat flow:", error);
                const errorResponse = { role: 'model' as const, content: "Lo siento, he tenido un problema al procesar tu solicitud. Inténtalo de nuevo." };
                onNewMessage(post.id, [...updatedHistory, errorResponse]);
            }
        });
    };

    return (
        <CardFooter className="flex flex-col items-start gap-4 pt-4 border-t">
            <div className="w-full space-y-4 max-h-64 overflow-y-auto pr-2">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                         {msg.role === 'model' && (
                             <Avatar className="w-8 h-8">
                                <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                             </Avatar>
                         )}
                        <div className={cn("rounded-lg p-3 text-sm max-w-[80%]", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                 {isPending && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 text-sm bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin"/>
                        </div>
                    </div>
                 )}
            </div>
            <div className="w-full flex items-center gap-2">
                <Input 
                    placeholder="Escribe tu mensaje a la IA..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isPending}
                />
                <Button onClick={handleSendMessage} disabled={isPending || !userMessage.trim()}>
                    <Send className="h-4 w-4"/>
                </Button>
            </div>
        </CardFooter>
    )
}

const TorneosPage = () => {
  const [posts, setPosts] = useState<TournamentPost[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedPosts = localStorage.getItem('tournamentPosts');
    if (storedPosts) {
      try {
        setPosts(JSON.parse(storedPosts));
      } catch (e) {
        setPosts([]);
      }
    }

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setNewPostImage(reader.result as string);
               toast({
                title: 'Imagen Pegada',
                description: 'La imagen de tu portapapeles ha sido añadida.',
              });
            };
            reader.readAsDataURL(file);
          }
          event.preventDefault();
          return;
        }
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };

  }, [toast]);

  useEffect(() => {
    localStorage.setItem('tournamentPosts', JSON.stringify(posts));
  }, [posts]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = () => {
    if (!newPostText && !newPostImage) {
      toast({
        variant: 'destructive',
        title: 'Entrada vacía',
        description: 'Debes añadir texto o una imagen para publicar.',
      });
      return;
    }

    const newPost: TournamentPost = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      text: newPostText,
      imageUrl: newPostImage,
      chatHistory: [],
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);

    setNewPostText('');
    setNewPostImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }

    toast({
      title: '¡Publicación Creada!',
      description: 'Tu entrada en el torneo ha sido registrada.',
    });
  };

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
     toast({
      title: 'Publicación Eliminada',
      variant: 'destructive'
    });
  }

  const handleNewChatMessage = (postId: string, updatedHistory: TournamentPost['chatHistory']) => {
    setPosts(prevPosts => 
        prevPosts.map(p => 
            p.id === postId ? { ...p, chatHistory: updatedHistory } : p
        )
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <SidebarTrigger className="md:hidden"/>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Swords className="h-8 w-8 mr-3 text-yellow-500" />
              Torneos de Trading
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Documenta, compara y analiza tus torneos con la ayuda de una IA.</p>
          </div>
        </div>
      </header>
      
      <main className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Crear Nueva Publicación</CardTitle>
                <CardDescription>Añade texto y una imagen para crear una nueva entrada en tu bitácora de torneo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Escribe aquí tu análisis o comentario..."
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    rows={4}
                />
                {newPostImage && (
                    <div className="relative">
                        <Image src={newPostImage} alt="Vista previa" width={500} height={300} className="rounded-lg object-contain w-full h-auto" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => setNewPostImage(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        {newPostImage ? 'Cambiar Imagen' : 'Subir Imagen'}
                    </Button>
                    <Button onClick={handleCreatePost}>
                        Publicar
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Muro del Torneo</h2>
            {posts.length > 0 ? (
                posts.map(post => (
                    <Collapsible key={post.id} asChild>
                      <Card>
                          <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                  <p className="text-sm text-muted-foreground mb-4">{format(new Date(post.date), "PPPp", { locale: es })}</p>
                                  <div className="flex items-center gap-2">
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Bot className="h-4 w-4"/>
                                            <span className="sr-only">Chatear con IA</span>
                                        </Button>
                                    </CollapsibleTrigger>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar Publicación?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                Esta acción es irreversible y eliminará la publicación de tu muro.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                              </div>
                            
                              {post.imageUrl && (
                                  <div className="mb-4">
                                      <Image src={post.imageUrl} alt="Publicación de torneo" width={800} height={500} className="rounded-lg object-contain w-full h-auto" />
                                  </div>
                              )}
                              {post.text && (
                                  <p className="text-foreground whitespace-pre-wrap">{post.text}</p>
                              )}
                          </CardContent>
                           <CollapsibleContent>
                                <ChatPanel post={post} onNewMessage={handleNewChatMessage}/>
                           </CollapsibleContent>
                      </Card>
                    </Collapsible>
                ))
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No hay publicaciones todavía</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Empieza por crear tu primera entrada.</p>
                </div>
            )}
        </div>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};

export default TorneosPage;
