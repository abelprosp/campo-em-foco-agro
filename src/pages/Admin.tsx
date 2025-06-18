import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings, DollarSign, Calendar, Save } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { getSystemSettings, updateSystemSetting, getAllUsers, updateUserUsage, getUserStats } from "@/features/admin/api";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [settings, setSettings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeTrials: 0, proUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      loadData();
    }
  }, [isAdmin, adminLoading]);

  const loadData = async () => {
    try {
      const [settingsData, usersData, statsData] = await Promise.all([
        getSystemSettings(),
        getAllUsers(),
        getUserStats(),
      ]);
      setSettings(settingsData || []);
      setUsers(usersData || []);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do painel administrativo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      let parsedValue: any = value;
      if (value.toLowerCase() === 'true') {
        parsedValue = true;
      } else if (value.toLowerCase() === 'false') {
        parsedValue = false;
      } else if (value.trim() !== '' && !isNaN(Number(value))) {
        parsedValue = Number(value);
      }

      await updateSystemSetting(key, parsedValue);
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso",
      });
      loadData();
    } catch (error) {
      console.error("Error updating setting:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserPlan = async (userId: string, planType: string) => {
    try {
      await updateUserUsage(userId, { plan_type: planType });
      toast({
        title: "Sucesso",
        description: "Plano do usuário atualizado com sucesso",
      });
      loadData();
    } catch (error) {
      console.error("Error updating user plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano do usuário",
        variant: "destructive",
      });
    }
  };

  if (adminLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando painel administrativo...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <Badge variant="secondary">Administrador</Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testes Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrials}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Pro</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Gerencie as configurações globais da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.key} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor={setting.key}>{setting.description}</Label>
                    <Input
                      id={setting.key}
                      defaultValue={setting.value}
                      onBlur={(e) => handleUpdateSetting(setting.key, e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(setting.key) as HTMLInputElement;
                      handleUpdateSetting(setting.key, input.value);
                    }}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Usuários
              </CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Teste até</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || "Sem nome"}</TableCell>
                        <TableCell>{user.email || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={user.user_usage?.plan_type === 'pro' ? 'default' : 'secondary'}>
                            {user.user_usage?.plan_type || 'freemium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.user_usage?.subscription_status === 'active' ? 'default' : 'outline'}>
                            {user.user_usage?.subscription_status || 'trial'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.user_usage?.trial_end_date ? 
                            new Date(user.user_usage.trial_end_date).toLocaleDateString('pt-BR') : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.user_usage?.plan_type || 'freemium'}
                            onValueChange={(value) => handleUpdateUserPlan(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="freemium">Freemium</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
