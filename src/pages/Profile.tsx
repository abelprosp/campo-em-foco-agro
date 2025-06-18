
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/features/profile/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Lock, Crown, Clock, Rocket } from "lucide-react";
import { useEffect } from "react";
import AvatarUploader from "@/features/profile/components/AvatarUploader";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, isFuture } from "date-fns";
import { Badge } from "@/components/ui/badge";

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "O nome completo é obrigatório." }),
  farmName: z.string().optional(),
});

const passwordSchema = z.object({
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});


const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      farmName: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name ?? "",
        farmName: profile.farm_name ?? "",
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({ title: "Sucesso!", description: "Perfil atualizado." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({ title: "Sucesso!", description: "Sua senha foi alterada." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    updateMutation.mutate({ id: user.id, full_name: values.fullName, farm_name: values.farmName });
  }

  function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    updatePasswordMutation.mutate(values.password);
  }

  const renderPlanInfo = () => {
    if (!profile || !profile.user_usage) {
      return null;
    }

    const { plan_type, trial_end_date } = profile.user_usage;
    const isPro = plan_type === 'pro';
    const whatsappLink = "https://wa.me/5551999135237?text=fazer%20upgrade%20agora";

    if (isPro) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-2">
            <Crown />
            Plano Pro
          </Badge>
          <p className="text-sm text-muted-foreground">Você tem acesso a todos os recursos.</p>
        </div>
      );
    }
    
    const isInTrial = trial_end_date && isFuture(new Date(trial_end_date));
    
    return (
       <div className="space-y-2">
        {isInTrial ? (
            <>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-2">
                    <Clock />
                    Período de Teste
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    {differenceInDays(new Date(trial_end_date!), new Date()) > 0 ? `Seu teste termina em ${differenceInDays(new Date(trial_end_date!), new Date())} dia(s).` : 'Seu teste termina hoje.'}
                </p>
            </>
        ) : (
            <>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">Plano Gratuito</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Faça o upgrade para ter acesso a todos os recursos.</p>
            </>
        )}
          
        <div className="pt-2">
            <Button asChild size="sm" className="w-full">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Rocket />
                    Fazer Upgrade Agora
                </a>
            </Button>
        </div>
    </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
             <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-6 w-32" />
             </div>
             <Card>
                <CardHeader>
                  <Skeleton className="h-7 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-5 w-48" />
                </CardContent>
             </Card>
          </div>
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <User className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e de segurança.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          {profile && <AvatarUploader avatarUrl={profile.avatar_url} fullName={profile.full_name} />}
          
          <Card>
            <CardHeader>
              <CardTitle>Meu Plano</CardTitle>
            </CardHeader>
            <CardContent>
              {renderPlanInfo()}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seu nome e informações da fazenda.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input value={user?.email} disabled />
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="farmName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Fazenda/Negócio</FormLabel>
                        <FormControl>
                          <Input placeholder="O nome da sua propriedade" {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Alterar Senha</CardTitle>
              <CardDescription>Para sua segurança, escolha uma senha forte.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} autoComplete="new-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updatePasswordMutation.isPending}>
                      {updatePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
