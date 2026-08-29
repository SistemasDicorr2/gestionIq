// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
// Cliente de Supabase para la lógica de autenticación
import { supabase } from '../services/supabase';

// --- Vistas y Layouts Existentes ---
import AdminLayout from '../layouts/AdminLayout.vue';
import AdminView from '../views/AdminView.vue';
import FichaView from '../views/FichaView.vue';
import LoginView from '../views/LoginView.vue';
import StatsView from '../views/StatsView.vue';
import InstrumentadoresView from '../views/InstrumentadoresView.vue';
import IncidenciasView from '../views/IncidenciasView.vue';
import ReclamoView from '../views/ReclamoView.vue';
import QuejasView from '../views/QuejasView.vue';
import PedidosEspecialesView from '../views/PedidosEspecialesView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import ActivitySummaryView from '../views/ActivitySummaryView.vue';
import InformeSemanalSeguimientoView from '../views/InformeSemanalSeguimientoView.vue';
import LogisticaControl from '../views/logistica/LogisticaControl.vue';
import InstrumentadorUpload from '../views/instrumentadores/InstrumentadorUpload.vue';
import ConsumoView from '../views/logistica/ConsumoView.vue';
import PagosDashboardView from '../views/admin/PagosDashboardView.vue';
import HistorialPagosView from '../views/admin/HistorialPagosView.vue';
import ConfigView from '../views/ConfigView.vue';
import ResumenOperativoView from '../views/admin/ResumenOperativoView.vue';
import ResumenOperativoLoteView from '../views/admin/ResumenOperativoLoteView.vue';

// --- Vistas y Layouts para el Módulo de Logística ---
import LogisticaLayout from '../layouts/LogisticaLayout.vue';
import LogisticaInformesView from '../views/logistica/LogisticaInformesView.vue';
import LogisticaNuevoInformeView from '../views/logistica/LogisticaNuevoInformeView.vue';
import LogisticaHistorialView from '../views/logistica/LogisticaHistorialView.vue';
import LogisticaDetalleInformeView from '../views/logistica/LogisticaDetalleInformeView.vue';
import GuiaEnvioLogisticaView from '../views/logistica/GuiaEnvioLogisticaView.vue';

// --- Definición de Rutas ---
const routes = [
  // --- Rutas Públicas (accesibles sin iniciar sesión) ---
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/ficha/:token',
    name: 'Ficha',
    component: FichaView,
    props: true
  },
  {
    path: '/f/:short_code',
    name: 'FichaCorta',
    component: FichaView,
    props: true
  },
  {
    path: '/reclamo',
    name: 'Reclamo',
    component: ReclamoView
  },
  {
    path: '/resumen/:token',
    name: 'ActivitySummary',
    component: ActivitySummaryView,
    props: true,
  },
  {
    path: '/resumen-operativo/lote/:token',
    name: 'ResumenOperativoLote',
    component: ResumenOperativoLoteView,
    props: true,
    meta: { requiresAuth: false }
  },

  // --- Rutas Protegidas de Administración ---
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true, allowedRoles: ['admin'] },
    children: [
      { path: '', redirect: '/admin' },
      {
        path: 'resumen-operativo',
        name: 'ResumenOperativo',
        component: ResumenOperativoView,
        meta: { allowedRoles: ['admin'] }
      },
      { path: 'admin', name: 'Admin', component: AdminView, meta: { allowedRoles: ['admin'] } },
      { path: 'estadisticas', name: 'Estadisticas', component: StatsView, meta: { allowedRoles: ['admin'] } },
      { path: 'instrumentadores', name: 'Instrumentadores', component: InstrumentadoresView, meta: { allowedRoles: ['admin'] } },
      { path: 'incidencias', name: 'Incidencias', component: IncidenciasView, meta: { allowedRoles: ['admin'] } },
      { path: 'quejas', name: 'Quejas', component: QuejasView, meta: { allowedRoles: ['admin'] } },
      { path: 'pedidos-especiales', name: 'PedidosEspeciales', component: PedidosEspecialesView, meta: { allowedRoles: ['admin'] } },
      { path: 'notificaciones', name: 'Notificaciones', component: NotificationsView, meta: { allowedRoles: ['admin'] } },
      { path: 'informe-semanal-seguimiento', name: 'InformeSemanalSeguimiento', component: InformeSemanalSeguimientoView, meta: { allowedRoles: ['admin'] } },
      { path: 'logistica-control', name: 'LogisticaControl', component: LogisticaControl, meta: { allowedRoles: ['admin'] } },
      { path: 'instrumentador-upload', name: 'InstrumentadorUpload', component: InstrumentadorUpload, meta: { allowedRoles: ['admin'] } },
      { path: 'control-consumo', name: 'ControlConsumo', component: ConsumoView, meta: { allowedRoles: ['admin'] } },
      {
        path: 'pagos',
        name: 'PagosDashboard',
        component: PagosDashboardView,
        meta: { allowedRoles: ['admin'] }
      },
      {
        path: 'historial-pagos',
        name: 'HistorialPagos',
        component: HistorialPagosView,
        meta: { allowedRoles: ['admin'] }
      },
      {
        path: 'configuracion',
        name: 'Configuracion',
        component: ConfigView,
        meta: { allowedRoles: ['admin'] }
      }
    ]
  },

  // --- Rutas Protegidas del Módulo Informe Diario de Logística ---
  {
    path: '/logistica',
    component: LogisticaLayout,
    meta: { requiresAuth: true, allowedRoles: ['logistica', 'admin'] },
    children: [
      { path: '', redirect: { name: 'LogisticaInformes' } },
      {
        path: 'informes',
        name: 'LogisticaInformes',
        component: LogisticaInformesView,
        meta: { requiresAuth: true, allowedRoles: ['logistica', 'admin'] }
      },
      {
        path: 'guia-envio',
        name: 'LogisticaGuiaEnvio',
        component: GuiaEnvioLogisticaView,
        meta: { requiresAuth: true, allowedRoles: ['logistica', 'admin'] }
      },
      {
        path: 'informes/nuevo',
        name: 'LogisticaNuevoInforme',
        component: LogisticaNuevoInformeView,
        meta: { requiresAuth: true, allowedRoles: ['logistica', 'admin'] }
      },
      {
        path: 'informes/historial',
        name: 'LogisticaHistorial',
        component: LogisticaHistorialView,
        meta: { requiresAuth: true, allowedRoles: ['logistica', 'admin'] }
      },
      {
        path: 'informes/:id',
        name: 'LogisticaDetalleInforme',
        component: LogisticaDetalleInformeView,
        meta: { requiresAuth: true, allowedRoles: ['logistica', 'admin'] }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- Guardia de Navegación Global (verificación con fallback seguro de rol) ---
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  // LECTURA CON FALLBACK SEGURO: app_metadata.role -> user_metadata.role -> 'admin'
  const userRole = user ? (user.app_metadata?.role || user.user_metadata?.role || 'admin') : null;

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // Obtener allowedRoles de la coincidencia más específica
  const matchedWithRoles = [...to.matched].reverse().find(record => record.meta && record.meta.allowedRoles);
  const allowedRoles = matchedWithRoles ? matchedWithRoles.meta.allowedRoles : null;

  // 1. Requerir autenticación si no hay sesión
  if (requiresAuth && !user) {
    return next({ name: 'Login' });
  }

  // 2. Redirección inteligente post-login desde / o /login
  if ((to.path === '/' || to.name === 'Login') && user) {
    if (userRole === 'logistica') {
      return next({ name: 'LogisticaInformes' });
    }
    return next({ name: 'Admin' });
  }

  // 3. Verificación estricta de roles declarativos
  if (allowedRoles) {
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!userRole || !rolesArray.includes(userRole)) {
      console.warn(`Acceso denegado a '${to.path}'. Rol del usuario: '${userRole || 'sin_rol'}'. Roles permitidos: '${rolesArray.join(', ')}'.`);
      
      if (userRole === 'logistica') {
        return next({ name: 'LogisticaInformes' });
      } else {
        return next({ name: 'Admin' });
      }
    }
  }

  next();
});

export default router;
