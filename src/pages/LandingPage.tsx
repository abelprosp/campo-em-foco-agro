import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  FileText, 
  LayoutList, 
  Star, 
  ArrowRight, 
  Wheat, 
  Tractor, 
  DollarSign, 
  Check, 
  BarChart3, 
  MapPin, 
  Users, 
  Shield, 
  Brain, 
  Calendar, 
  Package, 
  TrendingUp, 
  Cloud, 
  Smartphone,
  Zap,
  Database,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
    <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 md:px-8">
      <Link to="/landing" className="flex items-center">
        <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="AgroAjuda Logo" className="h-6 sm:h-8" />
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
        <a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Soluções</a>
        <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
      </nav>
      <Button asChild className="text-sm px-3 py-2 sm:px-4 sm:py-2">
        <Link to="/auth">Começar Grátis</Link>
      </Button>
    </div>
  </header>
);

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Todas as funcionalidades em um array
  const allFeatures = [
    {
      icon: <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Dashboard Inteligente",
      description: "KPIs em tempo real, gráficos interativos e visão geral completa da sua fazenda."
    },
    {
      icon: <LayoutList className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Gestão de Atividades",
      description: "Planeje, atribua e monitore todas as tarefas da sua fazenda com calendário visual."
    },
    {
      icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Controle Financeiro",
      description: "Acompanhe despesas, receitas, fluxo de caixa e ciclos de safra com anexos."
    },
    {
      icon: <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Inventário Completo",
      description: "Controle de insumos e equipamentos com alertas de estoque baixo."
    },
    {
      icon: <Tractor className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Monitoramento da Produção",
      description: "Registros detalhados de colheitas, qualidade e observações por talhão."
    },
    {
      icon: <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Gestão de Talhões",
      description: "Mapeamento visual com geolocalização e análise de área em hectares."
    },
    {
      icon: <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Previsão do Tempo",
      description: "Integração com OpenWeather para previsões meteorológicas em tempo real."
    },
    {
      icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Análise com IA",
      description: "Relatórios inteligentes gerados por IA com insights personalizados."
    },
    {
      icon: <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Análise de Riscos Climáticos",
      description: "Identificação de riscos climáticos com recomendações específicas."
    },
    {
      icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Relatórios Avançados",
      description: "Exportação para PDF com gráficos e análises profissionais."
    },
    {
      icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Ciclos de Safra",
      description: "Gestão completa de safras com planejamento e acompanhamento."
    },
    {
      icon: <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />,
      title: "Interface Responsiva",
      description: "Acesso completo via desktop, tablet e smartphone."
    }
  ];

  const totalSlides = Math.ceil(allFeatures.length / 4);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  const getCurrentFeatures = () => {
    const startIndex = currentSlide * 4;
    return allFeatures.slice(startIndex, startIndex + 4);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background dark">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 sm:pt-28 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground">
              Revolucionando a Agricultura com <span className="text-primary">Tecnologia</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Nossa plataforma une dados e inteligência artificial para transformar a gestão da sua fazenda.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/auth">Começar Teste Grátis <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <a href="#features">Ver Funções</a>
              </Button>
            </div>
          </div>
          <div className="relative mt-8 lg:mt-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl transform lg:rotate-3 lg:hover:rotate-0 transition-transform duration-300">
              <img src="/lovable-uploads/tela.png" alt="Drone agrícola sobre uma plantação" className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 bg-card p-4 sm:p-6 rounded-2xl shadow-lg w-auto hidden lg:flex items-center gap-4 border border-border">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" />
                <p className="text-lg sm:text-xl font-bold">4.9</p>
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base">Clientes Satisfeitos</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Baseado em +500 avaliações</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 md:px-8 bg-neutral-50 text-neutral-800">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-black">Uma Plataforma, Todas as Soluções</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto px-4">
            Do plantio à colheita, o AgroAjuda oferece as ferramentas para otimizar cada etapa do seu agronegócio.
          </p>
          
          {/* Features Slider */}
          <div className="mt-8 sm:mt-12 relative">
            <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {getCurrentFeatures().map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
            
            {/* Slider Indicators */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary scale-125' 
                      : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Innovative Solutions Section */}
      <section id="solutions" className="py-12 sm:py-16 lg:py-20 px-4 md:px-8">
        <div className="container mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src="/lovable-uploads/inovacao.jpeg" alt="Pessoa analisando dados agrícolas num tablet" className="w-full h-auto" />
          </div>
          <div className="px-4 lg:px-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Soluções Inovadoras para a Fazenda Moderna</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Utilizamos análise de dados e IA para fornecer insights que impulsionam a eficiência e a sustentabilidade. Identifique tendências, preveja resultados e otimize o uso de recursos como nunca antes.
            </p>
            <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full mt-1 flex-shrink-0"><Wheat size={14} className="sm:w-4 sm:h-4" /></div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Otimização de Colheitas</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">Modelos preditivos para maximizar o rendimento.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full mt-1 flex-shrink-0"><Activity size={14} className="sm:w-4 sm:h-4" /></div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Análise de Risco Climático</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">Prepare-se para eventos climáticos com antecedência.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full mt-1 flex-shrink-0"><TrendingUp size={14} className="sm:w-4 sm:h-4" /></div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Relatórios Inteligentes</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">Análise automática de dados com insights personalizados.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full mt-1 flex-shrink-0"><Shield size={14} className="sm:w-4 sm:h-4" /></div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Segurança Avançada</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">Proteção de dados com Row Level Security e autenticação JWT.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 md:px-8 bg-neutral-50 text-neutral-800">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Tecnologia de Ponta</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto px-4">
            Construída com as melhores tecnologias para garantir performance, segurança e escalabilidade.
          </p>
          <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <TechCard
              icon={<Brain className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
              title="Groq AI"
              description="Análise inteligente de dados com IA de última geração."
            />
            <TechCard
              icon={<Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
              title="OpenWeather API"
              description="Previsões meteorológicas precisas e análise climática."
            />
            <TechCard
              icon={<MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
              title="Mapbox"
              description="Mapeamento avançado e geolocalização de talhões."
            />
            <TechCard
              icon={<Database className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
              title="Supabase"
              description="Backend robusto com PostgreSQL e autenticação segura."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 lg:py-20 px-4 md:px-8 bg-neutral-50 text-neutral-800">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">O que os produtores dizem</h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto px-4">
            Centenas de produtores já confiam no AgroAjuda para transformar sua gestão.
          </p>
          <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <TestimonialCard
              quote="O AgroAjuda revolucionou a forma como administro minha fazenda. Tenho controle total das finanças e da produção na palma da minha mão."
              author="João da Silva"
              farm="Fazenda Santa Fé"
            />
            <TestimonialCard
              quote="Finalmente uma ferramenta que entende as necessidades do pequeno e médio produtor. Simples, intuitiva e poderosa."
              author="Maria Oliveira"
              farm="Sítio das Flores"
            />
            <TestimonialCard
              quote="Com os relatórios do AgroAjuda, consegui aumentar minha produtividade em 20% na última safra. Recomendo!"
              author="Carlos Pereira"
              farm="Agropecuária Pereira"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />
      
      {/* Final CTA Section */}
      <section id="cta" className="py-12 sm:py-16 lg:py-20 px-4 md:px-8 text-center bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1974&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-background/80"></div>
        <div className="relative z-10">
          <div className="container mx-auto py-8 sm:py-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground px-4">Pronto para cultivar o sucesso?</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Junte-se a nós e leve a gestão da sua propriedade rural para o próximo nível.
            </p>
            <div className="mt-6 sm:mt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/auth">Criar minha conta gratuita</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 px-4 md:px-8 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-sm">&copy; {new Date().getFullYear()} AgroAjuda. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="text-center bg-white hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border-neutral-200 h-full">
    <div className="mx-auto bg-primary/10 p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
      {icon}
    </div>
    <CardTitle className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-black">{title}</CardTitle>
    <CardDescription className="text-neutral-600 mt-2 text-sm sm:text-base">{description}</CardDescription>
  </Card>
);

const TechCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="text-center bg-white hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 border-neutral-200 h-full">
    <div className="mx-auto bg-primary/10 p-3 sm:p-4 rounded-full w-fit mb-3 sm:mb-4">
      {icon}
    </div>
    <CardTitle className="mt-3 sm:mt-4 text-base sm:text-lg font-bold text-black">{title}</CardTitle>
    <CardDescription className="text-neutral-600 mt-2 text-sm sm:text-base">{description}</CardDescription>
  </Card>
);

const TestimonialCard = ({ quote, author, farm }: { quote: string, author: string, farm: string }) => (
  <Card className="text-left bg-white p-4 sm:p-6 h-full border-neutral-200 flex flex-col">
    <CardContent className="p-0 flex flex-col h-full">
      <blockquote className="border-l-4 border-primary pl-4 italic text-neutral-700 flex-grow text-sm sm:text-base">
        "{quote}"
      </blockquote>
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="font-semibold text-primary text-sm sm:text-base">{author}</p>
        <p className="text-xs sm:text-sm text-neutral-500">{farm}</p>
      </div>
    </CardContent>
  </Card>
);

const PricingSection = () => {
  const { user } = useAuth();

  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 md:px-8">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Planos para todos os tamanhos</h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          Comece de graça e evolua conforme sua produção cresce.
        </p>
        <div className="mt-8 sm:mt-12 grid max-w-lg gap-6 sm:gap-8 mx-auto lg:max-w-none lg:grid-cols-2">
          <PricingCard
            title="Freemium"
            price="R$0"
            description="Para quem está começando a organizar a fazenda."
            features={[
              "Dashboard Geral com KPIs",
              "Gestão de Atividades Básica",
              "Controle de Estoque Simples",
              "Interface Responsiva",
              "Suporte por Email",
              "30 dias de teste gratuito"
            ]}
            buttonText={user ? "Seu Plano Atual" : "Começar Agora"}
            buttonAction={() => { if (!user) window.location.href = "/auth"; }}
            disabled={!!user}
          />
          <PricingCard
            title="Pro"
            price="R$14,90"
            priceSuffix="/mês"
            description="Todas as ferramentas para uma gestão completa e inteligente."
            features={[
              "Tudo do Freemium",
              "Controle Financeiro Avançado",
              "Análise de Produção Completa",
              "Gestão de Talhões com Mapeamento",
              "Relatórios Inteligentes com IA",
              "Análise de Riscos Climáticos",
              "Previsão do Tempo Integrada",
              "Ciclos de Safra",
              "Exportação para PDF",
              "Suporte Prioritário",
              "Anexos de Arquivos"
            ]}
            buttonText={"Todas as funcionalidades incluídas"}
            buttonAction={() => {}}
            isFeatured
            disabled={true}
          />
        </div>
      </div>
    </section>
  );
};

interface PricingCardProps {
  title: string;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonAction: () => void;
  isFeatured?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const PricingCard = ({ title, price, priceSuffix, description, features, buttonText, buttonAction, isFeatured = false, disabled = false, loading = false }: PricingCardProps) => (
  <Card className={`flex flex-col ${isFeatured ? 'border-primary ring-2 ring-primary' : ''}`}>
    <CardContent className="p-6 sm:p-8 flex-1 flex flex-col">
      <h3 className="text-xl sm:text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground text-sm sm:text-base">{description}</p>
      <div className="mt-4 sm:mt-6">
        <span className="text-3xl sm:text-4xl font-bold">{price}</span>
        {priceSuffix && <span className="text-muted-foreground text-sm sm:text-base">{priceSuffix}</span>}
      </div>
      <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-left">
        {features.map((feature) => (
          <li key={feature} className="flex items-start">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
            <span className="text-sm sm:text-base">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6 sm:pt-8">
        <Button onClick={buttonAction} className="w-full text-sm sm:text-base" size="lg" variant={isFeatured ? 'default' : 'outline'} disabled={disabled || loading}>
          {buttonText}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default LandingPage;
