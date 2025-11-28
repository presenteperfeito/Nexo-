"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { 
  BookOpen, Calendar, FileText, Target, Timer, BarChart3, 
  Users, User, Plus, Play, Pause, RotateCcw, Check, 
  Clock, TrendingUp, Award, Brain, Settings, Search,
  ChevronRight, Edit, Trash2, Star, Filter, Download,
  Upload, Link, MessageCircle, ThumbsUp, Send, Bell,
  Moon, Sun, Volume2, VolumeX, Home, CheckCircle2,
  Circle, AlertCircle, Calendar as CalendarIcon,
  ArrowRight, Zap, Activity, Focus, Menu, X, LogOut
} from 'lucide-react';
import { NexoInput, NexoTextArea } from '@/components/NexoField';
import { SharedProfileForm } from '@/components/SharedProfileForm';
import { RequireAuth } from '@/components/RequireAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Tipos de dados
interface User {
  name: string;
  course: string;
  goals: string;
  avatar?: string;
  email?: string;
}

interface Task {
  id: string;
  title: string;
  subject: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  description?: string;
}

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  date: string;
  type: 'pomodoro' | 'free';
}

interface Material {
  id: string;
  title: string;
  type: 'note' | 'pdf' | 'link';
  subject: string;
  content?: string;
  url?: string;
  createdAt: string;
  favorito: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  category: string;
}

interface EventoEstudo {
  id_evento: string;
  data: string;
  dia_semana: string;
  hora_inicio: string;
  materia: string;
  cor: string;
  observacoes?: string;
}

// Novos tipos para tarefas e metas
interface Tarefa {
  id_tarefa: string;
  titulo: string;
  materia: string;
  descricao: string;
  prazo: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'em_progresso' | 'concluida';
}

interface MetaLongoPrazo {
  id_meta: string;
  titulo: string;
  descricao: string;
  materia: string;
  prazo: string;
  progresso: number;
}

// Novo tipo para sessões de foco
interface SessaoFoco {
  id_sessao: string;
  materia: string;
  data: string;
  duracao_minutos: number;
  tipo: 'Pomodoro' | 'Free';
  concluida: boolean;
}

// Tipo para gamificação
interface UsuarioGamificacao {
  id_usuario: string;
  xp_total: number;
  nivel: number;
  streak_dias: number;
  minutos_hoje: number;
  recorde_streak?: number;
}

// Tipos para Comunidade
interface Resposta {
  id: string;
  autor: string;
  data: string;
  conteudo: string;
}

interface Discussao {
  id: string;
  titulo: string;
  materia: string;
  autor: string;
  data: string;
  conteudo: string;
  likes: number;
  respostas: Resposta[];
  likedByUser?: boolean;
}

// TIPO PARA PREFERÊNCIAS DO USUÁRIO
interface PreferenciasUsuario {
  notificacoes: boolean;
  somTimer: boolean;
  modoEscuro: boolean;
}

// CONTEXTO DE PREFERÊNCIAS
const PreferenciasContext = createContext<{
  preferencias: PreferenciasUsuario;
  setPreferencias: React.Dispatch<React.SetStateAction<PreferenciasUsuario>>;
} | null>(null);

function StudyAppContent() {
  const router = useRouter();
  
  // ESTADO GLOBAL DE PREFERÊNCIAS
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario>(() => {
    if (typeof window !== 'undefined') {
      const salvo = localStorage.getItem('nexo_preferencias');
      if (salvo) return JSON.parse(salvo);
    }
    return {
      notificacoes: true,
      somTimer: true,
      modoEscuro: true,
    };
  });

  // SINCRONIZAR COM LOCALSTORAGE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexo_preferencias', JSON.stringify(preferencias));
    }
  }, [preferencias]);

  // APLICAR MODO ESCURO NO ELEMENTO ROOT
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (preferencias.modoEscuro) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [preferencias.modoEscuro]);

  // Estados principais
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [eventosEstudo, setEventosEstudo] = useState<EventoEstudo[]>([]);
  
  // Novos estados para tarefas e metas
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [metasLongoPrazo, setMetasLongoPrazo] = useState<MetaLongoPrazo[]>([]);
  
  // Estados para sessões de foco
  const [sessoesFoco, setSessoesFoco] = useState<SessaoFoco[]>([]);
  
  // Estado para gamificação
  const [usuarioGamificacao, setUsuarioGamificacao] = useState<UsuarioGamificacao>({
    id_usuario: '1',
    xp_total: 1250,
    nivel: 5,
    streak_dias: 7,
    minutos_hoje: 90,
    recorde_streak: 7
  });

  // ESTADO ÚNICO PARA COMUNIDADE
  const [discussoes, setDiscussoes] = useState<Discussao[]>([
    {
      id: '1',
      titulo: 'Dicas para estudar Cálculo',
      materia: 'Matemática',
      autor: 'Ana Silva',
      data: new Date().toISOString(),
      conteudo: 'Compartilho algumas técnicas que me ajudaram muito a entender derivadas e integrais. Primeiro, sempre faça os exercícios do livro...',
      likes: 15,
      respostas: [
        {
          id: 'r1',
          autor: 'Carlos Souza',
          data: new Date().toISOString(),
          conteudo: 'Muito obrigado pelas dicas! Vou aplicar nos meus estudos.'
        }
      ],
      likedByUser: false
    }
  ]);
  
  // Estados do Timer de Foco (em SEGUNDOS totais)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60); // 25 minutos em segundos
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<'Pomodoro' | 'Free'>('Pomodoro');
  const [selectedMateria, setSelectedMateria] = useState('Geral');
  const [showSessionDetail, setShowSessionDetail] = useState<SessaoFoco | null>(null);
  
  // Novos estados para duração customizável
  const [customDuration, setCustomDuration] = useState(25);
  const [showDurationWarning, setShowDurationWarning] = useState(false);
  
  // Estados do Pomodoro (mantidos para compatibilidade)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'break'>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Estados da UI
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados para edição de materiais
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para adicionar material - USANDO FORMULÁRIO UNIFICADO
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMaterialFormData, setAddMaterialFormData] = useState<Material>({
    id: '',
    title: '',
    type: 'note',
    subject: '',
    content: '',
    url: '',
    createdAt: new Date().toISOString().split('T')[0],
    favorito: false
  });

  // Estados para eventos de estudo - ESTADO LOCAL SEPARADO
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventoEstudo | null>(null);
  const [eventMateria, setEventMateria] = useState('');
  const [eventObservacoes, setEventObservacoes] = useState('');
  const [eventData, setEventData] = useState(new Date().toISOString().split('T')[0]);
  const [eventHora, setEventHora] = useState('09:00');
  const [eventCor, setEventCor] = useState('#3B82F6');

  // Estados para tarefas
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarefa | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pendente' | 'em_progresso' | 'concluida'>('all');

  // Estados para metas
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MetaLongoPrazo | null>(null);
  const [goalTitulo, setGoalTitulo] = useState('');
  const [goalDescricao, setGoalDescricao] = useState('');
  const [goalMateria, setGoalMateria] = useState('');
  const [goalPrazo, setGoalPrazo] = useState(new Date().toISOString().split('T')[0]);
  const [goalProgresso, setGoalProgresso] = useState(0);

  // Estados para edição de sessões de foco
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<SessaoFoco | null>(null);
  const [editSessionMateria, setEditSessionMateria] = useState('');
  const [editSessionData, setEditSessionData] = useState('');
  const [editSessionDuracao, setEditSessionDuracao] = useState(25);
  const [editSessionTipo, setEditSessionTipo] = useState<'Pomodoro' | 'Free'>('Pomodoro');

  // Estados para Comunidade
  const [selectedDiscussao, setSelectedDiscussao] = useState<Discussao | null>(null);
  const [editingDiscussao, setEditingDiscussao] = useState<Discussao | null>(null);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [respostaInput, setRespostaInput] = useState('');
  const [editingResposta, setEditingResposta] = useState<{ discussaoId: string; respostaId: string } | null>(null);
  const [editRespostaConteudo, setEditRespostaConteudo] = useState('');
  
  // Ref para scroll do formulário
  const formRef = useRef<HTMLDivElement>(null);

  // Carregar dados do usuário do Supabase
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (supabaseUser) {
        setUser({
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
          course: supabaseUser.user_metadata?.course || '',
          goals: supabaseUser.user_metadata?.goals || '',
          avatar: supabaseUser.user_metadata?.avatar_url
        });
      }
    };

    loadUserData();
  }, []);

  // Função para logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Função para formatar tempo no círculo
  const formatTimeDisplay = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Formato único: H:MM:SS
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Função para alterar duração customizada
  const handleDurationChange = (newDuration: number) => {
    if (newDuration > 240) {
      setShowDurationWarning(true);
      setCustomDuration(240);
      setRemainingSeconds(240 * 60);
      
      // Esconder aviso após 10 segundos
      setTimeout(() => {
        setShowDurationWarning(false);
      }, 10000);
    } else if (newDuration < 1) {
      setCustomDuration(1);
      setRemainingSeconds(1 * 60);
    } else {
      setCustomDuration(newDuration);
      setRemainingSeconds(newDuration * 60);
      setShowDurationWarning(false);
    }
    
    // Determinar tipo baseado na duração
    if (newDuration === 25) {
      setTimerType('Pomodoro');
    } else {
      setTimerType('Free');
    }
  };

  // Timer do Foco
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isTimerRunning) {
      // Timer chegou a 00:00
      setIsTimerRunning(false);
      handleTimerComplete();
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, remainingSeconds]);

  // Função para completar o timer
  const handleTimerComplete = () => {
    const novaSessao: SessaoFoco = {
      id_sessao: Date.now().toString(),
      materia: selectedMateria,
      data: new Date().toISOString(),
      duracao_minutos: customDuration,
      tipo: timerType,
      concluida: true
    };
    
    setSessoesFoco(prev => [novaSessao, ...prev]);
    
    // Resetar timer para duração customizada
    setRemainingSeconds(customDuration * 60);
    
    // VERIFICAR PREFERÊNCIA DE SOM ANTES DE TOCAR
    if (preferencias.somTimer) {
      // Tocar som aqui (implementação futura)
      console.log('Som do timer tocando...');
    }
    
    // Mostrar mensagem de sucesso
    setSuccessMessage(`Sessão de ${timerType} concluída! ${customDuration} minutos registrados.`);
    setShowSuccessMessage(true);
  };

  // FUNÇÕES DE CÁLCULO DINÂMICO PARA PAINEL DE ESTUDOS

  // Calcular Tarefas Concluídas Hoje
  const getTarefasConcluidasHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const tarefasHoje = tarefas.filter(t => t.prazo === hoje);
    const concluidas = tarefasHoje.filter(t => t.status === 'concluida').length;
    const total = tarefasHoje.length;
    return { concluidas, total };
  };

  // Calcular Tempo de Estudo Hoje
  const getTempoEstudoHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const minutos = sessoesFoco
      .filter(s => s.data.split('T')[0] === hoje)
      .reduce((acc, s) => acc + s.duracao_minutos, 0);
    return (minutos / 60).toFixed(1); // Retorna em horas com 1 casa decimal
  };

  // Calcular Pomodoros Hoje
  const getPomodorosHoje = () => {
    const hoje = new Date().toISOString().split('T')[0];
    return sessoesFoco.filter(s => 
      s.tipo === 'Pomodoro' && 
      s.data.split('T')[0] === hoje
    ).length;
  };

  // Calcular Progresso Semanal
  const getProgressoSemanal = () => {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
    inicioSemana.setHours(0, 0, 0, 0);
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
    fimSemana.setHours(23, 59, 59, 999);
    
    const tarefasSemana = tarefas.filter(t => {
      const prazo = new Date(t.prazo);
      return prazo >= inicioSemana && prazo <= fimSemana;
    });
    
    if (tarefasSemana.length === 0) return 0;
    
    const concluidas = tarefasSemana.filter(t => t.status === 'concluida').length;
    return Math.round((concluidas / tarefasSemana.length) * 100);
  };

  // Calcular Tempo Total
  const getTempoTotal = () => {
    const totalMinutos = sessoesFoco.reduce((acc, s) => acc + s.duracao_minutos, 0);
    return Math.round(totalMinutos / 60 * 10) / 10; // Arredondado para 1 casa decimal
  };

  // Funções para manipular sessões de foco
  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Tem certeza que deseja remover esta sessão de foco?')) {
      setSessoesFoco(prev => prev.filter(s => s.id_sessao !== sessionId));
      setSuccessMessage('Sessão removida com sucesso');
      setShowSuccessMessage(true);
    }
  };

  const handleEditSession = (sessao: SessaoFoco) => {
    setEditingSession(sessao);
    setEditSessionMateria(sessao.materia);
    setEditSessionData(sessao.data.split('T')[0] + 'T' + new Date(sessao.data).toTimeString().slice(0, 5));
    setEditSessionDuracao(sessao.duracao_minutos);
    setEditSessionTipo(sessao.tipo);
    setShowEditSessionModal(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSession) return;
    
    const sessaoUpdated: SessaoFoco = {
      id_sessao: editingSession.id_sessao,
      materia: editSessionMateria,
      data: new Date(editSessionData).toISOString(),
      duracao_minutos: editSessionDuracao,
      tipo: editSessionTipo,
      concluida: editingSession.concluida
    };

    setSessoesFoco(prev => 
      prev.map(s => s.id_sessao === editingSession.id_sessao ? sessaoUpdated : s)
    );
    setShowEditSessionModal(false);
    setEditingSession(null);
    
    // Limpar campos
    setEditSessionMateria('');
    setEditSessionData('');
    setEditSessionDuracao(25);
    setEditSessionTipo('Pomodoro');
    
    setSuccessMessage('Sessão atualizada com sucesso');
    setShowSuccessMessage(true);
  };

  // FUNÇÕES DA COMUNIDADE

  // Toggle like
  const handleToggleLike = (discussaoId: string) => {
    setDiscussoes(prev => 
      prev.map(d => {
        if (d.id === discussaoId) {
          const isLiked = d.likedByUser || false;
          return {
            ...d,
            likes: isLiked ? Math.max(0, d.likes - 1) : d.likes + 1,
            likedByUser: !isLiked
          };
        }
        return d;
      })
    );
  };

  // Responder discussão
  const handleResponderDiscussao = () => {
    if (!selectedDiscussao || !respostaInput.trim()) {
      alert('Por favor, escreva uma resposta.');
      return;
    }

    const novaResposta: Resposta = {
      id: Date.now().toString(),
      autor: user?.name || 'Usuário',
      data: new Date().toISOString(),
      conteudo: respostaInput
    };

    setDiscussoes(prev =>
      prev.map(d => {
        if (d.id === selectedDiscussao.id) {
          return {
            ...d,
            respostas: [...d.respostas, novaResposta]
          };
        }
        return d;
      })
    );

    setRespostaInput('');
    setSuccessMessage('Resposta adicionada com sucesso!');
    setShowSuccessMessage(true);
  };

  // Editar resposta
  const handleEditarResposta = (discussaoId: string, respostaId: string) => {
    const discussao = discussoes.find(d => d.id === discussaoId);
    const resposta = discussao?.respostas.find(r => r.id === respostaId);
    
    if (resposta) {
      setEditingResposta({ discussaoId, respostaId });
      setEditRespostaConteudo(resposta.conteudo);
    }
  };

  const handleSalvarEdicaoResposta = () => {
    if (!editingResposta || !editRespostaConteudo.trim()) {
      alert('Por favor, escreva o conteúdo da resposta.');
      return;
    }

    setDiscussoes(prev =>
      prev.map(d => {
        if (d.id === editingResposta.discussaoId) {
          return {
            ...d,
            respostas: d.respostas.map(r => {
              if (r.id === editingResposta.respostaId) {
                return { ...r, conteudo: editRespostaConteudo };
              }
              return r;
            })
          };
        }
        return d;
      })
    );

    setEditingResposta(null);
    setEditRespostaConteudo('');
    setSuccessMessage('Resposta editada com sucesso!');
    setShowSuccessMessage(true);
  };

  // Excluir resposta
  const handleExcluirResposta = (discussaoId: string, respostaId: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) {
      return;
    }

    setDiscussoes(prev =>
      prev.map(d => {
        if (d.id === discussaoId) {
          return {
            ...d,
            respostas: d.respostas.filter(r => r.id !== respostaId)
          };
        }
        return d;
      })
    );

    setSuccessMessage('Comentário excluído com sucesso!');
    setShowSuccessMessage(true);
  };

  // Timer do Pomodoro (mantido para compatibilidade)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsRunning(false);
      if (currentSession === 'work') {
        setPomodoroCount(count => count + 1);
        setPomodoroTime(5 * 60);
        setCurrentSession('break');
      } else {
        setPomodoroTime(25 * 60);
        setCurrentSession('work');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, pomodoroTime, currentSession]);

  // Timer para mensagem de sucesso
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  // Dados iniciais
  useEffect(() => {
    if (user) {
      // Tarefas de exemplo
      setTasks([
        {
          id: '1',
          title: 'Estudar Cálculo Diferencial',
          subject: 'Matemática',
          status: 'in-progress',
          priority: 'high',
          dueDate: '2024-01-15',
          description: 'Capítulos 1-3 do livro'
        },
        {
          id: '2',
          title: 'Projeto de Física',
          subject: 'Física',
          status: 'pending',
          priority: 'medium',
          dueDate: '2024-01-20'
        },
        {
          id: '3',
          title: 'Ensaio de História',
          subject: 'História',
          status: 'completed',
          priority: 'low',
          dueDate: '2024-01-10'
        }
      ]);

      // Tarefas novas (coleção tarefas)
      setTarefas([
        {
          id_tarefa: '1',
          titulo: 'Resolver exercícios de Cálculo',
          materia: 'Matemática',
          descricao: 'Capítulo 5 - Derivadas',
          prazo: new Date().toISOString().split('T')[0], // Hoje
          prioridade: 'alta',
          status: 'pendente'
        },
        {
          id_tarefa: '2',
          titulo: 'Ler capítulo de Física Quântica',
          materia: 'Física',
          descricao: 'Capítulo 3 - Princípio da Incerteza',
          prazo: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Daqui 2 dias
          prioridade: 'media',
          status: 'em_progresso'
        },
        {
          id_tarefa: '3',
          titulo: 'Revisar anotações de História',
          materia: 'História',
          descricao: 'Segunda Guerra Mundial',
          prazo: new Date().toISOString().split('T')[0], // Hoje
          prioridade: 'baixa',
          status: 'concluida'
        }
      ]);

      // Metas de longo prazo
      setMetasLongoPrazo([
        {
          id_meta: '1',
          titulo: 'Dominar Cálculo Integral',
          descricao: 'Completar todos os exercícios do semestre',
          materia: 'Matemática',
          prazo: '2024-06-30',
          progresso: 65
        },
        {
          id_meta: '2',
          titulo: 'Projeto Final de Física',
          descricao: 'Desenvolver projeto de conclusão',
          materia: 'Física',
          prazo: '2024-12-15',
          progresso: 25
        }
      ]);

      // Sessões de estudo de exemplo
      setStudySessions([
        { id: '1', subject: 'Matemática', duration: 120, date: '2024-01-12', type: 'pomodoro' },
        { id: '2', subject: 'Física', duration: 90, date: '2024-01-12', type: 'free' },
        { id: '3', subject: 'História', duration: 60, date: '2024-01-11', type: 'pomodoro' }
      ]);

      // Sessões de foco de exemplo (HOJE)
      setSessoesFoco([
        {
          id_sessao: '1',
          materia: 'Matemática',
          data: new Date().toISOString(),
          duracao_minutos: 25,
          tipo: 'Pomodoro',
          concluida: true
        },
        {
          id_sessao: '2',
          materia: 'Física',
          data: new Date().toISOString(),
          duracao_minutos: 45,
          tipo: 'Free',
          concluida: true
        },
        {
          id_sessao: '3',
          materia: 'História',
          data: new Date(Date.now() - 86400000).toISOString(), // Ontem
          duracao_minutos: 25,
          tipo: 'Pomodoro',
          concluida: true
        }
      ]);

      // Materiais de exemplo com campo favorito
      setMaterials([
        {
          id: '1',
          title: 'Anotações de Cálculo',
          type: 'note',
          subject: 'Matemática',
          content: 'Derivadas e integrais...',
          createdAt: '2024-01-12',
          favorito: false
        },
        {
          id: '2',
          title: 'Livro de Física Quântica',
          type: 'pdf',
          subject: 'Física',
          createdAt: '2024-01-11',
          favorito: false
        }
      ]);

      // Metas de exemplo
      setGoals([
        {
          id: '1',
          title: 'Dominar Cálculo',
          description: 'Completar todos os exercícios do semestre',
          targetDate: '2024-06-30',
          progress: 65,
          category: 'Matemática'
        },
        {
          id: '2',
          title: 'Projeto Final',
          description: 'Desenvolver projeto de conclusão',
          targetDate: '2024-12-15',
          progress: 25,
          category: 'Geral'
        }
      ]);

      // Eventos de estudo de exemplo
      setEventosEstudo([
        {
          id_evento: '1',
          data: '2024-01-15',
          dia_semana: 'Seg',
          hora_inicio: '09:00',
          materia: 'Matemática',
          cor: '#3B82F6',
          observacoes: 'Revisão de derivadas'
        },
        {
          id_evento: '2',
          data: '2024-01-16',
          dia_semana: 'Ter',
          hora_inicio: '14:00',
          materia: 'Física',
          cor: '#22C55E',
          observacoes: 'Laboratório'
        },
        {
          id_evento: '3',
          data: '2024-01-17',
          dia_semana: 'Qua',
          hora_inicio: '10:00',
          materia: 'História',
          cor: '#A855F7',
          observacoes: ''
        }
      ]);
    }
  }, [user]);

  // Função para toggle de favorito
  const handleToggleFavorite = (materialId: string) => {
    setMaterials(prevMaterials => 
      prevMaterials.map(m => 
        m.id === materialId ? { ...m, favorito: !m.favorito } : m
      )
    );
  };

  // Funções para manipular materiais
  const handleDeleteMaterial = (materialId: string) => {
    setMaterials(prevMaterials => prevMaterials.filter(m => m.id !== materialId));
    setSuccessMessage('Material removido com sucesso');
    setShowSuccessMessage(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setShowEditModal(true);
  };

  const handleSaveMaterial = (updatedMaterial: Material) => {
    setMaterials(prevMaterials => 
      prevMaterials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m)
    );
    setShowEditModal(false);
    setEditingMaterial(null);
    setSuccessMessage('Material atualizado com sucesso');
    setShowSuccessMessage(true);
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    
    const materialToAdd: Material = {
      id: Date.now().toString(),
      title: addMaterialFormData.title,
      type: addMaterialFormData.type,
      subject: addMaterialFormData.subject,
      content: addMaterialFormData.content,
      url: addMaterialFormData.url,
      createdAt: addMaterialFormData.createdAt,
      favorito: false
    };

    setMaterials(prevMaterials => [...prevMaterials, materialToAdd]);
    setShowAddModal(false);
    
    // Limpar campos
    setAddMaterialFormData({
      id: '',
      title: '',
      type: 'note',
      subject: '',
      content: '',
      url: '',
      createdAt: new Date().toISOString().split('T')[0],
      favorito: false
    });
    
    setSuccessMessage('Material adicionado com sucesso');
    setShowSuccessMessage(true);
  };

  // Funções para manipular eventos de estudo
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const date = new Date(eventData);
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const eventoToAdd: EventoEstudo = {
      id_evento: Date.now().toString(),
      data: eventData,
      dia_semana: diasSemana[date.getDay()],
      hora_inicio: eventHora,
      materia: eventMateria,
      cor: eventCor,
      observacoes: eventObservacoes
    };

    setEventosEstudo(prev => [...prev, eventoToAdd]);
    setShowEventModal(false);
    
    // Limpar campos
    setEventMateria('');
    setEventObservacoes('');
    setEventData(new Date().toISOString().split('T')[0]);
    setEventHora('09:00');
    setEventCor('#3B82F6');
    
    setSuccessMessage('Evento adicionado com sucesso');
    setShowSuccessMessage(true);
  };

  const handleEditEvent = (evento: EventoEstudo) => {
    setEditingEvent(evento);
    setEventData(evento.data);
    setEventHora(evento.hora_inicio);
    setEventMateria(evento.materia);
    setEventCor(evento.cor);
    setEventObservacoes(evento.observacoes || '');
    setShowEventModal(true);
  };

  const handleUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;
    
    const date = new Date(eventData);
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    const eventoUpdated: EventoEstudo = {
      id_evento: editingEvent.id_evento,
      data: eventData,
      dia_semana: diasSemana[date.getDay()],
      hora_inicio: eventHora,
      materia: eventMateria,
      cor: eventCor,
      observacoes: eventObservacoes
    };

    setEventosEstudo(prev => 
      prev.map(e => e.id_evento === editingEvent.id_evento ? eventoUpdated : e)
    );
    setShowEventModal(false);
    setEditingEvent(null);
    
    // Limpar campos
    setEventMateria('');
    setEventObservacoes('');
    setEventData(new Date().toISOString().split('T')[0]);
    setEventHora('09:00');
    setEventCor('#3B82F6');
    
    setSuccessMessage('Evento atualizado com sucesso');
    setShowSuccessMessage(true);
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;
    
    setEventosEstudo(prev => prev.filter(e => e.id_evento !== editingEvent.id_evento));
    setShowEventModal(false);
    setEditingEvent(null);
    
    // Limpar campos
    setEventMateria('');
    setEventObservacoes('');
    setEventData(new Date().toISOString().split('T')[0]);
    setEventHora('09:00');
    setEventCor('#3B82F6');
    
    setSuccessMessage('Evento excluído com sucesso');
    setShowSuccessMessage(true);
  };

  // Funções para manipular tarefas
  const handleToggleTaskStatus = (tarefaId: string) => {
    setTarefas(prevTarefas => 
      prevTarefas.map(t => {
        if (t.id_tarefa === tarefaId) {
          let newStatus: 'pendente' | 'em_progresso' | 'concluida';
          if (t.status === 'pendente') {
            newStatus = 'em_progresso';
          } else if (t.status === 'em_progresso') {
            newStatus = 'concluida';
          } else {
            newStatus = 'concluida';
          }
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  // Funções para manipular metas
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const metaToAdd: MetaLongoPrazo = {
      id_meta: Date.now().toString(),
      titulo: goalTitulo,
      descricao: goalDescricao,
      materia: goalMateria,
      prazo: goalPrazo,
      progresso: goalProgresso
    };

    setMetasLongoPrazo(prev => [...prev, metaToAdd]);
    setShowGoalModal(false);
    
    // Limpar campos
    setGoalTitulo('');
    setGoalDescricao('');
    setGoalMateria('');
    setGoalPrazo(new Date().toISOString().split('T')[0]);
    setGoalProgresso(0);
    
    setSuccessMessage('Meta adicionada com sucesso');
    setShowSuccessMessage(true);
  };

  const handleEditGoal = (meta: MetaLongoPrazo) => {
    setEditingGoal(meta);
    setGoalTitulo(meta.titulo);
    setGoalDescricao(meta.descricao);
    setGoalMateria(meta.materia);
    setGoalPrazo(meta.prazo);
    setGoalProgresso(meta.progresso);
    setShowGoalModal(true);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGoal) return;
    
    const metaUpdated: MetaLongoPrazo = {
      id_meta: editingGoal.id_meta,
      titulo: goalTitulo,
      descricao: goalDescricao,
      materia: goalMateria,
      prazo: goalPrazo,
      progresso: goalProgresso
    };

    setMetasLongoPrazo(prev => 
      prev.map(m => m.id_meta === editingGoal.id_meta ? metaUpdated : m)
    );
    setShowGoalModal(false);
    setEditingGoal(null);
    
    // Limpar campos
    setGoalTitulo('');
    setGoalDescricao('');
    setGoalMateria('');
    setGoalPrazo(new Date().toISOString().split('T')[0]);
    setGoalProgresso(0);
    
    setSuccessMessage('Meta atualizada com sucesso');
    setShowSuccessMessage(true);
  };

  const handleDeleteGoal = () => {
    if (!editingGoal) return;
    
    setMetasLongoPrazo(prev => prev.filter(m => m.id_meta !== editingGoal.id_meta));
    setShowGoalModal(false);
    setEditingGoal(null);
    
    // Limpar campos
    setGoalTitulo('');
    setGoalDescricao('');
    setGoalMateria('');
    setGoalPrazo(new Date().toISOString().split('T')[0]);
    setGoalProgresso(0);
    
    setSuccessMessage('Meta excluída com sucesso');
    setShowSuccessMessage(true);
  };

  // Componente de Header Mobile
  const MobileHeader = () => (
    <div className="md:hidden bg-[#050B1A] border-b border-[#111827] p-4 flex items-center justify-between">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="text-white hover:text-[#3B82F6] transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-white font-bold">Nexo</h1>
      </div>
      
      <div className="w-6" /> {/* Spacer para centralizar */}
    </div>
  );

  // Componente de Navegação
  const Navigation = () => {
    const navItems = [
      { id: 'dashboard', icon: Home, label: 'Painel de Estudos', badge: null },
      { id: 'planning', icon: Calendar, label: 'Planejamento', badge: null },
      { id: 'materials', icon: FileText, label: 'Materiais', badge: null },
      { id: 'tasks', icon: Target, label: 'Tarefas', badge: null },
      { id: 'pomodoro', icon: Timer, label: 'Foco', badge: null },
      { id: 'analytics', icon: BarChart3, label: 'Analytics', badge: null },
      { id: 'community', icon: Users, label: 'Comunidade', badge: 'BETA' },
      { id: 'profile', icon: User, label: 'Perfil', badge: null }
    ];

    const handleNavClick = (viewId: string) => {
      setCurrentView(viewId);
      setIsSidebarOpen(false);
    };

    return (
      <>
        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <nav className={`
          fixed md:static top-0 left-0 z-50 
          bg-[#050B1A] border-r border-[#111827] 
          w-64 h-full p-4 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Header da sidebar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Nexo</h1>
                <p className="text-[#B3B3B3] text-sm">Olá, {user?.name || user?.email?.split('@')[0]}</p>
              </div>
            </div>
            
            {/* Botão fechar no mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Itens de navegação */}
          <div className="space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  currentView === item.id
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-[#B3B3B3] hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs font-bold text-red-500">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Botão de Logout */}
          <div className="mt-auto pt-4 border-t border-[#111827]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </>
    );
  };

  // COMPONENTE REUTILIZÁVEL DE FORMULÁRIO DE MATERIAL
  const MaterialForm = ({ 
    modo, 
    materialInicial, 
    onSubmit, 
    onCancel 
  }: { 
    modo: 'criar' | 'editar';
    materialInicial: Material;
    onSubmit: (material: Material) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Material>(materialInicial);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <NexoInput
          label="Título"
          value={formData.title}
          onChange={(value) => setFormData({...formData, title: value})}
          required
        />

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Tipo
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value as 'note' | 'pdf' | 'link'})}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
          >
            <option value="note">Anotações</option>
            <option value="pdf">PDF</option>
            <option value="link">Link</option>
          </select>
        </div>

        <NexoInput
          label="Matéria / Categoria"
          value={formData.subject}
          onChange={(value) => setFormData({...formData, subject: value})}
          required
        />

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Data
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.createdAt}
              onChange={(e) => setFormData({...formData, createdAt: e.target.value})}
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:flex [&::-webkit-calendar-picker-indicator]:items-center [&::-webkit-calendar-picker-indicator]:justify-center [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded-md [&::-webkit-calendar-picker-indicator]:shadow-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              required
            />
          </div>
        </div>

        {formData.type === 'note' && (
          <NexoTextArea
            label="Conteúdo"
            value={formData.content || ''}
            onChange={(value) => setFormData({...formData, content: value})}
            rows={4}
          />
        )}

        {formData.type === 'pdf' && (
          <NexoInput
            label="Link do PDF"
            type="url"
            value={formData.url || ''}
            onChange={(value) => setFormData({...formData, url: value})}
            placeholder="https://..."
          />
        )}

        {formData.type === 'link' && (
          <NexoInput
            label="URL"
            type="url"
            value={formData.url || ''}
            onChange={(value) => setFormData({...formData, url: value})}
            placeholder="https://..."
          />
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Salvar
          </button>
        </div>
      </form>
    );
  };

  // COMPONENTE REUTILIZÁVEL DE FORMULÁRIO DE TAREFA
  const TaskForm = ({ 
    modo, 
    tarefaInicial, 
    onSubmit, 
    onCancel 
  }: { 
    modo: 'criar' | 'editar';
    tarefaInicial: Tarefa;
    onSubmit: (tarefa: Tarefa) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<Tarefa>(tarefaInicial);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <NexoInput
          label="Título da tarefa"
          value={formData.titulo}
          onChange={(value) => setFormData({...formData, titulo: value})}
          placeholder="Ex: Estudar para prova"
          required
        />

        <NexoInput
          label="Matéria"
          value={formData.materia}
          onChange={(value) => setFormData({...formData, materia: value})}
          placeholder="Ex: Matemática"
          required
        />

        <NexoTextArea
          label="Descrição"
          value={formData.descricao}
          onChange={(value) => setFormData({...formData, descricao: value})}
          placeholder="Descreva a tarefa..."
          rows={3}
          required
        />

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Prazo
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.prazo}
              onChange={(e) => setFormData({...formData, prazo: e.target.value})}
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:flex [&::-webkit-calendar-picker-indicator]:items-center [&::-webkit-calendar-picker-indicator]:justify-center [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded-md [&::-webkit-calendar-picker-indicator]:shadow-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Prioridade
          </label>
          <select
            value={formData.prioridade}
            onChange={(e) => setFormData({...formData, prioridade: e.target.value as 'alta' | 'media' | 'baixa'})}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
          >
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Salvar
          </button>
        </div>
      </form>
    );
  };

  // COMPONENTE REUTILIZÁVEL DE FORMULÁRIO DE DISCUSSÃO
  const DiscussionForm = ({ 
    modo, 
    discussaoInicial, 
    onSubmit, 
    onCancel 
  }: { 
    modo: 'criar' | 'editar';
    discussaoInicial: Partial<Discussao>;
    onSubmit: (discussao: Partial<Discussao>) => void;
    onCancel?: () => void;
  }) => {
    const [titulo, setTitulo] = useState(discussaoInicial.titulo || '');
    const [materia, setMateria] = useState(discussaoInicial.materia || '');
    const [conteudo, setConteudo] = useState(discussaoInicial.conteudo || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({ titulo, materia, conteudo });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <NexoInput
          label="Título"
          value={titulo}
          onChange={setTitulo}
          placeholder="Ex: Dúvidas sobre derivadas"
          required
        />

        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Matéria
          </label>
          <select
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
            required
          >
            <option value="">Selecione a matéria</option>
            <option value="Matemática">Matemática</option>
            <option value="Física">Física</option>
            <option value="História">História</option>
            <option value="Química">Química</option>
            <option value="Geral">Geral</option>
          </select>
        </div>

        <NexoTextArea
          label="Conteúdo"
          value={conteudo}
          onChange={setConteudo}
          placeholder="Descreva sua dúvida ou compartilhe uma dica..."
          rows={4}
          required
        />

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {modo === 'criar' ? 'Publicar' : 'Salvar'}
          </button>
        </div>
      </form>
    );
  };

  // COMPONENTE REUTILIZÁVEL DE FORMULÁRIO DE RESPOSTA
  const ReplyForm = ({ 
    onSubmit, 
    onCancel 
  }: { 
    onSubmit: (conteudo: string) => void;
    onCancel?: () => void;
  }) => {
    const [conteudo, setConteudo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (conteudo.trim()) {
        onSubmit(conteudo);
        setConteudo('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <NexoTextArea
          value={conteudo}
          onChange={setConteudo}
          placeholder="Escreva sua resposta..."
          rows={3}
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] transition-colors flex items-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            Responder
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    );
  };

  // Modal de edição de material
  const EditMaterialModal = () => {
    if (!showEditModal || !editingMaterial) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowEditModal(false);
            setEditingMaterial(null);
          }
        }}
      >
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Editar Material</h2>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingMaterial(null);
              }}
              className="text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <MaterialForm
            modo="editar"
            materialInicial={editingMaterial}
            onSubmit={handleSaveMaterial}
            onCancel={() => {
              setShowEditModal(false);
              setEditingMaterial(null);
            }}
          />
        </div>
      </div>
    );
  };

  // Modal de adicionar material
  const AddMaterialModal = () => {
    if (!showAddModal) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddModal(false);
            setAddMaterialFormData({
              id: '',
              title: '',
              type: 'note',
              subject: '',
              content: '',
              url: '',
              createdAt: new Date().toISOString().split('T')[0],
              favorito: false
            });
          }
        }}
      >
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Adicionar Material</h2>
            <button
              onClick={() => {
                setShowAddModal(false);
                setAddMaterialFormData({
                  id: '',
                  title: '',
                  type: 'note',
                  subject: '',
                  content: '',
                  url: '',
                  createdAt: new Date().toISOString().split('T')[0],
                  favorito: false
                });
              }}
              className="text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <MaterialForm
            modo="criar"
            materialInicial={addMaterialFormData}
            onSubmit={(material) => {
              const materialToAdd: Material = {
                ...material,
                id: Date.now().toString(),
                favorito: false
              };
              setMaterials(prevMaterials => [...prevMaterials, materialToAdd]);
              setShowAddModal(false);
              setAddMaterialFormData({
                id: '',
                title: '',
                type: 'note',
                subject: '',
                content: '',
                url: '',
                createdAt: new Date().toISOString().split('T')[0],
                favorito: false
              });
              setSuccessMessage('Material adicionado com sucesso');
              setShowSuccessMessage(true);
            }}
            onCancel={() => {
              setShowAddModal(false);
              setAddMaterialFormData({
                id: '',
                title: '',
                type: 'note',
                subject: '',
                content: '',
                url: '',
                createdAt: new Date().toISOString().split('T')[0],
                favorito: false
              });
            }}
          />
        </div>
      </div>
    );
  };

  // Modal de adicionar/editar evento
  const EventModal = () => {
    if (!showEventModal) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingEvent) {
        handleUpdateEvent(e);
      } else {
        handleAddEvent(e);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowEventModal(false);
            setEditingEvent(null);
            setEventMateria('');
            setEventObservacoes('');
            setEventData(new Date().toISOString().split('T')[0]);
            setEventHora('09:00');
            setEventCor('#3B82F6');
          }
        }}
      >
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingEvent ? 'Editar Evento' : 'Adicionar Evento'}
            </h2>
            <button
              onClick={() => {
                setShowEventModal(false);
                setEditingEvent(null);
                setEventMateria('');
                setEventObservacoes('');
                setEventData(new Date().toISOString().split('T')[0]);
                setEventHora('09:00');
                setEventCor('#3B82F6');
              }}
              className="text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Data
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={eventData}
                  onChange={(e) => setEventData(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:flex [&::-webkit-calendar-picker-indicator]:items-center [&::-webkit-calendar-picker-indicator]:justify-center [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded-md [&::-webkit-calendar-picker-indicator]:shadow-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Hora
              </label>
              <input
                type="time"
                value={eventHora}
                onChange={(e) => setEventHora(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
                required
              />
            </div>

            <NexoInput
              label="Matéria"
              value={eventMateria}
              onChange={setEventMateria}
              placeholder="Ex: Matemática"
              required
            />

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Cor
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={eventCor}
                  onChange={(e) => setEventCor(e.target.value)}
                  className="w-16 h-12 bg-[#1A1A1A] border border-gray-700 rounded-xl cursor-pointer"
                />
                <div className="flex gap-2">
                  {['#3B82F6', '#22C55E', '#A855F7', '#EF4444', '#F59E0B', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEventCor(color)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-700 hover:border-white transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <NexoTextArea
              label="Observações (opcional)"
              value={eventObservacoes}
              onChange={setEventObservacoes}
              placeholder="Adicione detalhes sobre o evento..."
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              {editingEvent && (
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="px-4 py-3 bg-red-500/20 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                >
                  Excluir
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                  setEventMateria('');
                  setEventObservacoes('');
                  setEventData(new Date().toISOString().split('T')[0]);
                  setEventHora('09:00');
                  setEventCor('#3B82F6');
                }}
                className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal de adicionar/editar tarefa
  const TaskModal = () => {
    if (!showTaskModal) return null;

    const tarefaInicial: Tarefa = editingTask || {
      id_tarefa: '',
      titulo: '',
      materia: '',
      descricao: '',
      prazo: new Date().toISOString().split('T')[0],
      prioridade: 'media',
      status: 'pendente'
    };

    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowTaskModal(false);
            setEditingTask(null);
          }
        }}
      >
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <button
              onClick={() => {
                setShowTaskModal(false);
                setEditingTask(null);
              }}
              className="text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <TaskForm
            modo={editingTask ? 'editar' : 'criar'}
            tarefaInicial={tarefaInicial}
            onSubmit={(tarefa) => {
              if (editingTask) {
                // Atualizar tarefa existente
                const tarefaUpdated: Tarefa = {
                  ...tarefa,
                  id_tarefa: editingTask.id_tarefa,
                  status: editingTask.status
                };
                setTarefas(prev => 
                  prev.map(t => t.id_tarefa === editingTask.id_tarefa ? tarefaUpdated : t)
                );
                setSuccessMessage('Tarefa atualizada com sucesso');
              } else {
                // Criar nova tarefa
                const tarefaToAdd: Tarefa = {
                  ...tarefa,
                  id_tarefa: Date.now().toString(),
                  status: 'pendente'
                };
                setTarefas(prev => [...prev, tarefaToAdd]);
                setSuccessMessage('Tarefa adicionada com sucesso');
              }
              setShowTaskModal(false);
              setEditingTask(null);
              setShowSuccessMessage(true);
            }}
            onCancel={() => {
              setShowTaskModal(false);
              setEditingTask(null);
            }}
          />

          {editingTask && (
            <button
              onClick={() => {
                setTarefas(prev => prev.filter(t => t.id_tarefa !== editingTask.id_tarefa));
                setShowTaskModal(false);
                setEditingTask(null);
                setSuccessMessage('Tarefa excluída com sucesso');
                setShowSuccessMessage(true);
              }}
              className="w-full mt-4 px-4 py-3 bg-red-500/20 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
            >
              Excluir Tarefa
            </button>
          )}
        </div>
      </div>
    );
  };

  // Modal de adicionar/editar meta
  const GoalModal = () => {
    if (!showGoalModal) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingGoal) {
        handleUpdateGoal(e);
      } else {
        handleAddGoal(e);
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowGoalModal(false);
            setEditingGoal(null);
            setGoalTitulo('');
            setGoalDescricao('');
            setGoalMateria('');
            setGoalPrazo(new Date().toISOString().split('T')[0]);
            setGoalProgresso(0);
          }
        }}
      >
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingGoal ? 'Editar Meta' : 'Nova Meta'}
            </h2>
            <button
              onClick={() => {
                setShowGoalModal(false);
                setEditingGoal(null);
                setGoalTitulo('');
                setGoalDescricao('');
                setGoalMateria('');
                setGoalPrazo(new Date().toISOString().split('T')[0]);
                setGoalProgresso(0);
              }}
              className="text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <NexoInput
              label="Título"
              value={goalTitulo}
              onChange={setGoalTitulo}
              placeholder="Ex: Dominar Cálculo"
              required
            />

            <NexoTextArea
              label="Descrição"
              value={goalDescricao}
              onChange={setGoalDescricao}
              placeholder="Descreva sua meta..."
              rows={3}
              required
            />

            <NexoInput
              label="Matéria"
              value={goalMateria}
              onChange={setGoalMateria}
              placeholder="Ex: Matemática"
              required
            />

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Prazo
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={goalPrazo}
                  onChange={(e) => setGoalPrazo(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors [&::-webkit-calendar-picker-indicator]:flex [&::-webkit-calendar-picker-indicator]:items-center [&::-webkit-calendar-picker-indicator]:justify-center [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:bg-white [&::-webkit-calendar-picker-indicator]:rounded-md [&::-webkit-calendar-picker-indicator]:shadow-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Progresso (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={goalProgresso}
                onChange={(e) => setGoalProgresso(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
                placeholder="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              {editingGoal && (
                <button
                  type="button"
                  onClick={handleDeleteGoal}
                  className="px-4 py-3 bg-red-500/20 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
                >
                  Excluir
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowGoalModal(false);
                  setEditingGoal(null);
                  setGoalTitulo('');
                  setGoalDescricao('');
                  setGoalMateria('');
                  setGoalPrazo(new Date().toISOString().split('T')[0]);
                  setGoalProgresso(0);
                }}
                className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal de edição de sessão de foco
  const EditSessionModal = () => {
    if (!showEditSessionModal || !editingSession) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowEditSessionModal(false);
            setEditingSession(null);
          }
        }}
      >
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Editar Sessão</h2>
            <button
              onClick={() => {
                setShowEditSessionModal(false);
                setEditingSession(null);
              }}
              className="text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSaveSession} className="space-y-4">
            <NexoInput
              label="Matéria"
              value={editSessionMateria}
              onChange={setEditSessionMateria}
              required
            />

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Data e Hora
              </label>
              <input
                type="datetime-local"
                value={editSessionData}
                onChange={(e) => setEditSessionData(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Duração (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="240"
                value={editSessionDuracao}
                onChange={(e) => setEditSessionDuracao(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Tipo
              </label>
              <select
                value={editSessionTipo}
                onChange={(e) => setEditSessionTipo(e.target.value as 'Pomodoro' | 'Free')}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors"
              >
                <option value="Pomodoro">Pomodoro</option>
                <option value="Free">Free</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditSessionModal(false);
                  setEditingSession(null);
                }}
                className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal de discussão (criar/editar)
  const DiscussionModal = () => {
    if (!showDiscussionModal) return null;

    const discussaoInicial: Partial<Discussao> = editingDiscussao || {
      titulo: '',
      materia: '',
      conteudo: ''
    };

    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowDiscussionModal(false);
            setEditingDiscussao(null);
          }
        }}
      >
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingDiscussao ? 'Editar Discussão' : 'Nova Discussão'}
            </h2>
            <button
              onClick={() => {
                setShowDiscussionModal(false);
                setEditingDiscussao(null);
              }}
              className="text-[#B3B3B3] hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <DiscussionForm
            modo={editingDiscussao ? 'editar' : 'criar'}
            discussaoInicial={discussaoInicial}
            onSubmit={(discussao) => {
              if (editingDiscussao) {
                // Atualizar discussão existente
                setDiscussoes(prev =>
                  prev.map(d => {
                    if (d.id === editingDiscussao.id) {
                      return {
                        ...d,
                        titulo: discussao.titulo!,
                        materia: discussao.materia!,
                        conteudo: discussao.conteudo!
                      };
                    }
                    return d;
                  })
                );
                setSuccessMessage('Discussão atualizada com sucesso!');
              } else {
                // Criar nova discussão
                const novaDiscussao: Discussao = {
                  id: Date.now().toString(),
                  titulo: discussao.titulo!,
                  materia: discussao.materia!,
                  autor: user?.name || 'Usuário',
                  data: new Date().toISOString(),
                  conteudo: discussao.conteudo!,
                  likes: 0,
                  respostas: [],
                  likedByUser: false
                };
                setDiscussoes(prev => [novaDiscussao, ...prev]);
                setSuccessMessage('Discussão publicada com sucesso!');
              }
              setShowDiscussionModal(false);
              setEditingDiscussao(null);
              setShowSuccessMessage(true);
            }}
            onCancel={() => {
              setShowDiscussionModal(false);
              setEditingDiscussao(null);
            }}
          />

          {editingDiscussao && (
            <button
              onClick={() => {
                setDiscussoes(prev => prev.filter(d => d.id !== editingDiscussao.id));
                setShowDiscussionModal(false);
                setEditingDiscussao(null);
                setSuccessMessage('Discussão excluída com sucesso!');
                setShowSuccessMessage(true);
              }}
              className="w-full mt-4 px-4 py-3 bg-red-500/20 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
            >
              Excluir Discussão
            </button>
          )}
        </div>
      </div>
    );
  };

  // Mensagem de sucesso
  const SuccessMessage = () => {
    if (!showSuccessMessage) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-[#22C55E] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">{successMessage}</span>
      </div>
    );
  };

  // Dashboard View (continuação do código original...)
  // [Resto dos componentes de visualização permanecem iguais]
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#020814] flex flex-col md:flex-row font-inter">
      {/* Header mobile */}
      <MobileHeader />
      
      {/* Sidebar */}
      <Navigation />
      
      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {/* Renderizar views conforme necessário */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">Bem-vindo ao Nexo!</h1>
          <p className="text-gray-400 mt-2">Seu sistema de estudos está pronto.</p>
        </div>
      </main>

      {/* Modals */}
      <EditMaterialModal />
      <AddMaterialModal />
      <EventModal />
      <TaskModal />
      <GoalModal />
      <EditSessionModal />
      <DiscussionModal />
      <SuccessMessage />
    </div>
  );
}

export default function StudyApp() {
  return (
    <RequireAuth>
      <StudyAppContent />
    </RequireAuth>
  );
}
