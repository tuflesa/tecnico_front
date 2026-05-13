/**
 * man_gantt_pdf.js
 * Exporta el Gantt a PDF en landscape A4 usando jsPDF + html2canvas.
 *
 * Instalación necesaria (si no las tienes ya):
 *   npm install jspdf html2canvas
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * @param {React.RefObject} ganttRef  - ref del div que envuelve ManGanttTabla
 * @param {Object}          filtros   - filtros activos (para el pie de página)
 * @param {number}          windowDias
 */
export async function exportarGanttPDF(ganttRef, filtros, windowDias) {
  const element = ganttRef?.current;
  if (!element) {
    console.error('exportarGanttPDF: ref no disponible');
    return;
  }

  // ── 1. Capturar el DOM con html2canvas ───────────────────────────────────
  const canvas = await html2canvas(element, {
    scale: 2,                  // alta resolución
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,  // evita offset por scroll
    windowWidth: element.scrollWidth,
  });

  const imgData   = canvas.toDataURL('image/png');
  const imgWidth  = canvas.width;
  const imgHeight = canvas.height;

  // ── 2. Calcular proporciones para A4 landscape ───────────────────────────
  const PDF_W = 297;  // mm A4 landscape ancho
  const PDF_H = 210;  // mm A4 landscape alto
  const MARGIN = 10;  // mm

  const areaW = PDF_W - MARGIN * 2;
  const areaH = PDF_H - MARGIN * 2 - 20; // 20mm reservados para cabecera+pie

  const ratio    = imgWidth / imgHeight;
  let renderW = areaW;
  let renderH = renderW / ratio;

  // Si la imagen es más alta que el área disponible → paginar
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const totalPaginas = Math.ceil(renderH / areaH);

  for (let pagina = 0; pagina < totalPaginas; pagina++) {
    if (pagina > 0) doc.addPage();

    // ── Cabecera ────────────────────────────────────────────────────────
    _dibujaCabecera(doc, PDF_W, MARGIN, pagina + 1, totalPaginas, filtros, windowDias);

    // ── Recorte de la imagen para esta página ───────────────────────────
    const srcY      = pagina * areaH * (imgHeight / renderH);
    const srcH      = areaH * (imgHeight / renderH);
    const dstY      = MARGIN + 16; // debajo de la cabecera

    // Creamos un canvas temporal con el recorte
    const slice = document.createElement('canvas');
    slice.width  = imgWidth;
    slice.height = Math.min(srcH, imgHeight - srcY);
    const ctx = slice.getContext('2d');
    ctx.drawImage(
      canvas,
      0, srcY, imgWidth, slice.height,
      0, 0,    imgWidth, slice.height
    );
    const sliceData = slice.toDataURL('image/png');

    const sliceRenderH = (slice.height / imgHeight) * renderH;
    doc.addImage(sliceData, 'PNG', MARGIN, dstY, areaW, Math.min(sliceRenderH, areaH));

    // ── Pie ─────────────────────────────────────────────────────────────
    _dibujaPie(doc, PDF_W, PDF_H, MARGIN, pagina + 1, totalPaginas);
  }

  // ── 3. Guardar ───────────────────────────────────────────────────────────
  const fechaHoy = new Date().toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' });
  doc.save(`gantt_mantenimiento_${fechaHoy.replace(/\//g,'-')}.pdf`);
}

// ── Helpers privados ─────────────────────────────────────────────────────────

function _dibujaCabecera(doc, pdfW, margin, paginaActual, totalPaginas, filtros, windowDias) {
  // Banda de color
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pdfW, 14, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Diagrama Gantt — Mantenimiento', margin, 9);

  // Fecha de generación
  const ahora = new Date().toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${ahora}`, pdfW - margin, 9, { align: 'right' });

  // Sub-banda con filtros activos
  doc.setFillColor(240, 240, 248);
  doc.rect(0, 14, pdfW, 8, 'F');
  doc.setTextColor(80, 80, 100);
  doc.setFontSize(7);

  const partesFiltro = [];
  if (filtros.zona__id) partesFiltro.push(`Zona: ${filtros.zona__id}`);
  if (filtros.tipo)     partesFiltro.push(`Tipo: ${filtros.tipo}`);
  if (filtros.estado)   partesFiltro.push(`Estado: ${filtros.estado}`);
  if (filtros.fecha_prevista_inicio__gte) partesFiltro.push(`Desde: ${filtros.fecha_prevista_inicio__gte}`);
  if (filtros.fecha_prevista_inicio__lte) partesFiltro.push(`Hasta: ${filtros.fecha_prevista_inicio__lte}`);
  partesFiltro.push(`Ventana: ${windowDias} días`);

  doc.text(partesFiltro.join('   ·   '), margin, 19.5);
}

function _dibujaPie(doc, pdfW, pdfH, margin, paginaActual, totalPaginas) {
  doc.setFillColor(248, 248, 248);
  doc.rect(0, pdfH - 8, pdfW, 8, 'F');

  doc.setDrawColor(220, 220, 220);
  doc.line(0, pdfH - 8, pdfW, pdfH - 8);

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión de Mantenimiento', margin, pdfH - 3);
  doc.text(`Página ${paginaActual} de ${totalPaginas}`, pdfW - margin, pdfH - 3, { align: 'right' });

  // Leyenda de colores
  const leyenda = [
    { color: [24, 95, 165],  label: 'Preventivo' },
    { color: [153, 60, 29],  label: 'Correctivo' },
    { color: [15, 110, 86],  label: 'Mejora' },
    { color: [133, 79, 11],  label: 'PRL' },
    { color: [29, 158, 117], label: 'Fin real' },
  ];
  let lx = pdfW / 2 - 60;
  leyenda.forEach(({ color, label }) => {
    doc.setFillColor(...color);
    doc.roundedRect(lx, pdfH - 6.5, 4, 4, 0.5, 0.5, 'F');
    doc.setTextColor(100, 100, 100);
    doc.text(label, lx + 5.5, pdfH - 3.5);
    lx += label.length * 1.8 + 10;
  });
}
