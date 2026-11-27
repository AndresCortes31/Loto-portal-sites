// Datos iniciales del portal (tomados del mockup aprobado).
// En producción se reemplazan por una base de datos (SQL Server, PostgreSQL, etc.).
import { minutesAgo } from '../utils/helpers.js';

const colors = ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#ea580c', '#db2777', '#4f46e5', '#0d9488', '#ca8a04', '#9333ea', '#dc2626', '#475569'];
const p95 = [180, 240, 320, 150, 210, 190, 260, 140, 230, 380, 90, 300];

const rawApps = [
  ['Ventas POS', 'ventas-pos', 'PROD', '2.3.1', 'Hathziri Carbajal', 184, 'ok', minutesAgo(60 * 3)],
  ['Pagos Premios', 'pagos-premios', 'PROD', '1.8.4', 'Ingrid Castillo', 96, 'warn', '2026-11-20T10:00:00-06:00'],
  ['Sorteos Online', 'sorteos-online', 'PROD', '1.8.2', 'Ingrid Castillo', 58, 'ok', '2026-11-18T10:00:00-06:00'],
  ['Reportería', 'reporteria', 'PROD', '3.0.0', 'Hathziri Carbajal', 121, 'ok', '2026-11-15T10:00:00-06:00'],
  ['Gestión de Agencias', 'agencias', 'PROD', '1.2.7', 'Ingrid Castillo', 44, 'ok', '2026-11-12T10:00:00-06:00'],
  ['Conciliación Bancaria', 'conciliacion', 'PROD', '0.9.5', 'Hathziri Carbajal', 12, 'err', '2026-11-10T10:00:00-06:00'],
  ['Portal Distribuidores', 'distribuidores', 'PROD', '2.1.0', 'Ingrid Castillo', 230, 'ok', '2026-11-08T10:00:00-06:00'],
  ['Inventario Billetes', 'inventario', 'QA', '1.0.0-rc2', 'Hathziri Carbajal', 9, 'ok', minutesAgo(60 * 17)],
  ['Mesa de Ayuda', 'helpdesk', 'PROD', '1.5.3', 'Ingrid Castillo', 67, 'ok', '2026-11-02T10:00:00-06:00'],
  ['Control de Premios Mayores', 'premios-mayores', 'QA', '0.4.0', 'Ingrid Castillo', 6, 'warn', minutesAgo(60)],
  ['API Gateway', 'api-gateway', 'PROD', '4.2.1', 'Hathziri Carbajal', 0, 'ok', '2026-10-30T10:00:00-06:00'],
  ['App Móvil Vendedores', 'app-vendedores', 'DEV', '0.2.0', 'Hathziri Carbajal', 4, 'ok', minutesAgo(30)],
];

export const apps = rawApps.map(([name, code, env, version, owner, users, status, lastDeploy], i) => ({
  id: code,
  name,
  code,
  env,
  version,
  owner,
  users,
  status, // ok | warn | err
  lastDeploy,
  color: colors[i % colors.length],
  baseUrl: `https://${code}.loto.hn`,
  healthEndpoint: '/api/health',
  description: '',
  auth: 'Entra ID (OIDC) · client credentials',
  active: true,
  latencyP95: status === 'warn' ? 1820 : status === 'err' ? null : p95[i],
}));

export const areas = [
  { id: 'ventas', name: 'Ventas y canales', short: 'VC', desc: 'Puntos de venta y canales comerciales', color: '#2563eb', apps: ['ventas-pos', 'app-vendedores', 'distribuidores'] },
  { id: 'premios', name: 'Premios y pagos', short: 'PP', desc: 'Validación y pago de premios', color: '#7c3aed', apps: ['pagos-premios', 'premios-mayores'] },
  { id: 'sorteos', name: 'Sorteos', short: 'SO', desc: 'Administración de sorteos y resultados', color: '#0891b2', apps: ['sorteos-online'] },
  { id: 'agencias', name: 'Red de agencias', short: 'RA', desc: 'Agencias e inventario de billetes', color: '#16a34a', apps: ['agencias', 'inventario'] },
  { id: 'datos', name: 'Datos y operación', short: 'DO', desc: 'Reportes, conciliación y soporte', color: '#ea580c', apps: ['reporteria', 'conciliacion', 'helpdesk'] },
  { id: 'plataforma', name: 'Plataforma y servicios', short: 'PS', desc: 'Servicios compartidos e integraciones', color: '#db2777', apps: ['api-gateway'] },
];

export const users = [
  ['Ingrid Castillo', 'icastillo@loto.hn', 'Desarrollo', 'Super Admin', 12, true, minutesAgo(0), 'Activo'],
  ['Hathziri Carbajal', 'hcarbajal@loto.hn', 'Desarrollo', 'Admin App', 8, true, minutesAgo(8), 'Activo'],
  ['Slilma Garcia', 'slilma.garcia@loto.com.ni', 'Sistemas', 'Super Admin', 12, true, minutesAgo(180), 'Activo'],
  ['Carlos Mejía', 'cmejia@loto.hn', 'Operaciones', 'Supervisor', 3, true, minutesAgo(60), 'Activo'],
  ['María Fernanda López', 'mlopez@loto.hn', 'Finanzas', 'Auditor', 5, true, minutesAgo(60 * 24), 'Activo'],
  ['José Antonio Reyes', 'jreyes@loto.hn', 'Operaciones', 'Operador', 2, false, minutesAgo(60 * 24 * 14), 'Bloqueado'],
  ['Andrea Zelaya', 'azelaya@loto.hn', 'Finanzas', 'Solo lectura', 4, true, minutesAgo(60 * 24 * 2), 'Activo'],
  ['Luis Ordóñez', 'lordonez@loto.hn', 'Sistemas', 'Admin App', 6, true, minutesAgo(90), 'Activo'],
].map(([name, email, department, role, systems, mfa, lastAccess, status]) => ({
  id: email.split('@')[0],
  name,
  email,
  department,
  role,
  systems,
  mfa,
  lastAccess,
  status,
}));

export const roles = ['Super Admin', 'Admin App', 'Supervisor', 'Operador', 'Auditor', 'Solo lectura'];

// Plantilla de permisos: [acción, descripción, valores por rol en el orden de `roles`]
export const permissionTemplate = [
  ['transaccion:crear', 'Registrar venta', [1, 1, 1, 1, 0, 0]],
  ['transaccion:anular', 'Anular venta', [1, 1, 1, 0, 0, 0]],
  ['reporte:leer', 'Ver reportes', [1, 1, 1, 1, 1, 1]],
  ['reporte:exportar', 'Exportar reportes', [1, 1, 1, 0, 1, 0]],
  ['config:editar', 'Editar configuración', [1, 1, 0, 0, 0, 0]],
  ['usuarios:asignar', 'Asignar usuarios', [1, 1, 0, 0, 0, 0]],
  ['auditoria:leer', 'Ver auditoría', [1, 0, 0, 0, 1, 0]],
  ['caja:cerrar', 'Cierre de caja', [1, 1, 1, 0, 0, 0]],
];

export const configTemplate = {
  params: [
    { key: 'LIMITE_PAGO_CAJA', value: '10000', description: 'Monto máximo pagable en caja (HNL)', version: 7 },
    { key: 'TIMEOUT_API_MS', value: '5000', description: 'Tiempo de espera de servicios', version: 3 },
    { key: 'HORARIO_CIERRE', value: '21:30', description: 'Cierre diario de operaciones', version: 12 },
    { key: 'MAX_REINTENTOS', value: '3', description: 'Reintentos de transacción', version: 2 },
  ],
  flags: [
    { key: 'pagos.wallet.enabled', name: 'Pago con billetera móvil', description: '', enabled: true },
    { key: 'pagos.biometric.enabled', name: 'Validación biométrica', description: '20% rollout', enabled: true },
    { key: 'pagos.receipt.v2', name: 'Nuevo comprobante PDF', description: '', enabled: false },
    { key: 'app.maintenance', name: 'Modo mantenimiento', description: '', enabled: false },
  ],
};

export const approvals = [
  {
    id: 'apr-1001', type: 'CONFIG_PARAM', title: 'Cambio de parámetro', appCode: 'pagos-premios', env: 'PROD',
    requestedBy: 'Hathziri Carbajal', requestedAt: minutesAgo(25), approver: 'Slilma Garcia',
    before: 'LIMITE_PAGO_CAJA: 10000', after: 'LIMITE_PAGO_CAJA: 15000',
    reason: 'Ajuste solicitado por Finanzas para temporada navideña (ticket #4521).',
    payload: { key: 'LIMITE_PAGO_CAJA', value: '15000' }, status: 'pending',
  },
  {
    id: 'apr-1002', type: 'ROLE', title: 'Alta de rol', appCode: 'reporteria', env: 'PROD',
    requestedBy: 'Luis Ordóñez', requestedAt: minutesAgo(120), approver: 'Ingrid Castillo',
    before: '—', after: 'rol: Analista Regional (reporte:leer, reporte:exportar)',
    reason: 'Nuevos analistas de la zona norte.',
    payload: { role: 'Analista Regional', permissions: ['reporte:leer', 'reporte:exportar'] }, status: 'pending',
  },
  {
    id: 'apr-1003', type: 'DEPLOY', title: 'Despliegue v1.9.0', appCode: 'sorteos-online', env: 'PROD',
    requestedBy: 'Hathziri Carbajal', requestedAt: minutesAgo(60 * 16), approver: 'Ingrid Castillo',
    before: 'version: 1.8.2', after: 'version: 1.9.0',
    reason: 'Incluye corrección de cálculo de premios secundarios. QA aprobado.',
    payload: { version: '1.9.0' }, status: 'pending',
  },
];

export const audit = [
  ['2026-11-25T15:07:00-06:00', 'Hathziri Carbajal', 'UPDATE', 'Config · Ventas POS', 'TIMEOUT_API_MS 3000 → 5000', '10.20.4.31', 'ventas-pos'],
  ['2026-11-25T14:53:00-06:00', 'Sistema', 'ALERT', 'Health · Pagos Premios', 'Latencia p95 1,820 ms > 1,500 ms', '—', 'pagos-premios'],
  ['2026-11-25T14:12:00-06:00', 'Ingrid Castillo', 'APPROVE', 'Despliegue · Ventas POS', 'v2.3.0 → v2.3.1', '10.20.4.18', 'ventas-pos'],
  ['2026-11-25T12:20:00-06:00', 'Slilma Garcia', 'ASSIGN', 'Rol · Auditor', '3 usuarios asignados', '10.30.1.5', null],
  ['2026-11-25T09:01:00-06:00', 'Luis Ordóñez', 'LOGIN', 'Sesión', 'Inicio de sesión con MFA', '10.20.4.77', null],
  ['2026-11-25T06:00:00-06:00', 'Sistema', 'SYNC', 'Usuarios · Entra ID', '4 altas, 1 baja', '—', null],
  ['2026-11-24T18:44:00-06:00', 'Ingrid Castillo', 'CREATE', 'App · App Móvil Vendedores', 'Registro en DEV', '10.20.4.18', 'app-vendedores'],
  ['2026-11-24T16:02:00-06:00', 'Carlos Mejía', 'DELETE', 'Usuario · jreyes', 'Bloqueo por inactividad', '10.20.6.12', null],
].map(([at, user, action, entity, detail, ip, appCode], i) => ({ id: `aud-${1000 + i}`, at, user, action, entity, detail, ip, appCode }));

export const activity = [
  { id: 'act-1', initials: 'HC', tone: 'info', html: '<b>Hathziri Carbajal</b> actualizó la configuración de <b>Ventas POS</b>', at: minutesAgo(8), meta: 'PROD' },
  { id: 'act-2', initials: '!', tone: 'err', html: '<b>Pagos Premios</b> superó el umbral de latencia (1.8 s)', at: minutesAgo(22), meta: 'Alerta automática' },
  { id: 'act-3', initials: 'IC', tone: 'ok', html: '<b>Ingrid Castillo</b> aprobó el despliegue v2.3.1 de <b>Ventas POS</b>', at: minutesAgo(60), meta: '' },
  { id: 'act-4', initials: 'SG', tone: 'warn', html: '<b>Slilma Garcia</b> asignó el rol <i>Auditor</i> a 3 usuarios', at: minutesAgo(180), meta: '' },
  { id: 'act-5', initials: 'SYS', tone: 'info', html: 'Sincronización con Entra ID completada · 4 altas, 1 baja', at: minutesAgo(200), meta: '' },
];

export const hourlyMetrics = {
  requests: [320, 280, 210, 180, 160, 190, 420, 880, 1240, 1420, 1510, 1580, 1490, 1620, 1700, 1650, 1580, 1720, 1890, 2100, 1950, 1400, 900, 560],
  errors: [2, 1, 0, 0, 1, 0, 3, 5, 8, 6, 4, 7, 5, 9, 12, 8, 6, 5, 7, 11, 9, 4, 2, 1],
};
