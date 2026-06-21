'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Briefcase,
  CreditCard, UserPlus, Megaphone, CheckSquare,
  History, Settings, X, Power, Sparkles, Building2,
  Target, ChevronLeft, ChevronRight
} from 'lucide-react';
import Button from '../ui/button';
import { useTenantStore, getPlanDefaultFeatures } from '../../lib/store';
import { useMounted } from '../../hooks/useMounted';
import { PLATFORM_NAME } from '../../lib/config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const store = useTenantStore();
  const hasMounted = useMounted();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', href: '/leads', icon: Target, feature: 'leads' },
    { label: 'Clientes', href: '/clientes', icon: Users, feature: 'clients' },
    { label: 'Propostas', href: '/propostas', icon: FileText, feature: 'proposals' },
    { label: 'Contratos', href: '/contratos', icon: Briefcase, feature: 'contracts' },
    { label: 'Cobranças', href: '/cobrancas', icon: CreditCard, feature: 'charges' },
    { label: 'Onboarding', href: '/onboarding', icon: UserPlus, feature: 'onboarding' },
    { label: 'Publicações', href: '/publicacoes', icon: Megaphone, feature: 'publications' },
    { label: 'Tarefas', href: '/tarefas', icon: CheckSquare, feature: 'tasks' },
    { label: 'Histórico', href: '/historico', icon: History, feature: 'history' },
    { label: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  // Stable server defaults to prevent hydration mismatch
  const isSidebarCollapsed = hasMounted ? store.isSidebarCollapsed : false;
  const currentOrganizationId = hasMounted ? store.currentOrganizationId : 'org_hub_power';
  const currentFeatures = hasMounted ? store.currentFeatures : getPlanDefaultFeatures('pro');
  const currentUser = hasMounted
    ? store.currentUser
    : store.teamMembers?.find(m => m.organizationId === 'org_hub_power') || store.teamMembers?.[0];
  const organizations = store.organizations || [];
  const toggleSidebar = store.toggleSidebar;
  const setCurrentOrganizationId = store.setCurrentOrganizationId;

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.feature) return true;
    const key = item.feature as keyof Omit<typeof currentFeatures, 'organizationId'>;
    return currentFeatures ? currentFeatures[key] !== false : true;
  });

  const currentOrg = (organizations || []).find(o => o.id === currentOrganizationId) || organizations?.[0];
  const orgInitials = currentOrg?.name
    ? currentOrg.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'VN';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 border-r border-border bg-card text-foreground flex flex-col transition-all duration-300 lg:translate-x-0 lg:h-full lg:relative ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64 w-64'}`}
      >
        {/* Toggle Sidebar Button (Desktop Only) */}
        <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-50 group">
          <button
            type="button"
            onClick={() => toggleSidebar?.()}
            className="h-6 w-6 rounded-full border border-border bg-card text-foreground shadow-md hover:bg-muted flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
          {/* CSS Tooltip */}
          <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-card text-card-foreground text-[11px] font-semibold rounded-lg border border-border shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out transform scale-90 -translate-x-1 group-hover:scale-100 group-hover:translate-x-0 z-50">
            {isSidebarCollapsed ? "Expandir Sidebar" : "Recolher Sidebar"}
          </div>
        </div>

        {/* Header Logo */}
        <div className={`h-16 flex items-center justify-between border-b border-border/40 shrink-0 ${
          isSidebarCollapsed ? 'justify-center px-0 relative group' : 'px-6'
        }`}>
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
              <Power className="h-5 w-5 animate-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col animate-in fade-in duration-200">
                <span className="font-bold text-sm leading-tight tracking-tight">{PLATFORM_NAME}</span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">SaaS Manager</span>
              </div>
            )}
          </Link>
          {isSidebarCollapsed && (
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-card text-card-foreground text-[11px] font-semibold rounded-lg border border-border shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out transform scale-90 -translate-x-1 group-hover:scale-100 group-hover:translate-x-0 z-50">
              VN Hub (SaaS)
            </div>
          )}
          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full lg:hidden hover:bg-muted"
              onClick={onClose}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>

        {/* Organization Switcher Dropdown (Simulator) */}
        <div className={`shrink-0 border-b border-border/40 ${isSidebarCollapsed ? 'py-3' : 'px-4 py-3 bg-muted/20'}`}>
          {isSidebarCollapsed ? (
            <div className="relative group flex justify-center w-full">
              <button
                type="button"
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="h-10 w-10 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center font-bold text-xs border border-primary/20 shadow-sm cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/45"
              >
                {orgInitials}
              </button>
              {/* CSS Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-card text-card-foreground text-[11px] font-semibold rounded-lg border border-border shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out transform scale-90 -translate-x-1 group-hover:scale-100 group-hover:translate-x-0 z-50">
                {currentOrg?.name} (Simulador)
              </div>

              {/* Floating Dropdown List */}
              {orgDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOrgDropdownOpen(false)} />
                  <div className="absolute left-full ml-2 top-0 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                    <div className="px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground uppercase border-b border-border/40 select-none">
                      Alternar Organização
                    </div>
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          setCurrentOrganizationId?.(org.id);
                          setOrgDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-muted flex items-center justify-between cursor-pointer transition-colors ${
                          org.id === currentOrganizationId ? 'text-primary bg-primary/5' : 'text-foreground'
                        }`}
                      >
                        <span className="truncate">{org.name}</span>
                        {org.id === currentOrganizationId && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-primary uppercase tracking-wider select-none">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> Simulador de Organização
              </div>
              <div className="relative">
                <select
                  value={currentOrganizationId || ''}
                  onChange={(e) => setCurrentOrganizationId?.(e.target.value)}
                  className="w-full h-9 pl-2.5 pr-8 rounded-lg bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary cursor-pointer transition-all"
                  title="Alternar Organização Assinante"
                >
                  {(organizations || []).map((org) => (
                    <option key={org?.id || ''} value={org?.id || ''}>
                      {org?.name || 'Organização sem nome'}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 py-6 space-y-2 ${isSidebarCollapsed ? 'px-0 overflow-visible' : 'px-4 overflow-y-auto'}`}>
          {(filteredMenuItems || []).map((item, idx) => {
            if (!item) return null;
            const Icon = item.icon || Target;
            const itemHref = item.href || '#';
            const isActive = hasMounted && itemHref !== '#' && pathname && pathname.startsWith(itemHref);

            return (
              <div key={(item.href || '#') + '-' + idx} className="relative group flex justify-center w-full">
                <Link
                  href={itemHref}
                  onClick={onClose}
                  className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                    isSidebarCollapsed
                      ? 'justify-center w-10 h-10 p-0'
                      : 'px-3 w-full'
                  } ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none pl-2 shadow-sm dark:bg-primary dark:text-primary-foreground dark:border-l-0 dark:rounded-lg dark:pl-3'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${
                    isActive ? 'text-primary dark:text-current' : 'text-muted-foreground group-hover:text-foreground'
                  }`} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>

                {/* CSS Tooltip */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-card text-card-foreground text-[11px] font-semibold rounded-lg border border-border shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out transform scale-90 -translate-x-1 group-hover:scale-100 group-hover:translate-x-0 z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}

          {/* Painel Operador Section */}
          <div className="pt-4 mt-4 border-t border-border/40">
            {!isSidebarCollapsed ? (
              <div className="px-3 mb-2 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                Operador VN Hub
              </div>
            ) : (
              <div className="h-px bg-border/40 my-2" />
            )}

            <div className="relative group flex justify-center w-full">
              <Link
                href="/empresas"
                onClick={onClose}
                className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                  isSidebarCollapsed
                    ? 'justify-center w-10 h-10 p-0'
                    : 'px-3 w-full justify-between'
                } ${
                  (hasMounted && pathname && pathname.startsWith('/empresas'))
                    ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none pl-2 shadow-sm dark:bg-primary dark:text-primary-foreground dark:border-l-0 dark:rounded-lg dark:pl-3'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <Building2 className={`h-4.5 w-4.5 shrink-0 ${
                    (hasMounted && pathname && pathname.startsWith('/empresas')) ? 'text-primary dark:text-current' : 'text-muted-foreground'
                  }`} />
                  {!isSidebarCollapsed && <span>Empresas</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="bg-primary/20 text-primary dark:bg-primary-foreground/20 dark:text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                    Admin
                  </span>
                )}
              </Link>

              {/* CSS Tooltip */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-card text-card-foreground text-[11px] font-semibold rounded-lg border border-border shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out transform scale-90 -translate-x-1 group-hover:scale-100 group-hover:translate-x-0 z-50">
                  Empresas (Admin)
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-border/40 shrink-0 flex justify-center">
          {isSidebarCollapsed ? (
            <div className="relative group">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase shrink-0">
                {String(currentUser?.name || 'US').slice(0, 2)}
              </div>

              {/* CSS Tooltip */}
              <div className="absolute left-full ml-3 bottom-0 px-2.5 py-1.5 bg-card text-card-foreground text-[11px] font-semibold rounded-lg border border-border shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 ease-out transform scale-90 -translate-x-1 group-hover:scale-100 group-hover:translate-x-0 z-50">
                <div className="text-foreground font-bold leading-tight">{currentUser?.name}</div>
                <div className="text-muted-foreground text-[9px] leading-normal">{currentUser?.role}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-muted/40 w-full animate-in fade-in duration-200">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase shrink-0">
                {String(currentUser?.name || 'US').slice(0, 2)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate text-foreground">{currentUser?.name || 'Usuário'}</span>
                <span className="text-[9px] text-muted-foreground truncate leading-normal" title={`${currentUser?.role || 'Membro'} (${String(currentUser?.userRole ?? 'member').toUpperCase()})`}>
                  {currentUser?.role || 'Membro'}
                  <strong className="text-primary block font-mono text-[8px] uppercase">{String(currentUser?.userRole ?? 'member').toUpperCase()}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
