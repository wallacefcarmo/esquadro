export type UserRole = 'admin' | 'gestor' | 'lider';

export interface Setor {
  id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  setor_id: string | null;
  primeiro_acesso: boolean;
  ativo: boolean;
}

export type MaquinaStatus = 'livre' | 'em_operacao' | 'manutencao';

export interface Maquina {
  id: string;
  nome: string;
  setor_id: string | null;
  status: MaquinaStatus;
  manutencao_motivo: string | null;
  manutencao_ate: string | null;
  ativo: boolean;
}

export type OsStatus = 'nao_iniciado' | 'em_andamento' | 'atencao' | 'concluido';

export interface OrdemServico {
  id: string;
  numero: string;
  desenho: string | null;
  descricao: string | null;
  status: OsStatus;
  prazo: string | null;
}

export interface Item {
  id: string;
  os_id: string;
  codigo: string;
  quantidade: number;
  material: string | null;
  responsavel_id: string | null;
  ordem: number;
}

export type OperacaoStatus = 'aguardando' | 'em_execucao' | 'concluido';

export interface ItemOperacao {
  id: string;
  item_id: string;
  setor_id: string | null;
  nome: string;
  ordem: number;
  status: OperacaoStatus;
  responsavel_id: string | null;
  maquina_id: string | null;
  quantidade_concluida: number;
  medida_extra: number | null;
  unidade_extra: string | null;
  iniciado_em: string | null;
  concluido_em: string | null;
}

export type ApontamentoAcao = 'iniciar' | 'encerrar' | 'parada' | 'retomar';

export interface Apontamento {
  id: string;
  item_operacao_id: string;
  usuario_id: string | null;
  acao: ApontamentoAcao;
  motivo_parada: string | null;
  quantidade: number | null;
  medida_extra: number | null;
  criado_em: string;
}

export interface ProgramacaoSemanal {
  id: string;
  setor_id: string;
  semana: string;
  responsavel_nome: string;
  responsavel_id: string | null;
  dia_semana: number;
  os_id: string | null;
  item_id: string | null;
  descricao: string | null;
  tipo: 'producao' | 'manutencao';
  publicada: boolean;
  publicada_em: string | null;
}

export interface HistoricoAlteracao {
  id: string;
  created_at: string;
  usuario_id: string | null;
  usuario_nome: string | null;
  tabela: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  registro_id: string | null;
  dados_antes: Record<string, unknown> | null;
  dados_depois: Record<string, unknown> | null;
}

export const MOTIVOS_PARADA = [
  'Aguard. material',
  'Manutenção',
  'Aguard. desenho',
  'Deslocamento',
  'Retrabalho',
] as const;
