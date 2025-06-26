import { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Leaf, Users, ShieldCheck, Sprout, FlaskConical, ChevronRight, Star, Mail, Cloud, ArrowRight } from "lucide-react";

// Scroll suave para âncoras
if (typeof window !== "undefined") {
  document.documentElement.style.scrollBehavior = "smooth";
}

const heroStats = {
  rating: 4.9,
  reviews: 500,
  label: "Clientes Satisfeitos",
};

const features = [
  {
    icon: <FlaskConical className="w-10 h-10" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Monitoramento da Produção",
    desc: "Registros detalhados de colheitas, qualidade e observações por talhão."
  },
  {
    icon: <Sprout className="w-10 h-10" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Gestão de Talhões",
    desc: "Mapeamento visual com geolocalização e análise de área em hectares."
  },
  {
    icon: <Cloud className="w-10 h-10" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Previsão do Tempo",
    desc: "Integração com OpenWeather para previsões meteorológicas em tempo real."
  },
  {
    icon: <Leaf className="w-10 h-10" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Análise com IA",
    desc: "Relatórios inteligentes gerados por IA com insights personalizados."
  },
];

const solutions = [
  {
    icon: <ChevronRight className="w-6 h-6" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Otimização de Colheitas",
    desc: "Modelos preditivos para maximizar o rendimento."
  },
  {
    icon: <ChevronRight className="w-6 h-6" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Análise de Risco Climático",
    desc: "Prepare-se para eventos climáticos com antecedência."
  },
  {
    icon: <ChevronRight className="w-6 h-6" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Relatórios Inteligentes",
    desc: "Análise automática de dados com insights personalizados."
  },
  {
    icon: <ChevronRight className="w-6 h-6" style={{ color: 'rgb(27, 75, 71)' }} />,
    title: "Segurança Avançada",
    desc: "Proteção de dados com Row Level Security e autenticação JWT."
  },
];

const techs = [
  { name: "Groq AI", desc: "Análise inteligente de dados com IA de última geração." },
  { name: "OpenWeather API", desc: "Previsões meteorológicas precisas e análise climática." },
  { name: "Mapbox", desc: "Mapeamento avançado e geolocalização de talhões." },
  { name: "Supabase", desc: "Backend robusto com PostgreSQL e autenticação segura." },
];

const testimonials = [
  {
    name: "João da Silva",
    text: "O AgroAjuda revolucionou a forma como administro minha fazenda. Tenho controle total das finanças e da produção na palma da minha mão.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    farm: "Fazenda Santa Fé"
  },
  {
    name: "Maria Oliveira",
    text: "Finalmente uma ferramenta que entende as necessidades do pequeno e médio produtor. Simples, intuitiva e poderosa.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    farm: "Sítio das Flores"
  },
  {
    name: "Carlos Pereira",
    text: "Com os relatórios do AgroAjuda, consegui aumentar minha produtividade em 20% na última safra. Recomendo!",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    farm: "Agropecuária Pereira"
  },
];

const plans = [
  {
    name: "Freemium",
    price: "R$0",
    desc: "Para quem está começando a organizar a fazenda.",
    features: [
      "Dashboard Geral com KPIs",
      "Gestão de Atividades Básica",
      "Controle de Estoque Simples",
      "Interface Responsiva",
      "Suporte por Email",
      "30 dias de teste gratuito"
    ],
    cta: "Começar Agora"
  },
  {
    name: "Pro",
    price: "R$27,90/mês",
    desc: "Todas as ferramentas para uma gestão completa e inteligente.",
    features: [
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
    ],
    cta: "Todas as funcionalidades incluídas"
  }
];

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="AgroAjuda Logo" className="h-10" />
          </div>
          <nav className="hidden lg:flex gap-10 text-base font-medium">
            <a href="#features" className="hover:text-green-800 transition-colors" style={{ color: 'rgb(27, 75, 71)' }}>Funções</a>
            <a href="#solutions" className="hover:text-green-800 transition-colors" style={{ color: 'rgb(27, 75, 71)' }}>Soluções</a>
            <a href="#tech" className="hover:text-green-800 transition-colors" style={{ color: 'rgb(27, 75, 71)' }}>Tecnologia</a>
            <a href="#testimonials" className="hover:text-green-800 transition-colors" style={{ color: 'rgb(27, 75, 71)' }}>Depoimentos</a>
            <a href="#plans" className="hover:text-green-800 transition-colors" style={{ color: 'rgb(27, 75, 71)' }}>Planos</a>
          </nav>
          <div className="flex gap-3">
            <Button asChild variant="ghost" size="sm" className="text-gray-700 hover:text-green-800"><Link to="/auth">Entrar</Link></Button>
            <Button asChild size="sm" style={{ backgroundColor: 'rgb(27, 75, 71)', color: 'white' }} className="hover:opacity-90"><Link to="/auth">Começar</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between px-6 py-20 lg:py-32 gap-12">
          {/* Texto à esquerda */}
          <div className="lg:w-1/2 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: 'rgba(27, 75, 71, 0.1)', color: 'rgb(27, 75, 71)' }}>
              <Star className="w-4 h-4" />
              Plataforma líder em gestão agrícola
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Revolucionando a <span style={{ color: 'rgb(27, 75, 71)' }}>Agricultura</span> com Tecnologia
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Nossa plataforma une dados e inteligência artificial para transformar a gestão da sua fazenda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" style={{ backgroundColor: 'rgb(27, 75, 71)', color: 'white' }} className="hover:opacity-90 font-semibold px-8 py-4 rounded-lg text-lg shadow-lg">
                Começar Teste Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg">
                Ver Demonstração
              </Button>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="font-medium">{heroStats.rating}</span>
              </div>
              <span>•</span>
              <span>{heroStats.reviews}+ {heroStats.label}</span>
            </div>
          </div>
          {/* Imagem à direita */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end z-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl transform rotate-3" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
              <img 
                src="/lovable-uploads/tela.png" 
                alt="Agricultor usando tablet" 
                className="relative w-full max-w-lg rounded-2xl shadow-2xl object-cover transform -rotate-1" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Uma Plataforma, Todas as Soluções</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Do plantio à colheita, o AgroAjuda oferece as ferramentas para otimizar cada etapa do seu agronegócio.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(27, 75, 71, 0.1)' }}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">Soluções Inovadoras para a Fazenda Moderna</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Utilizamos análise de dados e IA para fornecer insights que impulsionam a eficiência e a sustentabilidade. 
                Identifique tendências, preveja resultados e otimize o uso de recursos como nunca antes.
              </p>
              <div className="space-y-6">
                {solutions.map((s, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'rgba(27, 75, 71, 0.1)' }}>
                      {s.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{s.title}</h4>
                      <p className="text-gray-600">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl transform rotate-2" style={{ backgroundColor: 'rgb(27, 75, 71)' }}></div>
              <img 
                src="/lovable-uploads/tela2.png" 
                alt="Pessoa analisando dados agrícolas num tablet" 
                className="relative w-full h-96 object-cover rounded-2xl shadow-2xl transform -rotate-1" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Techs */}
      <section id="tech" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Tecnologia de Ponta</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Construído com as tecnologias mais avançadas para garantir performance e confiabilidade.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techs.map((t, i) => (
              <Card key={i} className="p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.name}</h3>
                <p className="text-gray-600 leading-relaxed">{t.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">O que os produtores dizem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Centenas de produtores já confiam no AgroAjuda para transformar sua gestão.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="p-8 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.farm}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="plans" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Planos para todos os tamanhos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comece de graça e evolua conforme sua produção cresce.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((p, i) => (
              <Card key={i} className={`p-8 border-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl ${
                i === 1 ? 'border-green-800 bg-green-50' : 'border-gray-200 bg-white'
              }`} style={i === 1 ? { borderColor: 'rgb(27, 75, 71)', backgroundColor: 'rgba(27, 75, 71, 0.05)' } : {}}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{p.name}</h3>
                  <div className="text-4xl font-bold mb-2" style={{ color: 'rgb(27, 75, 71)' }}>{p.price}</div>
                  <p className="text-gray-600">{p.desc}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  className={`w-full py-4 text-lg font-semibold rounded-lg ${
                    i === 1 
                      ? "text-white hover:opacity-90" 
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                  style={i === 1 ? { backgroundColor: 'rgb(27, 75, 71)' } : {}}
                >
                  {p.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(to right, rgb(27, 75, 71), rgb(20, 83, 45))' }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-6">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">Pronto para cultivar o sucesso?</h2>
          <p className="text-xl mb-10 text-green-100 leading-relaxed">
            Junte-se a nós e leve a gestão da sua propriedade rural para o próximo nível.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold">
              Criar minha conta gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg">
              Falar com especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/lovable-uploads/34538c76-855c-4a49-9aae-18637b429168.png" alt="AgroAjuda Logo" className="h-10" />
                <span className="text-2xl font-bold">AgroAjuda</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Transformando a agricultura com tecnologia de ponta. Simplificamos a gestão rural para produtores de todos os tamanhos.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6">Produto</h4>
              <div className="space-y-3 text-gray-400">
                <a href="#features" className="block hover:text-white transition-colors">Funções</a>
                <a href="#solutions" className="block hover:text-white transition-colors">Soluções</a>
                <a href="#tech" className="block hover:text-white transition-colors">Tecnologia</a>
                <a href="#plans" className="block hover:text-white transition-colors">Planos</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6">Empresa</h4>
              <div className="space-y-3 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Sobre nós</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
                <a href="#" className="block hover:text-white transition-colors">Carreiras</a>
                <a href="#" className="block hover:text-white transition-colors">Contato</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              &copy; 2025 AgroAjuda. Todos os direitos reservados.
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
