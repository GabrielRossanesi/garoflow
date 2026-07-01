'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MessageSquare, 
  Send, 
  AlertCircle 
} from 'lucide-react';
import { useStore } from '../../../../lib/store';
import { useMounted } from '../../../../hooks/useMounted';
import { LogoHorizontal } from '../../../../components/ui/logo';
import Card, { CardContent } from '../../../../components/ui/card';
import Badge from '../../../../components/ui/badge';
import Button from '../../../../components/ui/button';

// Custom Brand Icons to avoid missing lucide-react exports
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Helper to render platform icon
function PlatformIcon({ platform }: { platform?: string }) {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon className="h-4 w-4 text-pink-500" />;
    case 'facebook':
      return <FacebookIcon className="h-4 w-4 text-blue-600" />;
    case 'linkedin':
      return <LinkedinIcon className="h-4 w-4 text-sky-700" />;
    default:
      return <Send className="h-4 w-4 text-primary" />;
  }
}

function ApprovalContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  
  const publicationId = params.id as string;
  const token = searchParams.get('token') || '';

  const { 
    publications, 
    approvePublicationByToken, 
    requestPublicationChangesByToken 
  } = useStore();

  const [feedback, setFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Find publication
  const publication = publications.find(p => p.id === publicationId);

  // Time remaining state
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!publication?.approvalLinkExpiresAt || publication.approvalLinkStatus !== 'active') return;

    // Check expiration immediately
    const checkExpiration = () => {
      const expiresAt = new Date(publication.approvalLinkExpiresAt!).getTime();
      const now = new Date().getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expirado');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    checkExpiration();
    const timer = setInterval(checkExpiration, 1000);

    return () => clearInterval(timer);
  }, [publication]);

  if (!mounted) return null;

  // Validation checks
  if (!publication) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-xl font-bold text-slate-100">Publicação não encontrada</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-xs">
          O registro da publicação solicitada não existe ou foi removido.
        </p>
      </div>
    );
  }

  // Token validation
  if (!token || publication.approvalToken !== token) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
        <ShieldAlert className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-xl font-bold text-slate-100">Acesso negado</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-xs">
          O token de aprovação fornecido é inválido ou ausente. Entre em contato com a agência responsável.
        </p>
      </div>
    );
  }

  // Action Handlers
  const handleApprove = () => {
    try {
      approvePublicationByToken(publication.id, token);
      setActionSuccess('approved');
    } catch (e) {
      const err = e as Error;
      setErrorMsg(err.message || 'Ocorreu um erro ao processar a aprovação.');
    }
  };

  const handleRequestChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Por favor, informe detalhadamente quais ajustes são necessários.');
      return;
    }

    try {
      requestPublicationChangesByToken(publication.id, token, feedback);
      setActionSuccess('changes_requested');
    } catch (e) {
      const err = e as Error;
      setErrorMsg(err.message || 'Ocorreu um erro ao registrar as alterações.');
    }
  };

  // Determine current effective status (e.g. check local state or expiration)
  const isLinkExpired = isExpired || (publication.approvalLinkExpiresAt && new Date(publication.approvalLinkExpiresAt) < new Date());
  const linkStatus = publication.approvalLinkStatus;

  // Render state overrides based on action success
  if (actionSuccess === 'approved' || linkStatus === 'approved') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-pulse" />
          <h1 className="text-2xl font-bold text-slate-100">Post Aprovado!</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Agradecemos pelo seu retorno. A publicação de <strong>{publication.companyName}</strong> foi aprovada e enviada para a fila de agendamento.
          </p>
          <div className="text-[11px] text-slate-500 font-mono">
            Registrado em: {publication.approvedAt ? new Date(publication.approvedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    );
  }

  if (actionSuccess === 'changes_requested' || linkStatus === 'changes_requested') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl space-y-4">
          <MessageSquare className="h-16 w-16 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-100">Ajustes Solicitados</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Recebemos o seu feedback sobre a arte/legenda. Nossa equipe de criação já foi notificada e criamos uma tarefa de ajuste imediato.
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left text-xs text-slate-300 italic">
            &quot;{publication.clientFeedback || feedback}&quot;
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Registrado em: {publication.changesRequestedAt ? new Date(publication.changesRequestedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    );
  }

  if (isLinkExpired || linkStatus === 'expired') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl space-y-4">
          <Clock className="h-16 w-16 text-slate-500 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-100">Link Expirado</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Este link temporário de 24 horas expirou. Para a sua segurança e controle de versões, o acesso foi bloqueado.
          </p>
          <p className="text-xs text-slate-500">
            Solicite um novo link de aprovação para a equipe responsável pelo seu projeto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-900 pb-6">
          <LogoHorizontal size="md" />
          <Badge variant="warning" className="bg-slate-900 border border-slate-800 text-slate-300">
            Modo Sandbox
          </Badge>
        </header>

        {errorMsg && (
          <div className="p-4 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center gap-3 text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Creative image preview - span 6 */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pré-visualização do Post</h2>
            <div className="border border-slate-800 bg-slate-900/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-primary">
                    {publication.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-200 block">{publication.companyName}</span>
                    <span className="text-[10px] text-slate-500 block">Agendado</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-300 uppercase">
                  <PlatformIcon platform={publication.platform} />
                  <span>{publication.platform || 'Rede Social'}</span>
                </div>
              </div>
              
              {/* Image box */}
              <div className="aspect-square bg-slate-950 flex items-center justify-center overflow-hidden relative border-b border-slate-800/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={publication.imageUrl} 
                  alt="Post preview" 
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Feed simulation details */}
              <div className="p-4 space-y-2 bg-slate-900/40">
                <div className="text-xs text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                  <span className="font-bold text-slate-200 mr-1.5">{publication.companyName.toLowerCase().replace(/\s+/g, '')}</span>
                  {publication.caption}
                </div>
              </div>
            </div>
          </div>

          {/* Details & Actions - span 6 */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-white">Aprovação de Publicação</h1>
              <p className="text-sm text-slate-400">
                Revise os detalhes operacionais e a arte da publicação agendada abaixo.
              </p>
            </div>

            {/* Info Card */}
            <Card className="bg-slate-900/40 border-slate-800/80 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Cliente</span>
                    <span className="text-sm font-semibold text-white block leading-tight">{publication.companyName}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Data Programada</span>
                    <span className="text-sm font-semibold text-white block leading-tight flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      {new Date(publication.scheduledDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Responsável</span>
                    <span className="text-xs text-slate-300 block">{publication.responsibleUser}</span>
                  </div>
                  
                  {/* Countdown widget */}
                  <div className="bg-red-950/20 border border-red-900/40 rounded-xl px-3 py-1.5 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500 animate-pulse shrink-0" />
                    <div>
                      <span className="text-[8px] uppercase font-bold text-red-400 block tracking-widest leading-none">Expira em</span>
                      <span className="text-xs font-mono font-bold text-red-300 block leading-tight mt-0.5">{timeLeft}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            {!showFeedbackForm ? (
              <div className="space-y-3">
                <Button 
                  onClick={handleApprove}
                  className="w-full justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3.5 text-sm rounded-xl shadow-xl shadow-primary/20 transition-all duration-300"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar Publicação
                </Button>
                
                <Button 
                  onClick={() => setShowFeedbackForm(true)}
                  className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-amber-500 border border-amber-950/40 font-bold py-3.5 text-sm rounded-xl transition-all duration-300"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Solicitar Ajustes
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRequestChanges} className="space-y-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <label htmlFor="feedback" className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Quais alterações são necessárias?
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Descreva aqui o que deve ser ajustado (ex: trocar foto, corrigir erro de digitação na legenda, mudar a data)..."
                    className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 placeholder:text-slate-600 transition-colors"
                    required
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    type="submit"
                    className="flex-1 justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-lg transition-all duration-300"
                  >
                    Enviar Solicitação
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="flex-1 justify-center bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs py-2.5 rounded-lg transition-all duration-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            <div className="p-4 bg-slate-900/20 border border-slate-800/60 rounded-xl text-xs text-slate-500 leading-relaxed text-center">
              Esta é uma página de homologação segura do NV Hub. As alterações salvas serão aplicadas no painel operacional em modo Sandbox demonstrativo.
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center border-t border-slate-900 pt-6 mt-8">
        <p className="text-[10px] text-slate-600">
          &copy; {new Date().getFullYear()} NV Hub. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

export default function PublicationApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 font-medium">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
        Carregando painel de aprovação...
      </div>
    }>
      <ApprovalContent />
    </Suspense>
  );
}
