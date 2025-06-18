
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getAvatarPublicUrl, uploadAvatar, updateProfile } from '@/features/profile/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Camera, Loader2 } from 'lucide-react';

interface AvatarUploaderProps {
  avatarUrl: string | null;
  fullName: string | null | undefined;
}

const AvatarUploader = ({ avatarUrl, fullName }: AvatarUploaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [displayUrl, setDisplayUrl] = useState<string | undefined>();

  useEffect(() => {
    if (avatarUrl) {
      if (avatarUrl.startsWith('http')) {
        setDisplayUrl(avatarUrl);
      } else {
        // It's a path from Supabase storage
        const publicUrl = getAvatarPublicUrl(avatarUrl);
        setDisplayUrl(publicUrl ?? undefined);
      }
    } else {
      setDisplayUrl(undefined);
    }
  }, [avatarUrl]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Usuário não autenticado.");
      const filePath = await uploadAvatar(user.id, file);
      // The public URL now comes from getAvatarPublicUrl
      await updateProfile({ id: user.id, avatar_url: filePath });
      return filePath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({ title: "Sucesso!", description: "Avatar atualizado." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: `Falha no upload: ${error.message}`, variant: "destructive" });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return <User className="h-12 w-12" />;
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-md">
          <AvatarImage src={displayUrl} alt="Avatar do usuário" />
          <AvatarFallback className="text-3xl">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
          {uploadMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
          <input id="avatar-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg" disabled={uploadMutation.isPending} />
        </label>
      </div>
    </div>
  );
};

export default AvatarUploader;
