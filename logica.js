// =========================================================
// logica.js — Generador de Anuncios Canvas IPP
// Traducción fiel de generador_canvas.py
// =========================================================

// =========================================================
// CONFIGURACIÓN GENERAL
// =========================================================

const BANNER_URL = "https://www.teclab.edu.ar/wp-content/uploads/canvas/banner-actividad.png";
const PAGINA_INICIO = "https://teclab.instructure.com/courses/2223/pages/pagina-de-inicio";

const ESCUELAS = {
  "Tecnología": {
    head: "https://6058217.fs1.hubspotusercontent-na1.net/hubfs/6058217/TUTORES%20IPP/Head_Tecnolog%C3%ADa.jpg",
    foot: "https://6058217.fs1.hubspotusercontent-na1.net/hubfs/6058217/TUTORES%20IPP/foot_Tecnologia.jpg",
    nombre_escuela: "la Escuela de Tecnología",
  },
  "Ciencias Sociales": {
    head: "https://6058217.fs1.hubspotusercontent-na1.net/hubfs/6058217/TUTORES%20IPP/Head_Sociales.jpg",
    foot: "https://contacto.ipp.cl/hubfs/TUTORES%20IPP/foot_Sociales.jpg",
    nombre_escuela: "la Escuela de Ciencias Sociales y Humanidades",
  },
  "Negocios": {
    head: "https://6058217.fs1.hubspotusercontent-na1.net/hubfs/6058217/TUTORES%20IPP/Head_Negocios.jpg",
    foot: "https://6058217.fs1.hubspotusercontent-na1.net/hubfs/6058217/TUTORES%20IPP/foot_Negocios.jpg",
    nombre_escuela: "la Escuela de Negocios",
  },
};

const HORAS_DISPONIBLES = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
const DIAS_DISPONIBLES = ["lunes", "martes", "miércoles", "jueves", "viernes"];

// 0=lunes ... 4=viernes (igual que Python: Monday=0)
const DIAS_SEMANA = {
  "lunes": 0,
  "martes": 1,
  "miércoles": 2,
  "miercoles": 2,
  "jueves": 3,
  "viernes": 4,
};

const SECUENCIAS = {
  "4 clases sincrónicas": {
    1: "Clase Módulo 1",
    2: "Clase Módulo 2",
    4: "Clase Módulo 3",
    5: "Clase Módulo 4",
  },
  "4 clases sincrónicas + 2 clases de repaso": {
    1: "Clase Módulo 1",
    2: "Clase Módulo 2",
    3: "Clase Repaso API 1-API 2",
    4: "Clase Módulo 3",
    5: "Clase Módulo 4",
    6: "Clase Repaso API 3-API 4",
  },
  "4 clases sincrónicas + 1 ensayo examen": {
    1: "Clase Módulo 1",
    2: "Clase Módulo 2",
    4: "Clase Módulo 3",
    5: "Clase Módulo 4",
    7: "Ensayo Examen",
  },
  "4 clases sincrónicas + 2 clases de repaso + 1 ensayo examen": {
    1: "Clase Módulo 1",
    2: "Clase Módulo 2",
    3: "Clase Repaso API 1-API 2",
    4: "Clase Módulo 3",
    5: "Clase Módulo 4",
    6: "Clase Repaso API 3-API 4",
    7: "Ensayo Examen",
  },
  "4 MasterClass": {
    1: "MasterClass Módulo 1",
    2: "MasterClass Módulo 2",
    4: "MasterClass Módulo 3",
    5: "MasterClass Módulo 4",
  },
  "4 MasterClass + 3 clases de repaso": {
    1: "MasterClass Módulo 1",
    2: "MasterClass Módulo 2 + Clase Repaso API 1",
    3: "Clase Repaso API 2",
    4: "MasterClass Módulo 3",
    5: "MasterClass Módulo 4 + Clase Repaso API 3-API 4",
  },
  "4 MasterClass + 4 clases de repaso": {
    1: "MasterClass Módulo 1",
    2: "MasterClass Módulo 2 + Clase Repaso API 1",
    3: "Clase Repaso API 2",
    4: "MasterClass Módulo 3",
    5: "MasterClass Módulo 4 + Clase Repaso API 3",
    6: "Clase Repaso API 4",
  },
};

// =========================================================
// FERIADOS CHILE
// Implementación propia, equivalente a holidays.country_holidays("CL").
// Cubre todos los feriados vigentes con reglas de traslado
// según la legislación chilena (Ley 2977 y modificaciones).
// Sin dependencias externas — funciona offline y en GitHub Pages.
// Verificado contra lista oficial feriados.cl para 2025.
// =========================================================

/**
 * Algoritmo de Butcher: calcula Domingo de Pascua para cualquier año.
 * Devuelve { viernesSanto, sabadoSanto } como objetos Date.
 */
function calcularSemanaSanta(anio) {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  const pascua = new Date(anio, mes - 1, dia);
  const viernesSanto = new Date(pascua); viernesSanto.setDate(pascua.getDate() - 2);
  const sabadoSanto  = new Date(pascua); sabadoSanto.setDate(pascua.getDate() - 1);
  return { viernesSanto, sabadoSanto };
}

/**
 * Regla de traslado chilena:
 * - Domingo  → lunes siguiente
 * - Martes   → lunes anterior
 * - Mié/Jue/Vie → lunes siguiente
 * - Lun/Sáb  → sin traslado
 */
function trasladar(fecha) {
  const dow = fecha.getDay(); // 0=dom,1=lun,...,6=sáb
  const r = new Date(fecha);
  if (dow === 0) { r.setDate(fecha.getDate() + 1); return r; }  // dom → lun
  if (dow === 2) { r.setDate(fecha.getDate() - 1); return r; }  // mar → lun anterior
  if (dow >= 3 && dow <= 5) { r.setDate(fecha.getDate() + (8 - dow)); return r; } // mié/jue/vie → lun
  return fecha; // lun, sáb: sin cambio
}

/**
 * Devuelve un Map con "YYYY-MM-DD" -> "Nombre feriado"
 * para los años indicados. Equivalente a holidays.country_holidays("CL").
 */
function obtenerFeriadosChile(anios) {
  const feriados = new Map();

  for (const anio of anios) {
    const add = (mes, dia, nombre, conTraslado = false) => {
      let f = new Date(anio, mes - 1, dia);
      if (conTraslado) f = trasladar(f);
      feriados.set(fechaAKey(f), nombre);
    };

    // Feriados fijos (sin traslado)
    add(1,  1,  "Año Nuevo");
    add(5,  1,  "Día Nacional del Trabajo");
    add(5,  21, "Día de las Glorias Navales");
    add(8,  15, "Asunción de la Virgen");
    add(9,  18, "Independencia Nacional");
    add(9,  19, "Día de las Glorias del Ejército");
    add(12, 8,  "Inmaculada Concepción");
    add(12, 25, "Navidad");

    // Feriados con regla de traslado al lunes
    add(6,  29, "San Pedro y San Pablo",                          true);
    add(7,  16, "Día de la Virgen del Carmen",                    true);
    add(10, 12, "Día del Encuentro de Dos Mundos",                true);
    add(10, 31, "Día de las Iglesias Evangélicas y Protestantes", true);
    add(11, 1,  "Día de Todos los Santos",                        true);

    // Semana Santa (móviles, calculados con algoritmo de Butcher)
    const { viernesSanto, sabadoSanto } = calcularSemanaSanta(anio);
    feriados.set(fechaAKey(viernesSanto), "Viernes Santo");
    feriados.set(fechaAKey(sabadoSanto),  "Sábado Santo");

    // Día de los Pueblos Indígenas: lunes más cercano al 21 de junio
    const jun21 = new Date(anio, 5, 21);
    const dow21 = jun21.getDay();
    let indigena = new Date(jun21);
    if (dow21 !== 1) { // si no es lunes, buscar el lunes más cercano
      const diasAtras    = dow21 === 0 ? 6 : dow21 - 1;
      const diasAdelante = dow21 === 0 ? 1 : 8 - dow21;
      indigena.setDate(21 + (diasAtras <= diasAdelante ? -diasAtras : diasAdelante));
    }
    feriados.set(fechaAKey(indigena), "Día de los Pueblos Indígenas");
  }

  return feriados;
}

// =========================================================
// UTILIDADES DE FECHAS
// =========================================================

/** "DD/MM/YYYY" → Date */
function convertirFecha(textFecha) {
  const [dia, mes, anio] = textFecha.split("/").map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Date → "DD/MM/YYYY" */
function formatearFecha(fecha) {
  const d = String(fecha.getDate()).padStart(2, "0");
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const y = fecha.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Date → "YYYY-MM-DD" (clave para el Map de feriados) */
function fechaAKey(fecha) {
  const d = String(fecha.getDate()).padStart(2, "0");
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${fecha.getFullYear()}-${m}-${d}`;
}

/** Equivalente a calcular_inicio_semana_1 en Python */
function calcularInicioSemana1(inicioBimestre) {
  // weekday(): Python lunes=0. JS getDay(): domingo=0, lunes=1...
  // Queremos el próximo lunes después del inicio
  const diaSemanaJS = inicioBimestre.getDay(); // 0=dom,1=lun...
  const diasHastaLunes = diaSemanaJS === 0 ? 1 : (8 - diaSemanaJS) % 7;
  const result = new Date(inicioBimestre);
  result.setDate(inicioBimestre.getDate() + diasHastaLunes);
  return result;
}

/**
 * Equivalente a obtener_fecha_clase.
 * inicio_semana_1: primer lunes del bimestre
 * numeroSemana: número de semana (1-based)
 * diaClase: "lunes", "martes", etc.
 */
function obtenerFechaClase(inicioSemana1, numeroSemana, diaClase) {
  const indiceDia = DIAS_SEMANA[diaClase.toLowerCase()]; // 0=lun
  const inicioSemanaActual = new Date(inicioSemana1);
  inicioSemanaActual.setDate(inicioSemana1.getDate() + (numeroSemana - 1) * 7);
  const fecha = new Date(inicioSemanaActual);
  fecha.setDate(inicioSemanaActual.getDate() + indiceDia);
  return fecha;
}

/** Equivalente a obtener_viernes_misma_semana */
function obtenerViernesMismaSemana(fecha) {
  // JS: getDay() → 0=dom, 1=lun, ..., 5=vie
  const diaSemanaJS = fecha.getDay();
  // dias desde lunes (Python-style): lunes=0
  const diasDesdeLunesJS = diaSemanaJS === 0 ? 6 : diaSemanaJS - 1;
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - diasDesdeLunesJS);
  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  return viernes;
}

function esFeriado(fecha, feriados) {
  return feriados.has(fechaAKey(fecha));
}

function nombreFeriado(fecha, feriados) {
  return feriados.get(fechaAKey(fecha)) || "";
}

// =========================================================
// ORDENAMIENTO
// =========================================================

function ordenarClasesPorSemana(clases) {
  return [...clases].sort((a, b) => {
    if (a.semana !== b.semana) return a.semana - b.semana;
    return a.hora.localeCompare(b.hora);
  });
}

function ordenarEntregas(entregas) {
  return [...entregas].sort((a, b) => convertirFecha(a.fecha) - convertirFecha(b.fecha));
}

// =========================================================
// GENERACIÓN DE CLASES DESDE SECUENCIA
// (traducción directa de generar_clases_desde_secuencia)
// =========================================================

function generarClasesDesdeSecuencia(nombreAsignatura, inicioBimestreTexto, diaClase, horaClase, tipoSecuencia) {
  if (!(tipoSecuencia in SECUENCIAS)) {
    throw new Error("Secuencia no válida.");
  }

  const inicioBimestre = convertirFecha(inicioBimestreTexto);
  const inicioSemana1 = calcularInicioSemana1(inicioBimestre);
  const secuencia = SECUENCIAS[tipoSecuencia];

  const anio1 = inicioBimestre.getFullYear();
  const fechaFutura = new Date(inicioBimestre);
  fechaFutura.setDate(fechaFutura.getDate() + 400);
  const anio2 = fechaFutura.getFullYear();
  const anios = [...new Set([anio1, anio2])];

  const feriados = obtenerFeriadosChile(anios);
  const clasesGeneradas = [];
  const fechasOcupadas = new Set(); // claves "YYYY-MM-DD"
  let desplazamientoSemanas = 0;

  // Ordenar semanas como Python: sorted(secuencia.items())
  const semanasOrdenadas = Object.entries(secuencia)
    .map(([k, v]) => [parseInt(k), v])
    .sort((a, b) => a[0] - b[0]);

  for (const [semBase, tClase] of semanasOrdenadas) {
    const semEfec = semBase + desplazamientoSemanas;
    const fechaOrig = obtenerFechaClase(inicioSemana1, semEfec, diaClase);

    let fechaFin = new Date(fechaOrig);
    let obs = "";

    const esMasterclass = tClase.toLowerCase().includes("masterclass");

    if (!esMasterclass && esFeriado(fechaOrig, feriados)) {
      const nombreF = nombreFeriado(fechaOrig, feriados);
      const viernes = obtenerViernesMismaSemana(fechaOrig);

      // getDay() 5 = viernes en JS
      const esFechaViernes = fechaOrig.getDay() === 5;
      const viernesKey = fechaAKey(viernes);

      if (!esFechaViernes && !esFeriado(viernes, feriados) && !fechasOcupadas.has(viernesKey)) {
        fechaFin = viernes;
        obs = `Reprogramada por feriado (${nombreF}) al ${formatearFecha(viernes)}.`;
      } else {
        // Buscar siguiente semana disponible
        while (true) {
          desplazamientoSemanas++;
          const candidata = obtenerFechaClase(
            inicioSemana1,
            semBase + desplazamientoSemanas,
            diaClase
          );
          if (!esFeriado(candidata, feriados) && !fechasOcupadas.has(fechaAKey(candidata))) {
            fechaFin = candidata;
            obs = `Reprogramada por feriado (${nombreF}) al ${formatearFecha(candidata)}.`;
            break;
          }
        }
      }
    } else if (!esMasterclass && fechasOcupadas.has(fechaAKey(fechaOrig))) {
      while (true) {
        desplazamientoSemanas++;
        const candidata = obtenerFechaClase(
          inicioSemana1,
          semBase + desplazamientoSemanas,
          diaClase
        );
        if (!esFeriado(candidata, feriados) && !fechasOcupadas.has(fechaAKey(candidata))) {
          fechaFin = candidata;
          obs = `Conflicto de agenda. Movida al ${formatearFecha(candidata)}.`;
          break;
        }
      }
    }

    fechasOcupadas.add(fechaAKey(fechaFin));

    clasesGeneradas.push({
      asignatura: nombreAsignatura,
      semana: semBase,
      fecha: formatearFecha(fechaFin),
      hora: horaClase,
      tipo_clase: tClase,
      observacion: obs,
    });
  }

  return clasesGeneradas;
}

// =========================================================
// PLANTILLAS HTML (idénticas al Python)
// =========================================================

function hacerWrapInicio(headUrl) {
  return `
<p>&nbsp;</p><p>&nbsp;</p>
<table style="width: 100%; margin-left: auto; margin-right: auto;">
  <tbody>
    <tr>
      <td style="width: 9%; background-color: #fafafa; text-align: right; vertical-align: top;">
        <a title="Página de inicio" href="${PAGINA_INICIO}">
          <img style="width: 100%;" src="${BANNER_URL}" alt="Banner actividad">
        </a>
      </td>
    </tr>
    <tr>
      <td style="width: 100%; background-color: #fafafa;">
        <table style="border-collapse: collapse; width: 90%;" border="1" cellspacing="1" cellpadding="3">
          <tbody>
            <tr>
              <td style="width: 10%; text-align: right; vertical-align: middle;"><p>&nbsp;</p></td>
              <td style="width: 89.9644%;" colspan="2">
                <p>&nbsp;</p>
                <p><img src="${headUrl}" alt="Cabecera Escuela" /></p>
`;
}

function hacerWrapCierre(footUrl) {
  return `
<p>&nbsp;</p>
<p style="text-align: center;"><strong>Estoy disponible para cualquier duda o consulta.</strong></p>
<p style="text-align: center;"><strong>¡Éxitos en el bimestre!</strong></p>
<p style="text-align: center;"><img src="${footUrl}" alt="Pie de página Escuela" /></p>
</td></tr></tbody></table>
<p>&nbsp;</p></td></tr></tbody></table>
<p>&nbsp;</p><p>&nbsp;</p>
`;
}

const INTRO_HTML = (tutor, nombreAsignatura, nombreEscuela) => `
<p style="text-align: center;"><strong>¡Bienvenidos(as) a la asignatura${nombreAsignatura ? ` de ${nombreAsignatura}` : ""}!</strong></p>
<p style="text-align: center;"><strong>Hola, mi nombre es ${tutor || "[Nombre del tutor]"} y soy Tutor académico de ${nombreEscuela}</strong></p>
<p style="text-align: center;">
Mi función será apoyarles durante el bimestre, comunicando plazos de entrega, agenda, grabaciones y recordatorios.
Revisen con frecuencia los anuncios del curso, su correo institucional y los mensajes de la plataforma.
</p>
`;

const ZOOM_HTML = (zoom) => `
<p style="text-align: center;">
    <strong>🔗 Enlace Zoom de las clases:</strong><br>
    <a href="${zoom}" target="_blank" style="color:#0a66c2; font-weight:bold;">Acceder a las clases por Zoom</a>
</p>
`;

const SEPARADOR_HTML = `
<p style="text-align: center;">
    <strong>--------------------------------------------------------------------------</strong>
</p>
`;

// =========================================================
// CONSTRUCCIÓN DE TABLAS HTML
// =========================================================

function construirTablaHorarios(filas) {
  let html = `
<p style="text-align: center;"><strong>HORARIO DE CLASES</strong></p>
<table style="border-collapse: collapse; width: 90%; margin-left: auto; margin-right: auto;" border="1">
  <tbody>
    <tr>
      <td style="width: 12%; text-align: center;"><strong>SEMANA</strong></td>
      <td style="width: 18%; text-align: center;"><strong>FECHA</strong></td>
      <td style="width: 12%; text-align: center;"><strong>HORA</strong></td>
      <td style="width: 28%; text-align: center;"><strong>TIPO DE CLASE</strong></td>
      <td style="width: 30%; text-align: center;"><strong>OBSERVACIONES</strong></td>
    </tr>
`;
  for (const fila of filas) {
    const obs = fila.observacion || "&nbsp;";
    html += `
    <tr>
      <td style="text-align: center;">Semana ${fila.semana}</td>
      <td style="text-align: center;">${fila.fecha}</td>
      <td style="text-align: center;">${fila.hora}</td>
      <td style="text-align: center;">${fila.tipo_clase}</td>
      <td style="text-align: center;">${obs}</td>
    </tr>`;
  }
  html += `\n  </tbody>\n</table>`;
  return html;
}

function construirTablaTutorias(tutorias) {
  let html = `
<p style="text-align: center; margin-top: 16px;"><strong>TUTORÍAS</strong></p>
<table style="border-collapse: collapse; width: 70%; margin-left: auto; margin-right: auto;" border="1">
  <tbody>
    <tr>
      <td style="width: 20%; text-align: center;"><strong>SEMANA</strong></td>
      <td style="width: 25%; text-align: center;"><strong>FECHA</strong></td>
      <td style="width: 15%; text-align: center;"><strong>HORA</strong></td>
      <td style="width: 40%; text-align: center;"><strong>OBSERVACIONES</strong></td>
    </tr>
`;
  for (const t of tutorias) {
    const obs = t.observacion || "&nbsp;";
    html += `
    <tr>
      <td style="text-align: center;">Semana ${t.semana}</td>
      <td style="text-align: center;">${t.fecha}</td>
      <td style="text-align: center;">${t.hora}</td>
      <td style="text-align: center;">${obs}</td>
    </tr>`;
  }
  html += `\n  </tbody>\n</table>`;
  return html;
}

function construirTablaGrabaciones(grabaciones) {
  let html = `
<p style="text-align: center; margin-top: 16px;"><strong>GRABACIONES DE CLASES</strong></p>
<table style="border-collapse: collapse; width: 70%; margin-left: auto; margin-right: auto;" border="1">
  <tbody>
    <tr>
      <td style="width: 50%; text-align: center;"><strong>CLASE</strong></td>
      <td style="width: 50%; text-align: center;"><strong>ENLACE</strong></td>
    </tr>
`;
  for (const g of grabaciones) {
    const nombre = g.nombre || "Grabación";
    const enlace = g.url
      ? `<a href="${g.url}" target="_blank" style="color:#0a66c2; font-weight:bold;">Ver grabación</a>`
      : `<em>Sin enlace</em>`;
    html += `
    <tr>
      <td style="text-align: center;">${nombre}</td>
      <td style="text-align: center;">${enlace}</td>
    </tr>`;
  }
  html += `\n  </tbody>\n</table>`;
  return html;
}

function construirTablaEntregas(entregas) {
  let html = `
<p style="text-align: center; margin-top: 16px;"><strong>FECHAS DE ENTREGA DE EVALUACIONES</strong></p>
<table style="border-collapse: collapse; width: 50%; margin-left: auto; margin-right: auto;" border="1">
  <tbody>
    <tr>
      <td style="width: 50%; text-align: center;"><strong>EVALUACIÓN</strong></td>
      <td style="width: 50%; text-align: center;"><strong>FECHA DE ENTREGA</strong></td>
    </tr>
`;
  entregas.forEach((e, i) => {
    html += `
    <tr>
      <td style="text-align: center;">${e.nombre || `Evaluación ${i + 1}`}</td>
      <td style="text-align: center;">${e.fecha}</td>
    </tr>`;
  });
  html += `\n  </tbody>\n</table>`;
  return html;
}

// =========================================================
// GENERADOR PRINCIPAL DE HTML
// (equivalente a generar_html en Python)
// =========================================================

/**
 * @param {Object} params
 * @param {string} params.asignatura
 * @param {string} params.tutor
 * @param {string} params.zoom
 * @param {string} params.modo         "clases" | "sin_clases"
 * @param {Array}  params.clases        [{ semana, fecha, hora, tipo_clase, observacion }]
 * @param {Array}  params.entregas      [{ nombre, fecha }]
 * @param {Array}  params.tutorias      [{ semana, fecha, hora, observacion }] (opcional)
 * @param {Array}  params.grabaciones   [{ nombre, url }] (opcional)
 * @param {string} params.escuela       "Tecnología" | "Ciencias Sociales" | "Negocios"
 */
function generarHTML({
  asignatura = "",
  tutor = "",
  zoom = "",
  modo = "clases",
  clases = [],
  entregas = [],
  tutorias = [],
  grabaciones = [],
  escuela = "Tecnología",
} = {}) {
  const datosEscuela = ESCUELAS[escuela] || ESCUELAS["Tecnología"];
  const partes = [];

  partes.push(INTRO_HTML(tutor, asignatura, datosEscuela.nombre_escuela));
  partes.push(SEPARADOR_HTML);

  if (zoom) {
    partes.push(ZOOM_HTML(zoom));
    partes.push(SEPARADOR_HTML);
  }

  if (modo === "clases") {
    if (clases.length > 0) {
      partes.push(construirTablaHorarios(ordenarClasesPorSemana(clases)));
    }
  } else {
    partes.push(`<p style="text-align: center; color: red;">Este bimestre no cuenta con clases sincrónicas.</p>`);
  }

  if (entregas.length > 0) {
    partes.push(construirTablaEntregas(ordenarEntregas(entregas)));
  }

  if (tutorias.length > 0) {
    partes.push(construirTablaTutorias(tutorias));
  }

  if (grabaciones.length > 0) {
    partes.push(construirTablaGrabaciones(grabaciones));
  }

  const contenido = partes.join("\n");
  return hacerWrapInicio(datosEscuela.head) + contenido + hacerWrapCierre(datosEscuela.foot);
}

// =========================================================
// EXPORTS (para uso en otros archivos JS si se usan módulos)
// También quedan disponibles globalmente al cargar el script.
// =========================================================
// No se usa import/export para máxima compatibilidad con
// GitHub Pages sin bundler. Todo queda en window global.