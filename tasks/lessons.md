# Lessons Learned - Gestión IQ

## 2026-08-31 — Módulo de Conciliación de Transferencias (UX/UI y Persistencia)

### Correcciones aplicadas y Patrones Detectados
1. **Evitar Selectores Nativos `<select>` en Tablas:** Los elementos `<select>` nativos HTML en tablas o vistas de administración se despliegan sobre toda la pantalla sin opción de búsqueda, arruinando la usabilidad.
   - *Nueva regla:* Usar siempre un Modal/Buscador Flotante con input de filtrado instantáneo para seleccionar o asignar entidades de listas largas.

2. **Evitar Sub-modales Anidados:** Abrir un modal sobre otro modal (popup sobre popup) resulta confuso e incómodo.
   - *Nueva regla:* Integrar el buscador y las acciones de imputación directamente dentro del cuerpo principal del modal.

3. **Cero Scroll Horizontal Extremo:** La propiedad `whitespace-nowrap` o anchos fijos arbitrarios en tablas provocan desbordamientos laterales en monitores de 19" o portátiles.
   - *Nueva regla:* Utilizar `table-fixed w-full` con anchos porcentuales explícitos (`w-[22%]`, etc.) o tarjetas verticales apilables en móvil para garantizar 100% de ajuste visual sin barras de desplazamiento lateral.

4. **Montos Imputados Editables:** Al vincular una transferencia con cirugías, no asumir imputaciones fijas. Permitir la edición numérica libre del importe a saldar con recálculo de saldos pendientes en tiempo real.

5. **Protección de Costos IA y Borradores:** Utilizar binary hashing SHA-256 en cliente previa llamada a Edge Functions de IA para devolver resultados desde caché en <50ms a costo $0 para archivos repetidos, conservando el progreso en `localStorage` y Supabase `conciliacion_borradores`.
