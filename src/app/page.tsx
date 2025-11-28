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
  ArrowRight, Zap, Activity, Focus, Menu, X
} from 'lucide-react';
import { NexoInput, NexoTextArea } from '@/components/NexoField';
import { SharedProfileForm } from '@/components/SharedProfileForm';

// Tipos de dados
interface User {
  name: string;
  course: string;
  goals: string;
  avatar?: string;
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

export default function StudyApp() {
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
  const [currentView, setCurrentView] = useState('onboarding');
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
  const [showOnboarding, setShowOnboarding] = useState(true);
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

  // Componente de Onboarding
  const OnboardingView = () => {
    const [formData, setFormData] = useState({
      name: '',
      course: '',
      goals: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name && formData.course && formData.goals) {
        setUser(formData);
        setCurrentView('dashboard');
        setShowOnboarding(false);
      }
    };

    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Gradiente de fundo diagonal */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#1d4ed8] to-[#22c55e]" />
        
        {/* Bolhas desfocadas no fundo */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#1d4ed8] rounded-full opacity-20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#8b5cf6] rounded-full opacity-20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#22c55e] rounded-full opacity-15 blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Cartão com efeito glassmorphism */}
        <div className="relative max-w-md w-full backdrop-blur-xl bg-[#0b1120]/30 border border-cyan-400/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#007BFF] to-[#00FF88] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Nexo</h1>
            <p className="text-xl text-gray-200 mb-2">Sempre + Estudo.</p>
            <p className="text-sm text-gray-300">Sistema de estudos para organizar sua rotina e acompanhar seu progresso.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <NexoInput
              label="Qual é o seu nome?"
              value={formData.name}
              onChange={(value) => {
                // Remove números (0-9) do texto digitado
                const sanitizedValue = value.replace(/[0-9]/g, '');
                setFormData({...formData, name: sanitizedValue});
              }}
              placeholder="Digite seu nome"
              required
            />

            <NexoInput
              label="Curso ou área de estudo"
              value={formData.course}
              onChange={(value) => {
                // Remove números (0-9) do texto digitado
                const sanitizedValue = value.replace(/[0-9]/g, '');
                setFormData({...formData, course: sanitizedValue});
              }}
              placeholder="Ex: Engenharia, Medicina, etc."
              required
            />

            <NexoTextArea
              label="Objetivos acadêmicos"
              value={formData.goals}
              onChange={(value) => {
                // Remove números (0-9) do texto digitado
                const sanitizedValue = value.replace(/[0-9]/g, '');
                setFormData({...formData, goals: sanitizedValue});
              }}
              placeholder="Descreva seus principais objetivos..."
              rows={3}
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#007BFF] to-[#00FF88] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              Começar jornada
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
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
          w-64 h-full p-4
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
                <p className="text-[#B3B3B3] text-sm">Olá, {user?.name}</p>
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
          <div className="space-y-2">
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

  // Dashboard View
  const DashboardView = () => {
    const tarefasHoje = getTarefasConcluidasHoje();
    const tempoHoje = getTempoEstudoHoje();
    const pomodorosHoje = getPomodorosHoje();
    const progressoSemanal = getProgressoSemanal();

    // Próximas tarefas (não concluídas, ordenadas por prazo)
    const proximasTarefas = tarefas
      .filter(t => t.status !== 'concluida')
      .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
      .slice(0, 3);

    // Metas em progresso (progresso < 100)
    const metasEmProgresso = metasLongoPrazo
      .filter(m => m.progresso < 100)
      .slice(0, 2);

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel de Estudos</h1>
            <p className="text-[#B3B3B3]">Visão geral dos seus estudos</p>
          </div>
          <div className="flex items-center gap-2 text-[#B3B3B3]">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <button
            onClick={() => setCurrentView('tasks')}
            className="bg-[#050816] border border-[#111827] rounded-2xl p-4 md:p-6 hover:border-[#3B82F6] transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-[#3B82F6]" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">
                {tarefasHoje.concluidas}/{tarefasHoje.total}
              </span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Tarefas Concluídas</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Hoje</p>
          </button>

          <button
            onClick={() => setCurrentView('pomodoro')}
            className="bg-[#050816] border border-[#111827] rounded-2xl p-4 md:p-6 hover:border-[#22C55E] transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#22C55E]/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#22C55E]" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">{tempoHoje}h</span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Tempo de Estudo</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Hoje</p>
          </button>

          <button
            onClick={() => setCurrentView('pomodoro')}
            className="bg-[#050816] border border-[#111827] rounded-2xl p-4 md:p-6 hover:border-[#3B82F6] transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#3B82F6]" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">{pomodorosHoje}</span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Pomodoros</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Hoje</p>
          </button>

          <button
            onClick={() => setCurrentView('tasks')}
            className="bg-[#050816] border border-[#111827] rounded-2xl p-4 md:p-6 hover:border-[#22C55E] transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#22C55E]/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#22C55E]" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">{progressoSemanal}%</span>
            </div>
            <h3 className="text-white font-medium text-sm md:text-base">Progresso</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Semanal</p>
          </button>
        </div>

        {/* Próximas tarefas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#050816] border border-[#111827] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Próximas Tarefas</h2>
              <button 
                onClick={() => setCurrentView('tasks')}
                className="text-[#3B82F6] hover:text-[#2563EB] transition-colors text-sm"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {proximasTarefas.length > 0 ? (
                proximasTarefas.map((tarefa) => (
                  <button
                    key={tarefa.id_tarefa}
                    onClick={() => {
                      setEditingTask(tarefa);
                      setShowTaskModal(true);
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl hover:bg-[#2A2A2A] transition-colors text-left"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      tarefa.prioridade === 'alta' ? 'bg-red-500' :
                      tarefa.prioridade === 'media' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{tarefa.titulo}</h3>
                      <p className="text-[#B3B3B3] text-xs">{tarefa.materia}</p>
                    </div>
                    <span className="text-[#B3B3B3] text-xs whitespace-nowrap">
                      {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-[#B3B3B3] text-sm text-center py-4">
                  Nenhuma tarefa pendente
                </p>
              )}
            </div>
          </div>

          <div className="bg-[#050816] border border-[#111827] rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold text-white">Metas em Progresso</h2>
              <button 
                onClick={() => setCurrentView('tasks')}
                className="text-[#3B82F6] hover:text-[#2563EB] transition-colors text-sm"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {metasEmProgresso.length > 0 ? (
                metasEmProgresso.map((meta) => (
                  <button
                    key={meta.id_meta}
                    onClick={() => handleEditGoal(meta)}
                    className="w-full p-4 bg-[#1A1A1A] rounded-xl hover:bg-[#2A2A2A] transition-colors text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium text-sm">{meta.titulo}</h3>
                      <span className="text-[#22C55E] font-bold text-sm">{meta.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="bg-[#3B82F6] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${meta.progresso}%` }}
                      />
                    </div>
                    <p className="text-[#B3B3B3] text-xs">{meta.materia}</p>
                  </button>
                ))
              ) : (
                <p className="text-[#B3B3B3] text-sm text-center py-4">
                  Nenhuma meta em progresso
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Planning View
  const PlanningView = () => {
    const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
    
    // Obter semana atual
    const getWeekDays = () => {
      const today = new Date();
      const currentDay = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay);
      
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
      }
      return weekDays;
    };

    // Obter dias do mês atual
    const getMonthDays = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const days = [];
      const startPadding = firstDay.getDay();
      
      // Adicionar dias vazios do início
      for (let i = 0; i < startPadding; i++) {
        days.push(null);
      }
      
      // Adicionar dias do mês
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
      
      return days;
    };

    const weekDays = getWeekDays();
    const monthDays = getMonthDays();
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Filtrar eventos por data
    const getEventosForDate = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return eventosEstudo.filter(e => e.data === dateStr);
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Planejamento</h1>
            <p className="text-[#B3B3B3]">Organize seus horários de estudo</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'week' ? 'bg-[#3B82F6] text-white' : 'bg-[#141414] text-[#B3B3B3]'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                viewMode === 'month' ? 'bg-[#3B82F6] text-white' : 'bg-[#141414] text-[#B3B3B3]'
              }`}
            >
              Mês
            </button>
          </div>
        </div>

        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
          {viewMode === 'week' ? (
            <>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mb-6">
                {weekDays.map((day, index) => {
                  const eventos = getEventosForDate(day);
                  return (
                    <div key={index} className="text-center min-w-0">
                      <h3 className="text-white font-medium mb-2 text-xs md:text-sm truncate">
                        {diasSemana[day.getDay()]}
                      </h3>
                      <p className="text-[#B3B3B3] text-xs mb-2">{day.getDate()}</p>
                      <div className="space-y-1 sm:space-y-2">
                        {eventos.map((evento) => (
                          <button
                            key={evento.id_evento}
                            onClick={() => handleEditEvent(evento)}
                            className="w-full rounded-lg p-1 md:p-2 min-h-[3rem] sm:min-h-[3.5rem] flex flex-col justify-center hover:opacity-80 transition-opacity"
                            style={{ 
                              backgroundColor: `${evento.cor}20`,
                              borderColor: evento.cor,
                              borderWidth: '1px'
                            }}
                          >
                            <p className="text-xs font-medium leading-tight" style={{ color: evento.cor }}>
                              {evento.hora_inicio}
                            </p>
                            <p className="text-white text-[10px] sm:text-xs leading-tight truncate" title={evento.materia}>
                              <span className="hidden sm:inline">{evento.materia}</span>
                              <span className="sm:hidden">{evento.materia.substring(0, 3)}</span>
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-white font-bold text-lg text-center">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-[#B3B3B3] text-xs font-medium py-2">
                    {dia}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {monthDays.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="aspect-square" />;
                  }
                  const eventos = getEventosForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index} 
                      className={`aspect-square border border-gray-700 rounded-lg p-1 ${
                        isToday ? 'bg-[#3B82F6]/10 border-[#3B82F6]' : ''
                      }`}
                    >
                      <div className="text-white text-xs font-medium mb-1">{day.getDate()}</div>
                      <div className="space-y-1">
                        {eventos.slice(0, 2).map((evento) => (
                          <button
                            key={evento.id_evento}
                            onClick={() => handleEditEvent(evento)}
                            className="w-full text-[8px] sm:text-[10px] px-1 py-0.5 rounded truncate hover:opacity-80 transition-opacity"
                            style={{ 
                              backgroundColor: evento.cor,
                              color: 'white'
                            }}
                            title={`${evento.hora_inicio} - ${evento.materia}`}
                          >
                            {evento.materia}
                          </button>
                        ))}
                        {eventos.length > 2 && (
                          <div className="text-[8px] text-[#B3B3B3] text-center">
                            +{eventos.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <button 
            onClick={() => {
              setShowEventModal(true);
              setEditingEvent(null);
              setEventMateria('');
              setEventObservacoes('');
              setEventData(new Date().toISOString().split('T')[0]);
              setEventHora('09:00');
              setEventCor('#3B82F6');
            }}
            className="w-full bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6"
          >
            <Plus className="w-5 h-5" />
            Adicionar Evento
          </button>
        </div>
      </div>
    );
  };

  // Materials View
  const MaterialsView = () => {
    const [selectedType, setSelectedType] = useState<'all' | 'note' | 'pdf' | 'link'>('all');
    
    const filteredMaterials = selectedType === 'all' 
      ? materials 
      : materials.filter(m => m.type === selectedType);

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Materiais</h1>
            <p className="text-[#B3B3B3]">Organize seus recursos de estudo</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Material
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todos', icon: FileText },
            { id: 'note', label: 'Anotações', icon: Edit },
            { id: 'pdf', label: 'PDFs', icon: Download },
            { id: 'link', label: 'Links', icon: Link }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedType(filter.id as any)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                selectedType === filter.id 
                  ? 'bg-[#3B82F6] text-white' 
                  : 'bg-[#141414] text-[#B3B3B3] hover:bg-[#1A1A1A]'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Lista de materiais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredMaterials.map((material) => (
            <div key={material.id} className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-[#3B82F6] transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                  material.type === 'note' ? 'bg-blue-500/20' :
                  material.type === 'pdf' ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}>
                  {material.type === 'note' && <Edit className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />}
                  {material.type === 'pdf' && <Download className="w-5 h-5 md:w-6 md:h-6 text-red-500" />}
                  {material.type === 'link' && <Link className="w-5 h-5 md:w-6 md:h-6 text-green-500" />}
                </div>
                <button 
                  onClick={() => handleToggleFavorite(material.id)}
                  className="text-[#B3B3B3] hover:text-yellow-500 transition-colors"
                >
                  <Star 
                    className={`w-4 h-4 md:w-5 md:h-5 ${
                      material.favorito ? 'fill-yellow-500 text-yellow-500' : ''
                    }`}
                  />
                </button>
              </div>
              
              <h3 className="text-white font-medium mb-2 text-sm md:text-base">{material.title}</h3>
              <p className="text-[#B3B3B3] text-xs md:text-sm mb-4">{material.subject}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-[#B3B3B3] text-xs">
                  {new Date(material.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditMaterial(material)}
                    className="text-[#B3B3B3] hover:text-[#3B82F6] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="text-[#B3B3B3] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Tasks View
  const TasksView = () => {
    const filteredTarefas = taskFilter === 'all' ? tarefas : tarefas.filter(t => t.status === taskFilter);

    // Contadores dinâmicos
    const contadores = {
      all: tarefas.length,
      pendente: tarefas.filter(t => t.status === 'pendente').length,
      em_progresso: tarefas.filter(t => t.status === 'em_progresso').length,
      concluida: tarefas.filter(t => t.status === 'concluida').length
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Tarefas e Metas</h1>
            <p className="text-[#B3B3B3]">Gerencie suas atividades acadêmicas</p>
          </div>
          <button 
            onClick={() => setShowTaskModal(true)}
            className="bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todas', count: contadores.all },
            { id: 'pendente', label: 'Pendentes', count: contadores.pendente },
            { id: 'em_progresso', label: 'Em Progresso', count: contadores.em_progresso },
            { id: 'concluida', label: 'Concluídas', count: contadores.concluida }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setTaskFilter(filterOption.id as any)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm ${
                taskFilter === filterOption.id 
                  ? 'bg-[#3B82F6] text-white' 
                  : 'bg-[#141414] text-[#B3B3B3] hover:bg-[#1A1A1A]'
              }`}
            >
              <span className="hidden sm:inline">{filterOption.label}</span>
              <span className="sm:hidden">{filterOption.label.split(' ')[0]}</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>

        {/* Lista de tarefas */}
        <div className="space-y-4">
          {filteredTarefas.map((tarefa) => (
            <div key={tarefa.id_tarefa} className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-[#3B82F6] transition-colors">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => handleToggleTaskStatus(tarefa.id_tarefa)}
                  className="mt-1 flex-shrink-0"
                >
                  {tarefa.status === 'concluida' ? (
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#22C55E]" />
                  ) : tarefa.status === 'em_progresso' ? (
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-[#3B82F6] flex items-center justify-center">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#3B82F6]" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 md:w-6 md:h-6 text-[#B3B3B3]" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className={`font-medium text-sm md:text-base ${tarefa.status === 'concluida' ? 'text-[#B3B3B3] line-through' : 'text-white'}`}>
                      {tarefa.titulo}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tarefa.prioridade === 'alta' ? 'bg-red-500/20 text-red-500' :
                        tarefa.prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {tarefa.prioridade === 'alta' ? 'Alta' : tarefa.prioridade === 'media' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-[#B3B3B3] mb-3">
                    <span>{tarefa.materia}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Prazo: {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {tarefa.descricao && (
                    <p className="text-[#B3B3B3] text-xs md:text-sm mb-3">{tarefa.descricao}</p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingTask(tarefa);
                        setShowTaskModal(true);
                      }}
                      className="text-[#B3B3B3] hover:text-[#3B82F6] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setTarefas(prev => prev.filter(t => t.id_tarefa !== tarefa.id_tarefa));
                        setSuccessMessage('Tarefa excluída com sucesso');
                        setShowSuccessMessage(true);
                      }}
                      className="text-[#B3B3B3] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seção de Metas */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">Metas de Longo Prazo</h2>
            <button 
              onClick={() => setShowGoalModal(true)}
              className="bg-[#141414] border border-gray-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-[#1A1A1A] transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Meta
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {metasLongoPrazo.map((meta) => (
              <button
                key={meta.id_meta}
                onClick={() => handleEditGoal(meta)}
                className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-[#3B82F6] transition-colors text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1 text-sm md:text-base">{meta.titulo}</h3>
                    <p className="text-[#B3B3B3] text-xs md:text-sm">{meta.descricao}</p>
                  </div>
                  <span className="text-[#22C55E] font-bold text-lg ml-2">{meta.progresso}%</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                  <div 
                    className="bg-[#3B82F6] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${meta.progresso}%` }}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm">
                  <span className="text-[#B3B3B3]">{meta.materia}</span>
                  <span className="text-[#B3B3B3]">
                    Prazo: {new Date(meta.prazo).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Pomodoro View (Timer de Foco)
  const PomodoroView = () => {
    const handlePlayPause = () => {
      setIsTimerRunning(!isTimerRunning);
    };

    const handleReset = () => {
      setIsTimerRunning(false);
      setRemainingSeconds(customDuration * 60);
    };

    return (
      <PreferenciasContext.Provider value={{ preferencias, setPreferencias }}>
        <div className="p-4 md:p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Timer de Foco</h1>
            <p className="text-[#B3B3B3]">Técnica Pomodoro para máxima produtividade</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-[#141414] border border-gray-800 rounded-3xl p-6 md:p-8 text-center">
              <div className="mb-6">
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-full border-8 border-[#3B82F6] bg-[#3B82F6]/10 flex items-center justify-center mb-4">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl md:text-5xl font-bold text-white tracking-wider">
                      {formatTimeDisplay(remainingSeconds)}
                    </span>
                    <span className="text-xs md:text-sm text-gray-400 tracking-wide">
                      Horas • Minutos • Segundos
                    </span>
                  </div>
                </div>
                
                <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                  Tempo de Foco
                </h2>
                <p className="text-[#B3B3B3] text-sm">
                  Concentre-se na sua tarefa atual
                </p>
              </div>

              {/* Campo de duração customizável */}
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Duração da sessão (minutos)
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={customDuration}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                  disabled={isTimerRunning}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white text-center text-lg font-bold focus:border-[#3B82F6] focus:outline-none transition-colors disabled:opacity-50"
                />
                <p className="text-[#B3B3B3] text-xs mt-2">
                  Padrão: 25 min (Pomodoro) | Máximo: 240 min (4 horas)
                </p>
              </div>

              {/* Aviso de limite de 4 horas */}
              {showDurationWarning && (
                <div className="mb-6 p-4 bg-orange-500/20 border border-orange-500 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-orange-500 text-sm text-left">
                      Estudar mais de 4 horas seguidas pode reduzir a qualidade do aprendizado, aumentar a fadiga e prejudicar sua concentração. Faça pausas regulares para ter um estudo mais eficiente.
                    </p>
                  </div>
                </div>
              )}

              {/* Seletor de matéria */}
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Matéria
                </label>
                <select
                  value={selectedMateria}
                  onChange={(e) => setSelectedMateria(e.target.value)}
                  disabled={isTimerRunning}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-colors disabled:opacity-50"
                >
                  <option value="Geral">Geral</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Física">Física</option>
                  <option value="História">História</option>
                  <option value="Química">Química</option>
                </select>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={handlePlayPause}
                  className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-colors ${
                    isTimerRunning 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                  }`}
                >
                  {isTimerRunning ? (
                    <Pause className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  ) : (
                    <Play className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="w-10 h-10 md:w-12 md:h-12 bg-[#141414] border border-gray-700 rounded-full flex items-center justify-center hover:bg-[#1A1A1A] transition-colors"
                >
                  <RotateCcw className="w-5 h-5 md:w-6 md:h-6 text-[#B3B3B3]" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-[#1A1A1A] rounded-xl p-3 md:p-4">
                  <div className="text-xl md:text-2xl font-bold text-[#3B82F6] mb-1">{getPomodorosHoje()}</div>
                  <div className="text-[#B3B3B3] text-xs md:text-sm">Pomodoros Hoje</div>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-3 md:p-4">
                  <div className="text-xl md:text-2xl font-bold text-[#22C55E] mb-1">
                    {getTempoTotal()}h
                  </div>
                  <div className="text-[#B3B3B3] text-xs md:text-sm">Tempo Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sessões recentes */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-4">Sessões Recentes</h3>
            <div className="space-y-3">
              {sessoesFoco.slice(0, 5).map((sessao) => (
                <div
                  key={sessao.id_sessao}
                  className="w-full bg-[#141414] border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-[#3B82F6] transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${
                      sessao.tipo === 'Pomodoro' ? 'bg-[#3B82F6]' : 'bg-[#22C55E]'
                    }`} />
                    <div className="text-left flex-1">
                      <h4 className="text-white font-medium text-sm">{sessao.materia}</h4>
                      <p className="text-[#B3B3B3] text-xs">
                        {new Date(sessao.data).toLocaleDateString('pt-BR')} às {new Date(sessao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-white font-medium text-sm">{sessao.duracao_minutos}min</div>
                      <div className="text-[#B3B3B3] text-xs">{sessao.tipo}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSession(sessao)}
                        className="text-[#B3B3B3] hover:text-[#3B82F6] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(sessao.id_sessao)}
                        className="text-[#B3B3B3] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de detalhe da sessão */}
          {showSessionDetail && (
            <div 
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowSessionDetail(null);
                }
              }}
            >
              <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Detalhes da Sessão</h2>
                  <button
                    onClick={() => setShowSessionDetail(null)}
                    className="text-[#B3B3B3] hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#B3B3B3] text-sm mb-1">Matéria</label>
                    <p className="text-white font-medium">{showSessionDetail.materia}</p>
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] text-sm mb-1">Data e Hora</label>
                    <p className="text-white font-medium">
                      {new Date(showSessionDetail.data).toLocaleDateString('pt-BR')} às {new Date(showSessionDetail.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] text-sm mb-1">Duração</label>
                    <p className="text-white font-medium">{showSessionDetail.duracao_minutos} minutos</p>
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] text-sm mb-1">Tipo</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      showSessionDetail.tipo === 'Pomodoro' 
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6]' 
                        : 'bg-[#22C55E]/20 text-[#22C55E]'
                    }`}>
                      {showSessionDetail.tipo}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowSessionDetail(null)}
                  className="w-full mt-6 px-4 py-3 bg-[#1A1A1A] border border-gray-700 text-white rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </PreferenciasContext.Provider>
    );
  };

  // Analytics View
  const AnalyticsView = () => {
    // Função para obter início e fim da semana atual
    const getWeekRange = (date: Date) => {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda-feira
      const monday = new Date(date.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      return { monday, sunday };
    };

    // Calcular horas de estudo da semana atual
    const calculateWeeklyHours = (isCurrentWeek: boolean = true) => {
      const now = new Date();
      const offset = isCurrentWeek ? 0 : 7;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - offset);
      
      const { monday, sunday } = getWeekRange(new Date(targetDate));
      
      const totalMinutes = sessoesFoco
        .filter(s => {
          const sessionDate = new Date(s.data);
          return sessionDate >= monday && sessionDate <= sunday;
        })
        .reduce((acc, s) => acc + s.duracao_minutos, 0);
      
      return totalMinutes / 60; // Converter para horas
    };

    const horasSemanaAtual = calculateWeeklyHours(true);
    const horasSemanaAnterior = calculateWeeklyHours(false);
    const variacaoPercentual = horasSemanaAnterior > 0 
      ? ((horasSemanaAtual - horasSemanaAnterior) / horasSemanaAnterior) * 100 
      : 0;

    // Calcular taxa de conclusão
    const calculateCompletionRate = () => {
      const { monday, sunday } = getWeekRange(new Date());
      
      const tarefasSemana = tarefas.filter(t => {
        const prazo = new Date(t.prazo);
        return prazo >= monday && prazo <= sunday;
      });
      
      if (tarefasSemana.length === 0) return 0;
      
      const tarefasConcluidas = tarefasSemana.filter(t => t.status === 'concluida').length;
      return Math.round((tarefasConcluidas / tarefasSemana.length) * 100);
    };

    const taxaConclusao = calculateCompletionRate();

    // Calcular média diária
    const totalMinutosSemana = sessoesFoco
      .filter(s => {
        const { monday, sunday } = getWeekRange(new Date());
        const sessionDate = new Date(s.data);
        return sessionDate >= monday && sessionDate <= sunday;
      })
      .reduce((acc, s) => acc + s.duracao_minutos, 0);
    
    const mediaDiaria = (totalMinutosSemana / 7) / 60; // Converter para horas
    const metaDiaria = 2; // Meta de 2h/dia

    // Calcular dados semanais para o gráfico
    const weeklyData = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
      const { monday } = getWeekRange(new Date());
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + index);
      
      const dayMinutes = sessoesFoco
        .filter(s => {
          const sessionDate = new Date(s.data);
          return sessionDate.toDateString() === targetDate.toDateString();
        })
        .reduce((acc, s) => acc + s.duracao_minutos, 0);
      
      return {
        day,
        hours: parseFloat((dayMinutes / 60).toFixed(1))
      };
    });

    // Calcular distribuição por matéria
    const subjectData = (() => {
      const materiaMap = new Map<string, number>();
      
      sessoesFoco.forEach(s => {
        const current = materiaMap.get(s.materia) || 0;
        materiaMap.set(s.materia, current + s.duracao_minutos);
      });
      
      const colors = ['#3B82F6', '#22C55E', '#FF6B6B', '#FFD93D', '#A855F7', '#EC4899'];
      let colorIndex = 0;
      
      const totalMinutes = Array.from(materiaMap.values()).reduce((acc, m) => acc + m, 0);
      
      return Array.from(materiaMap.entries())
        .map(([subject, minutes]) => ({
          subject,
          hours: parseFloat((minutes / 60).toFixed(1)),
          percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
          color: colors[colorIndex++ % colors.length]
        }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 6); // Top 6 matérias
    })();

    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Insights e Analytics</h1>
          <p className="text-[#B3B3B3]">Acompanhe sua evolução nos estudos</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1 - Horas de estudo */}
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3B82F6]/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#3B82F6]" />
              </div>
              <TrendingUp className={`w-5 h-5 md:w-6 md:h-6 ${variacaoPercentual >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              {horasSemanaAtual.toFixed(1)}h
            </h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Esta semana</p>
            <p className={`text-xs mt-1 ${variacaoPercentual >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
              {variacaoPercentual >= 0 ? '+' : ''}{variacaoPercentual.toFixed(0)}% vs semana anterior
            </p>
          </div>

          {/* Card 2 - Taxa de conclusão */}
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#22C55E]/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-[#22C55E]" />
              </div>
              <Activity className="w-5 h-5 md:w-6 md:h-6 text-[#3B82F6]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{taxaConclusao}%</h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Taxa de conclusão</p>
            <p className="text-[#3B82F6] text-xs mt-1">Meta: 90%</p>
          </div>

          {/* Card 3 - Dias consecutivos */}
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Focus className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
              </div>
              <Award className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              {usuarioGamificacao.streak_dias}
            </h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Dias consecutivos</p>
            {usuarioGamificacao.streak_dias >= (usuarioGamificacao.recorde_streak || 0) && (
              <p className="text-yellow-500 text-xs mt-1">Recorde pessoal!</p>
            )}
          </div>

          {/* Card 4 - Média diária */}
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              </div>
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#B3B3B3]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              {mediaDiaria.toFixed(1)}h
            </h3>
            <p className="text-[#B3B3B3] text-xs md:text-sm">Média diária</p>
            <p className={`text-xs mt-1 ${mediaDiaria >= metaDiaria ? 'text-orange-500' : 'text-[#B3B3B3]'}`}>
              {mediaDiaria >= metaDiaria ? 'Acima da meta' : 'Abaixo da meta'}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico semanal */}
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-4">Horas de Estudo - Semana</h3>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="text-[#B3B3B3] text-sm w-8">{day.day}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-[#3B82F6] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(day.hours / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium w-12">{day.hours}h</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por matéria */}
          <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-4">Tempo por Matéria</h3>
            <div className="space-y-4">
              {subjectData.map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-white font-medium text-sm">{subject.subject}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-sm">{subject.hours}h</span>
                    <div className="text-[#B3B3B3] text-xs">
                      {subject.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4">Insights Personalizados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] rounded-xl p-4 border-l-4 border-[#22C55E]">
              <h4 className="text-[#22C55E] font-medium mb-2">Parabéns!</h4>
              <p className="text-[#B3B3B3] text-sm">
                Você manteve uma rotina consistente esta semana. Continue assim!
              </p>
            </div>
            <div className="bg-[#1A1A1A] rounded-xl p-4 border-l-4 border-[#3B82F6]">
              <h4 className="text-[#3B82F6] font-medium mb-2">Dica</h4>
              <p className="text-[#B3B3B3] text-sm">
                Considere aumentar o tempo de Física para equilibrar com Matemática.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Community View
  const CommunityView = () => {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Comunidade</h1>
            <p className="text-[#B3B3B3] mb-1">Conecte-se com outros estudantes</p>
            <p className="text-[#9CA3AF] text-sm">Versão beta — esta área ainda está em desenvolvimento e alguns recursos podem não estar disponíveis.</p>
          </div>
          <button 
            onClick={() => setShowDiscussionModal(true)}
            className="bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Discussão
          </button>
        </div>

        {/* Criar post */}
        <div ref={formRef} className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-white mb-4">Compartilhe uma dica ou dúvida</h3>
          <DiscussionForm
            modo="criar"
            discussaoInicial={{}}
            onSubmit={(discussao) => {
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
              setShowSuccessMessage(true);
            }}
          />
        </div>

        {/* Posts da comunidade */}
        <div className="space-y-4">
          {discussoes.map((discussao) => (
            <div key={discussao.id} className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6 hover:border-[#3B82F6] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs md:text-sm">
                    {discussao.autor.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-white font-medium text-sm">{discussao.autor}</h3>
                    <span className="text-[#B3B3B3] text-sm">•</span>
                    <span className="text-[#B3B3B3] text-sm">
                      {new Date(discussao.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded-full text-xs">
                      {discussao.materia}
                    </span>
                  </div>
                  
                  <h4 className="text-white font-medium text-base md:text-lg mb-2">{discussao.titulo}</h4>
                  <p className="text-[#B3B3B3] mb-4 text-sm">{discussao.conteudo}</p>
                  
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleToggleLike(discussao.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        discussao.likedByUser ? 'text-[#3B82F6]' : 'text-[#B3B3B3] hover:text-[#3B82F6]'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${discussao.likedByUser ? 'fill-current' : ''}`} />
                      <span className="text-sm">{discussao.likes}</span>
                    </button>
                    <button 
                      onClick={() => setSelectedDiscussao(discussao)}
                      className="flex items-center gap-2 text-[#B3B3B3] hover:text-[#3B82F6] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{discussao.respostas.length} respostas</span>
                    </button>
                    {discussao.autor === (user?.name || 'Usuário') && (
                      <button 
                        onClick={() => {
                          setEditingDiscussao(discussao);
                          setShowDiscussionModal(true);
                        }}
                        className="flex items-center gap-2 text-[#B3B3B3] hover:text-[#3B82F6] transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de detalhes da discussão */}
        {selectedDiscussao && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedDiscussao(null);
                setRespostaInput('');
              }
            }}
          >
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Discussão</h2>
                <button
                  onClick={() => {
                    setSelectedDiscussao(null);
                    setRespostaInput('');
                  }}
                  className="text-[#B3B3B3] hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Conteúdo da discussão */}
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {selectedDiscussao.autor.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{selectedDiscussao.autor}</h3>
                      <span className="text-[#B3B3B3] text-sm">•</span>
                      <span className="text-[#B3B3B3] text-sm">
                        {new Date(selectedDiscussao.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-1 rounded-full text-xs">
                        {selectedDiscussao.materia}
                      </span>
                    </div>
                    <h4 className="text-white font-medium text-lg mb-2">{selectedDiscussao.titulo}</h4>
                    <p className="text-[#B3B3B3] text-sm">{selectedDiscussao.conteudo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 pl-14">
                  <button 
                    onClick={() => handleToggleLike(selectedDiscussao.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      selectedDiscussao.likedByUser ? 'text-[#3B82F6]' : 'text-[#B3B3B3] hover:text-[#3B82F6]'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${selectedDiscussao.likedByUser ? 'fill-current' : ''}`} />
                    <span className="text-sm">{selectedDiscussao.likes}</span>
                  </button>
                </div>
              </div>

              {/* Respostas */}
              <div className="mb-6">
                <h3 className="text-white font-bold mb-4">{selectedDiscussao.respostas.length} Respostas</h3>
                <div className="space-y-4">
                  {selectedDiscussao.respostas.map((resposta) => (
                    <div key={resposta.id} className="bg-[#1A1A1A] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#22C55E] to-[#3B82F6] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">
                              {resposta.autor.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium text-sm">{resposta.autor}</h4>
                              <span className="text-[#B3B3B3] text-xs">
                                {new Date(resposta.data).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {editingResposta?.respostaId === resposta.id ? (
                              <div className="space-y-2">
                                <NexoTextArea
                                  value={editRespostaConteudo}
                                  onChange={setEditRespostaConteudo}
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSalvarEdicaoResposta}
                                    className="px-3 py-1 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-[#2563EB] transition-colors"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingResposta(null);
                                      setEditRespostaConteudo('');
                                    }}
                                    className="px-3 py-1 bg-[#1A1A1A] border border-gray-700 text-white rounded-lg text-sm hover:bg-[#2A2A2A] transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[#B3B3B3] text-sm">{resposta.conteudo}</p>
                            )}
                          </div>
                        </div>
                        {resposta.autor === (user?.name || 'Usuário') && !editingResposta && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditarResposta(selectedDiscussao.id, resposta.id)}
                              className="text-[#B3B3B3] hover:text-[#3B82F6] transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExcluirResposta(selectedDiscussao.id, resposta.id)}
                              className="text-[#B3B3B3] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário de resposta */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-white font-bold mb-3">Adicionar Resposta</h3>
                <ReplyForm
                  onSubmit={(conteudo) => {
                    const novaResposta: Resposta = {
                      id: Date.now().toString(),
                      autor: user?.name || 'Usuário',
                      data: new Date().toISOString(),
                      conteudo
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

                    setSuccessMessage('Resposta adicionada com sucesso!');
                    setShowSuccessMessage(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Profile View
  const ProfileView = () => {
    const handleSaveProfile = (data: { name: string; course: string; goals: string }) => {
      if (user) {
        setUser({ ...user, name: data.name, course: data.course, goals: data.goals });
        setSuccessMessage('Perfil atualizado com sucesso!');
        setShowSuccessMessage(true);
      }
    };

    const handleLogout = () => {
      setUser(null);
      setTasks([]);
      setStudySessions([]);
      setMaterials([]);
      setGoals([]);
      setEventosEstudo([]);
      setTarefas([]);
      setMetasLongoPrazo([]);
      setSessoesFoco([]);
      setDiscussoes([]);
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      setCurrentView('onboarding');
      setShowOnboarding(true);
    };

    return (
      <PreferenciasContext.Provider value={{ preferencias, setPreferencias }}>
        <div className="p-4 md:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Perfil</h1>
            <p className="text-[#B3B3B3]">Gerencie suas informações e preferências</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações do usuário */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-4">Informações Pessoais</h3>
                <SharedProfileForm
                  initialName={user?.name || ''}
                  initialCourse={user?.course || ''}
                  initialGoals={user?.goals || ''}
                  onSave={(data) => {
                    if (user) {
                      setUser({ ...user, name: data.name, course: data.course, goals: data.goals });
                      setSuccessMessage('Perfil atualizado com sucesso!');
                      setShowSuccessMessage(true);
                    }
                  }}
                />
              </div>

              <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-4">Preferências</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Notificações</h4>
                      <p className="text-[#B3B3B3] text-sm">Receber lembretes de tarefas</p>
                    </div>
                    <button 
                      onClick={() => {
                        setPreferencias(prev => ({ ...prev, notificacoes: !prev.notificacoes }));
                        setSuccessMessage(
                          !preferencias.notificacoes 
                            ? 'Notificações ativadas.' 
                            : 'Notificações desativadas.'
                        );
                        setShowSuccessMessage(true);
                      }}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        preferencias.notificacoes ? 'bg-[#3B82F6]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferencias.notificacoes ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Som do Timer</h4>
                      <p className="text-[#B3B3B3] text-sm">Alertas sonoros no Pomodoro</p>
                    </div>
                    <button 
                      onClick={() => setPreferencias(prev => ({ ...prev, somTimer: !prev.somTimer }))}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        preferencias.somTimer ? 'bg-[#3B82F6]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferencias.somTimer ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Modo Escuro</h4>
                      <p className="text-[#B3B3B3] text-sm">Interface em tema escuro</p>
                    </div>
                    <button 
                      onClick={() => setPreferencias(prev => ({ ...prev, modoEscuro: !prev.modoEscuro }))}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        preferencias.modoEscuro ? 'bg-[#3B82F6]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        preferencias.modoEscuro ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Botão de Sair */}
              <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sessão</h3>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border-2 border-red-500/50 text-red-500 rounded-xl font-medium hover:bg-red-500/10 hover:border-red-500 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Sair da Conta
                </button>
                <p className="text-[#B3B3B3] text-xs mt-2 text-center">
                  Você será redirecionado para a tela inicial
                </p>
              </div>
            </div>

            {/* Estatísticas do usuário */}
            <div className="space-y-6">
              <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#3B82F6] to-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg md:text-2xl">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{user?.name}</h3>
                <p className="text-[#B3B3B3] text-sm mb-4">{user?.course}</p>
                <button className="bg-[#1A1A1A] border border-gray-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors text-sm">
                  Alterar Foto
                </button>
              </div>

              <div className="bg-[#141414] border border-gray-800 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-4">Conquistas</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">Primeira Semana</h4>
                      <p className="text-[#B3B3B3] text-xs">7 dias consecutivos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#3B82F6]/20 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 md:w-5 md:h-5 text-[#3B82F6]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">Focado</h4>
                      <p className="text-[#B3B3B3] text-xs">10 pomodoros</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#22C55E]/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">Organizador</h4>
                      <p className="text-[#B3B3B3] text-xs">20 tarefas concluídas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PreferenciasContext.Provider>
    );
  };

  // Renderização principal
  if (showOnboarding && !user) {
    return <OnboardingView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#020814] flex flex-col md:flex-row font-inter">
      {/* Header mobile */}
      <MobileHeader />
      
      {/* Sidebar */}
      <Navigation />
      
      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'planning' && <PlanningView />}
        {currentView === 'materials' && <MaterialsView />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'pomodoro' && <PomodoroView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'community' && <CommunityView />}
        {currentView === 'profile' && <ProfileView />}
      </main>

      {/* Modal de edição de material */}
      <EditMaterialModal />

      {/* Modal de adicionar material */}
      <AddMaterialModal />

      {/* Modal de eventos */}
      <EventModal />

      {/* Modal de tarefas */}
      <TaskModal />

      {/* Modal de metas */}
      <GoalModal />

      {/* Modal de edição de sessão */}
      <EditSessionModal />

      {/* Modal de discussão */}
      <DiscussionModal />

      {/* Mensagem de sucesso */}
      <SuccessMessage />
    </div>
  );
}
