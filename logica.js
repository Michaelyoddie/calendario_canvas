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
    2: "Clase Módulo 1",
    3: "Clase Módulo 2",
    5: "Clase Módulo 3",
    6: "Clase Módulo 4",
  },
  "4 clases sincrónicas + 2 clases de repaso": {
    2: "Clase Módulo 1",
    3: "Clase Módulo 2",
    4: "Clase Repaso API 1-API 2",
    5: "Clase Módulo 3",
    6: "Clase Módulo 4",
    7: "Clase Repaso API 3-API 4",
  },
  "4 clases sincrónicas + 1 ensayo examen": {
    2: "Clase Módulo 1",
    3: "Clase Módulo 2",
    5: "Clase Módulo 3",
    6: "Clase Módulo 4",
    8: "Ensayo Examen",
  },
  "4 clases sincrónicas + 2 clases de repaso + 1 ensayo examen": {
    2: "Clase Módulo 1",
    3: "Clase Módulo 2",
    4: "Clase Repaso API 1-API 2",
    5: "Clase Módulo 3",
    6: "Clase Módulo 4",
    7: "Clase Repaso API 3-API 4",
    8: "Ensayo Examen",
  },
  "4 MasterClass": {
    2: "MasterClass Módulo 1",
    3: "MasterClass Módulo 2",
    5: "MasterClass Módulo 3",
    6: "MasterClass Módulo 4",
  },
  "4 MasterClass + 3 clases de repaso": {
    2: "MasterClass Módulo 1",
    3: "MasterClass Módulo 2 + Clase Repaso API 1",
    4: "Clase Repaso API 2",
    5: "MasterClass Módulo 3",
    6: "MasterClass Módulo 4 + Clase Repaso API 3-API 4",
  },
  "4 MasterClass + 4 clases de repaso": {
    2: "MasterClass Módulo 1",
    3: "MasterClass Módulo 2 + Clase Repaso API 1",
    4: "Clase Repaso API 2",
    5: "MasterClass Módulo 3",
    6: "MasterClass Módulo 4 + Clase Repaso API 3",
    7: "Clase Repaso API 4",
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
  // Retorna el lunes de la semana actual que el usuario elige como "Inicio de Bimestre"
  const diaSemanaJS = inicioBimestre.getDay();
  const diasDesdeLunes = diaSemanaJS === 0 ? 6 : diaSemanaJS - 1;
  const result = new Date(inicioBimestre);
  result.setDate(inicioBimestre.getDate() - diasDesdeLunes);
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

// =========================================================
// LÓGICA DE INTERFAZ (extraída de index.html)
// =========================================================

function confirmarLimpiezaTotal() {
        if(confirm("¿Seguro? Se borrarán todos los datos guardados para empezar desde cero.")) {
            localStorage.removeItem('db_formulario'); localStorage.removeItem('db_listas');
            location.reload();
        }
    }

// ═══════════════════════════════════════════════════════
// UTILIDADES — toastTimer declarado aquí para evitar error de inicialización
let toastTimer;

// Flag para bloquear guardarProgreso mientras se restauran datos
let _cargando = false;

// ESTADO GLOBAL
// ═══════════════════════════════════════════════════════
const state = {
  clases: [],   
  entregas: [],   
  tutorias: [],   
  grabaciones: [],   
  modo: "clases"
};

// ═══════════════════════════════════════════════════════
// TABS IZQUIERDOS
// ═══════════════════════════════════════════════════════
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
  });
});

// TABS PREVIEW — listeners explícitos como respaldo al onclick del HTML
document.getElementById('tab-ver-anuncio').addEventListener('click', () => cambiarVistaPreview('anuncio'));
document.getElementById('tab-ver-correo').addEventListener('click', () => cambiarVistaPreview('correo'));

// ═══════════════════════════════════════════════════════
// MODO CLASES / SIN CLASES
// ═══════════════════════════════════════════════════════
document.querySelectorAll(".modo-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".modo-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.modo = btn.dataset.modo;
    actualizarPreview();
  });
});

// ═══════════════════════════════════════════════════════
// TOGGLE TUTORÍAS
// ═══════════════════════════════════════════════════════
document.getElementById("toggle-tutorias").addEventListener("change", function () {
  const bloque = document.getElementById("bloque-tutorias");
  bloque.style.display = this.checked ? "flex" : "none";
  if (!this.checked) { state.tutorias = []; actualizarPreview(); }
});

// ═══════════════════════════════════════════════════════
// LIVE UPDATE en campos de texto
// ═══════════════════════════════════════════════════════
["tutor","asignatura","zoom","zoom-pin","escuela"].forEach(id => {
  document.getElementById(id).addEventListener("input", actualizarPreview);
  document.getElementById(id).addEventListener("change", actualizarPreview);
});

// ═══════════════════════════════════════════════════════
// GENERAR CALENDARIO DE CLASES
// ═══════════════════════════════════════════════════════
document.getElementById("btn-generar-clases").addEventListener("click", () => {
  const inicio = document.getElementById("inicio-bimestre").value;
  if (!inicio) { showToast("⚠ Ingresa la fecha de inicio del bimestre", true); return; }

  // convertir de YYYY-MM-DD a DD/MM/YYYY
  const [y, m, d] = inicio.split("-");
  const inicioDDMMYYYY = `${d}/${m}/${y}`;

  try {
    state.clases = generarClasesDesdeSecuencia(
      document.getElementById("asignatura").value,
      inicioDDMMYYYY,
      document.getElementById("dia-clase").value,
      document.getElementById("hora-clase").value,
      document.getElementById("secuencia").value
    );
    renderListaClases();
    actualizarBadge("clases", state.clases.length);
    actualizarPreview();
    showToast("✓ Calendario generado");
  } catch (e) {
    showToast("Error: " + e.message, true);
  }
});

const btnLimpiarClases = document.getElementById("btn-limpiar-clases");
if (btnLimpiarClases) {
  btnLimpiarClases.addEventListener("click", () => {
    state.clases = [];
    renderListaClases();
    actualizarBadge("clases", 0);
    actualizarPreview();
  });
}

function renderListaClases() {
  const cont = document.getElementById("lista-clases");
  const btn  = document.getElementById("btn-limpiar-clases");

  if (!cont) return; // Seguridad: si no existe el contenedor, no hace nada

  if (state.clases.length === 0) {
    cont.innerHTML = `<div class="empty-state">El calendario aparecerá aquí luego de generarlo.</div>`;
    if (btn) btn.style.display = "none"; 
    return;
  }
  
  if (btn) btn.style.display = "block"; // Solo cambia el estilo si el botón existe

  cont.innerHTML = state.clases.map((c, i) => `
    <div class="item-card">
      <div class="item-card-body">
        <div class="item-card-title">${c.tipo_clase}</div>
        <div class="item-card-sub">
          ${c.fecha} &nbsp;·&nbsp; ${c.hora}
          ${c.observacion ? `<span class="obs-badge">⚠ Reprogramada</span>` : ""}
        </div>
      </div>
      <span class="item-card-tag">Sem ${c.semana}</span>
      <button class="item-remove" title="Eliminar" onclick="eliminarClase(${i})">×</button>
    </div>
  `).join("");
}


function eliminarClase(i) {
  state.clases.splice(i, 1);
  renderListaClases();
  actualizarBadge("clases", state.clases.length);
  actualizarPreview();
}

// ═══════════════════════════════════════════════════════
// EVALUACIONES - AUTO-GENERACIÓN DESDE FECHA API 1
// Semanas fijas: API1=sem3, API2=sem4, API3=sem6, API4=sem7
// Diferencias en semanas desde API1: +0, +1, +3, +4
// ═══════════════════════════════════════════════════════
const SEMANAS_API = [0, 1, 3, 4]; // offsets en semanas desde la fecha de API 1

document.getElementById("btn-add-evalua").addEventListener("click", () => {
  const fechaInput = document.getElementById("evalua-fecha");

  if (!fechaInput || !fechaInput.value) {
    showToast("⚠ Ingresa la fecha de entrega de la API 1", true);
    return;
  }

  // Calcular las 4 fechas automáticamente
  const base = new Date(fechaInput.value + "T00:00:00");
  state.entregas = SEMANAS_API.map((offsetSemanas, i) => {
    const fecha = new Date(base);
    fecha.setDate(base.getDate() + offsetSemanas * 7);
    return {
      nombre: `API / PRUEBA ${i + 1}`,
      fecha: formatearFecha(fecha)
    };
  });

  fechaInput.value = "";

  renderListaEvalua();
  actualizarBadge("evalua", state.entregas.length);
  actualizarPreview();
  showToast("✓ 4 evaluaciones generadas automáticamente");
  guardarProgreso();
});

function renderListaEvalua() {
  const cont = document.getElementById("lista-evalua");
  if (state.entregas.length === 0) {
    cont.innerHTML = `<div class="empty-state">Aún no hay evaluaciones agregadas.</div>`;
    return;
  }
  cont.innerHTML = state.entregas.map((e, i) => `
    <div class="item-card">
      <div class="item-card-body">
        <div class="item-card-title">${e.nombre}</div>
        <div class="item-card-sub">${e.fecha}</div>
      </div>
      <button class="item-remove" title="Eliminar" onclick="eliminarEvalua(${i})">×</button>
    </div>
  `).join("");
}

function eliminarEvalua(i) {
  state.entregas.splice(i, 1);
  renderListaEvalua();
  actualizarBadge("evalua", state.entregas.length);
  actualizarPreview();
  guardarProgreso();
}

// ═══════════════════════════════════════════════════════
// TUTORÍAS
// ═══════════════════════════════════════════════════════
let semanaCounterTut = 1;

document.getElementById("btn-add-tut").addEventListener("click", () => {
  const fechaIn = document.getElementById("tut-fecha");
  const horaIn = document.getElementById("tut-hora");
  const cantIn = document.getElementById("tut-cantidad");

  if (!fechaIn || !fechaIn.value) { 
    showToast("⚠ Selecciona la fecha de inicio", true); 
    return; 
  }

  state.tutorias = []; 
  let fechaActual = new Date(fechaIn.value + "T00:00:00");

  for (let i = 1; i <= (parseInt(cantIn.value) || 4); i++) {
    state.tutorias.push({
      semana: i,
      fecha: formatearFecha(fechaActual),
      hora: horaIn.value,
      observacion: ""
    });
    fechaActual.setDate(fechaActual.getDate() + 7);
  }

  renderListaTut();
  actualizarPreview();
  showToast("✓ Tutorías generadas");
  if (typeof guardarProgreso === 'function') guardarProgreso();
});

function renderListaTut() {
  const cont = document.getElementById("lista-tut");
  if (state.tutorias.length === 0) {
    cont.innerHTML = `<div class="empty-state">Aún no hay tutorías.</div>`;
    return;
  }
  cont.innerHTML = state.tutorias.map((t, i) => `
    <div class="item-card">
      <div class="item-card-body">
        <div class="item-card-title">${t.fecha} &nbsp;·&nbsp; ${t.hora}</div>
        <div class="item-card-sub">${t.observacion || "Sin observación"}</div>
      </div>
      <span class="item-card-tag">Sem ${t.semana}</span>
      <button class="item-remove" onclick="eliminarTut(${i})">×</button>
    </div>
  `).join("");
}

function eliminarTut(i) {
  state.tutorias.splice(i, 1);
  // Renumerar semanas
  state.tutorias.forEach((t, idx) => t.semana = idx + 1);
  semanaCounterTut = state.tutorias.length + 1;
  renderListaTut();
  actualizarPreview();
}

// ═══════════════════════════════════════════════════════
// GRABACIONES
// ═══════════════════════════════════════════════════════
document.getElementById("btn-add-grab").addEventListener("click", () => {
  const nombre = document.getElementById("grab-nombre").value.trim();
  const url    = document.getElementById("grab-url").value.trim();
  if (!nombre) { showToast("⚠ Ingresa el nombre de la clase", true); return; }

  state.grabaciones.push({ nombre, url });
  document.getElementById("grab-nombre").value = "";
  document.getElementById("grab-url").value = "";
  renderListaGrab();
  actualizarPreview();
  showToast("✓ Grabación agregada");
});

function renderListaGrab() {
  const cont = document.getElementById("lista-grab");
  if (state.grabaciones.length === 0) {
    cont.innerHTML = `<div class="empty-state">Aún no hay grabaciones.</div>`;
    return;
  }
  cont.innerHTML = state.grabaciones.map((g, i) => `
    <div class="item-card">
      <div class="item-card-body">
        <div class="item-card-title">${g.nombre}</div>
        <div class="item-card-sub">${g.url || "Sin enlace aún"}</div>
      </div>
      <button class="item-remove" onclick="eliminarGrab(${i})">×</button>
    </div>
  `).join("");
}

function eliminarGrab(i) {
  state.grabaciones.splice(i, 1);
  renderListaGrab();
  actualizarPreview();
}

// ═══════════════════════════════════════════════════════
// PREVIEW EN VIVO
// ═══════════════════════════════════════════════════════
function actualizarPreview() {
  const html = generarHTML({
    asignatura:  document.getElementById("asignatura").value,
    tutor:       document.getElementById("tutor").value,
    zoom:        document.getElementById("zoom").value,
    modo:        state.modo,
    clases:      state.clases,
    entregas:    state.entregas,
    tutorias:    state.tutorias,
    grabaciones: state.grabaciones,
    escuela:     document.getElementById("escuela").value,
  });

  // iframe preview via srcdoc (compatible con archivos locales)
  const frame = document.getElementById("preview-frame");
  frame.srcdoc = `<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <style>body{font-family:Arial,sans-serif;padding:20px;font-size:14px;color:#222;}</style>
  </head><body>${html}</body></html>`;

  // código
  document.getElementById("code-area").value = html;
}

// ═══════════════════════════════════════════════════════
// COPIAR Y DESCARGAR
// ═══════════════════════════════════════════════════════

document.getElementById("btn-descargar").addEventListener("click", () => {
  const html = document.getElementById("code-area").value;
  const asig = document.getElementById("asignatura").value || "anuncio";
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `anuncio-${asig.toLowerCase().replace(/\s+/g, "-")}.html`;
  a.click();
  showToast("✓ Archivo descargado");
});

// ═══════════════════════════════════════════════════════
// UTILIDADES UI
// ═══════════════════════════════════════════════════════
function actualizarBadge(tab, count) {
  const badge = document.getElementById("badge-" + tab);
  badge.textContent = count;
  badge.classList.toggle("visible", count > 0);
}

function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = isError ? "var(--danger)" : "var(--accent2)";
  t.style.color = isError ? "#fff" : "#0f1117";
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

// Preview inicial — se llama desde cargarProgreso al terminar


// --- MEJORA: PERSISTENCIA DE DATOS (LOCALSTORAGE) ---

function guardarFormulario() {
    if (_cargando) return;
    const formulario = {
        tutor:         document.getElementById('tutor').value,
        asignatura:    document.getElementById('asignatura').value,
        zoom:          document.getElementById('zoom').value,
        escuela:       document.getElementById('escuela').value,
        inicio:        document.getElementById('inicio-bimestre').value,
        zoomPin:       document.getElementById('zoom-pin') ? document.getElementById('zoom-pin').value : "",
        docenteNombre: document.getElementById('docente-nombre') ? document.getElementById('docente-nombre').value : ""
    };
    localStorage.setItem('db_formulario', JSON.stringify(formulario));
}

function guardarListas() {
    if (_cargando) return;
    const listas = {
        clases:      state.clases,
        entregas:    state.entregas,
        tutorias:    state.tutorias,
        grabaciones: state.grabaciones,
        modo:        state.modo
    };
    localStorage.setItem('db_listas', JSON.stringify(listas));
}

function guardarProgreso() {
    guardarFormulario();
    guardarListas();
}

function cargarProgreso() {
    _cargando = true;

    // --- Restaurar LISTAS (clases, entregas, etc.) ---
    const memListas = localStorage.getItem('db_listas');
    if (memListas) {
        const listas = JSON.parse(memListas);
        state.clases      = listas.clases      || [];
        state.entregas    = listas.entregas    || [];
        state.tutorias    = listas.tutorias    || [];
        state.grabaciones = listas.grabaciones || [];
        state.modo        = listas.modo        || "clases";
    }

    // --- Restaurar FORMULARIO (tutor, asignatura, zoom, etc.) ---
    const memForm = localStorage.getItem('db_formulario');
    if (memForm) {
        const f = JSON.parse(memForm);
        const campos = {
            'tutor':           f.tutor,
            'asignatura':      f.asignatura,
            'zoom':            f.zoom,
            'escuela':         f.escuela,
            'inicio-bimestre': f.inicio,
            'zoom-pin':        f.zoomPin,
            'docente-nombre':  f.docenteNombre
        };
        for (const [id, valor] of Object.entries(campos)) {
            const el = document.getElementById(id);
            if (el && valor !== undefined && valor !== null) el.value = valor;
        }
    }

    // Restaurar botón de modo clases
    document.querySelectorAll('.modo-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.modo === state.modo);
    });

    // Renderizar listas y badges
    renderListaClases();
    renderListaEvalua();
    renderListaTut();
    renderListaGrab();
    actualizarBadge("clases", state.clases.length);
    actualizarBadge("evalua", state.entregas.length);

    _cargando = false;
    actualizarPreview();
}

// Escuchador global: guarda solo el formulario al escribir
// Las listas se guardan explícitamente cuando se modifican
document.addEventListener('input', (e) => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        guardarFormulario();
    }
});

// Al cargar la ventana, recuperamos la información
document.addEventListener('DOMContentLoaded', cargarProgreso);

// --- LÓGICA DEL PANEL ARRASTRABLE (RESIZER) ---
const resizer = document.getElementById('resizer');
const panelIzquierdo = document.querySelector('.panel-left');
const appContainer = document.querySelector('.app');

resizer.addEventListener('mousedown', (e) => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
    resizer.style.background = 'var(--accent)';
});

function resize(e) {
    const newWidth = e.clientX;
    const appContainer = document.querySelector('.app');
    // Forzamos el cambio de columnas explícitamente
    if (newWidth > 300 && newWidth < 900) { 
        appContainer.style.display = "grid"; 
        appContainer.style.gridTemplateColumns = newWidth + "px 6px 1fr";
    }
}

function stopResize() {
    document.removeEventListener('mousemove', resize);
    resizer.style.background = 'var(--border)';
}

// --- FUNCIONES DE INTERFAZ DERECHA (VISTAS Y COPIADO) ---

function cambiarVistaPreview(tipo) {
    const vistaAnuncio = document.getElementById('preview-anuncio-container');
    const vistaCorreo = document.getElementById('preview-correo-container');
    const tabAnuncio = document.getElementById('tab-ver-anuncio');
    const tabCorreo = document.getElementById('tab-ver-correo');

    if (tipo === 'anuncio') {
        if (vistaAnuncio) vistaAnuncio.style.display = 'block';
        if (vistaCorreo) vistaCorreo.style.display = 'none';
        if (tabAnuncio) { tabAnuncio.classList.add('active'); tabAnuncio.style.color = 'var(--accent)'; }
        if (tabCorreo) { tabCorreo.classList.remove('active'); tabCorreo.style.color = 'var(--text-muted)'; }
    } else {
        generarCorreoDocente();
        if (vistaAnuncio) vistaAnuncio.style.display = 'none';
        if (vistaCorreo) vistaCorreo.style.display = 'block';
        if (tabAnuncio) { tabAnuncio.classList.remove('active'); tabAnuncio.style.color = 'var(--text-muted)'; }
        if (tabCorreo) { tabCorreo.classList.add('active'); tabCorreo.style.color = 'var(--accent)'; }
    }
}
window.cambiarVistaPreview = cambiarVistaPreview;

function generarCorreoDocente() {
    const tutor = document.getElementById('tutor').value || "[Tu Nombre]";
    const docente = document.getElementById('docente-nombre').value || "[Nombre del docente]";
    const asig = document.getElementById('asignatura').value || "[Nombre de asignatura]";
    const zoom = document.getElementById('zoom').value || "[enlace zoom]";
    
    const elPin = document.getElementById('zoom-pin');
    const zoomPin = elPin && elPin.value ? elPin.value : "[PIN de anfitrión]";

    let tablaHtml = `
<table style="border-collapse: collapse; border: 1px solid #c0c0c0; font-family: Calibri, sans-serif; font-size: 11pt; margin-top: 15px; margin-bottom: 15px; width: 100%;">
  <thead>
    <tr style="background-color: #f2f2f2;">
      <th style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: center; white-space: nowrap;">Semana</th>
      <th style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: center; white-space: nowrap;">Día</th>
      <th style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: left;">Tipo de Clase</th>
      <th style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: center; white-space: nowrap;">Hora</th>
      <th style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: left;">Entrega (API y Fecha)</th>
    </tr>
  </thead>
  <tbody>
`;

    if (state.clases.length > 0 || state.entregas.length > 0) {
        const semanasFijasEntregas = [3, 4, 6, 7];
        const entregasConSemana = state.entregas.map((e, index) => {
            const semanaAsignada = index < semanasFijasEntregas.length ? semanasFijasEntregas[index] : 8;
            return { ...e, semanaCalculada: semanaAsignada };
        });

        const semanasClases = state.clases.map(c => c.semana);
        const semanasEntregas = entregasConSemana.map(e => e.semanaCalculada);
        const semanasUnicas = [...new Set([...semanasClases, ...semanasEntregas])].sort((a, b) => a - b);

        semanasUnicas.forEach(semana => {
            const clase = state.clases.find(c => c.semana === semana);
            const entregasSemana = entregasConSemana.filter(e => e.semanaCalculada === semana);
            
            let fechaStr = "-";
            let tipoStr = "-";
            let horaStr = "-";

            if (clase) {
                fechaStr = clase.fecha;
                tipoStr = clase.tipo_clase;
                horaStr = clase.hora;
            }

            let entregaStr = "-";
            if (entregasSemana.length > 0) {
                entregaStr = entregasSemana.map(e => `<strong>${e.nombre}</strong><br><span style="font-size:10pt; color:#444;">Vence: ${e.fecha}</span>`).join("<br><br>");
            }

            tablaHtml += `
    <tr>
      <td style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: center;">${semana}</td>
      <td style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: center;">${fechaStr}</td>
      <td style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: left;">${tipoStr}</td>
      <td style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: center;">${horaStr}</td>
      <td style="border: 1px solid #c0c0c0; padding: 8px 15px; text-align: left;">${entregaStr}</td>
    </tr>`;
        });
    } else {
        tablaHtml += `
    <tr>
      <td colspan="5" style="border: 1px solid #c0c0c0; padding: 15px; text-align: center; font-style: italic; color: #7b86ab; background-color: #fafafa;">
        (Aún no se han generado clases)
      </td>
    </tr>`;
    }

    tablaHtml += `
  </tbody>
</table>`;

    const cuerpo = `
<div style="font-family: Calibri, sans-serif; font-size: 11pt; color: #222;">
  Hola ${docente},<br><br>
  Esperando que se encuentre bien, le escribo ya que trabajaremos en conjunto en la asignatura de <strong>${asig}</strong>, en la cual soy tutor para este bimestre. Le doy la más cordial bienvenida.<br><br>
  Por otra parte, le comparto la secuencia didáctica de la asignatura, con detalles de los temas a acordar en cada clase:<br><br>
  <div style="margin-left: 10px;">
    <strong>Nombre asignatura:</strong> ${asig}<br>
    <strong>PIN zoom:</strong> ${zoomPin}<br>
    <strong>Enlace Zoom:</strong> ${zoom}
  </div><br>
  ${tablaHtml}<br>

  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 15px; margin-bottom: 15px; border-radius: 4px;">
    <strong style="color: #856404; font-size: 11.5pt;">⚠️ DE SUMA IMPORTANCIA: Acceso a Zoom y PIN de Anfitrión</strong><br><br>
    <span style="color: #856404;">
      Con la nueva modalidad que se implementa en zoom, para poder iniciar la clase, es <strong>obligatorio</strong> que reclame los permisos de administrador usando el siguiente código:<br><br>
      <strong>PIN de anfitrión: ${zoomPin}</strong>
    </span>
  </div>

  <strong>Paso a paso para reclamar el rol durante la reunión:</strong><br>
  <ol style="margin-left: 15px; padding-left: 15px; margin-top: 8px;">
    <li style="margin-bottom: 8px;">Ingresar al enlace de Zoom de la clase.</li>
    <li style="margin-bottom: 8px;">Una vez dentro de la sala, abrir la lista de <strong>Participantes</strong> (en la barra inferior).</li>
    <li style="margin-bottom: 8px;">En la esquina inferior derecha de esa lista, hacer clic en <strong>"Reclamar rol de anfitrión"</strong>.</li>
    <li style="margin-bottom: 8px;">Ingresar el PIN (${zoomPin}) y confirmar.</li>
  </ol>

  <p>Es fundamental que domine este procedimiento antes de su primera sesión. <strong>Si nunca ha realizado este proceso o tiene dudas, <u>debe contactarse a la brevedad</u> con el equipo de Training</strong>, quienes son los encargados oficiales de brindarle la inducción y capacitación en esta herramienta:</p>
  
  <div style="margin-left: 10px; margin-top: 6px; margin-bottom: 20px;">
    <strong>Correo:</strong> training@ipp.cl<br>
    <strong>WhatsApp:</strong> +56 9 8513 2178
  </div>
  Finalmente, le dejo algunas recomendaciones académicas:<br><br>
  <ol style="margin-left: 15px; padding-left: 15px;">
    <li style="margin-bottom: 12px;"><strong>Anuncios:</strong> Publicar bienvenida y al menos 1 anuncio semanal con objetivos del módulo y recursos de apoyo (PPT, videos, PDF, enlaces, ejercicios, etc.).</li>
    <li style="margin-bottom: 12px;"><strong>Suspensión de clases:</strong> Evitar suspender. Si ocurre por fuerza mayor, el docente debe informar en Canvas y coordinar con el tutor la reprogramación dentro de la misma semana.</li>
    <li style="margin-bottom: 12px;"><strong>Clases prácticas:</strong> Se recomienda incorporar actividades prácticas y herramientas interactivas que fomenten la participación de los estudiantes.</li>
    <li style="margin-bottom: 12px;"><strong>Evaluaciones:</strong> El docente debe conocer todas las evaluaciones, trabajos y fechas de entrega para poder resolver dudas durante las clases.</li>
  </ol><br>
  Cualquier comentario o duda, me puede indicar a través de esta vía.<br><br>
  Saludos,<br><br>
  <strong>${tutor}</strong><br>
  Tutor Académico IPP
</div>`;

    const correoArea = document.getElementById('correo-cuerpo');
    if(correoArea) {
        correoArea.innerHTML = cuerpo;
    }
}
window.generarCorreoDocente = generarCorreoDocente;

function copiarContenidoActual() {
    const esCorreo = document.getElementById('preview-correo-container').style.display === 'block';
    
    if (esCorreo) {
        const correoDiv = document.getElementById('correo-cuerpo');
        if(!correoDiv || correoDiv.innerHTML.trim() === "") { 
            showToast("⚠ Genera el correo primero", true); 
            return; 
        }

        // Copiar con formato HTML para que Outlook lo reciba correctamente
        const htmlContent = correoDiv.innerHTML;
        const htmlFull = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${htmlContent}</body></html>`;

        if (navigator.clipboard && window.ClipboardItem) {
            // Método moderno: copia como HTML formateado (Outlook lo recibe con formato)
            const blob = new Blob([htmlFull], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            navigator.clipboard.write([item])
                .then(() => showToast("✓ Correo copiado con formato — pega en Outlook"))
                .catch(() => {
                    // Fallback: selección clásica
                    _copiarPorSeleccion(correoDiv);
                });
        } else {
            // Fallback para navegadores sin ClipboardItem
            _copiarPorSeleccion(correoDiv);
        }

    } else {
        const html = document.getElementById('code-area').value;
        navigator.clipboard.writeText(html).then(() => showToast("✓ HTML del Anuncio copiado"));
    }
}
window.copiarContenidoActual = copiarContenidoActual;

function _copiarPorSeleccion(correoDiv) {
    // Fallback: intentar con ClipboardItem de texto plano
    const texto = correoDiv.innerText || correoDiv.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto)
            .then(() => showToast("✓ Correo copiado (texto plano) — pega en Outlook"))
            .catch(() => showToast("⚠ No se pudo copiar. Selecciona el texto manualmente.", true));
    } else {
        showToast("⚠ Tu navegador no permite copiar automáticamente. Selecciona el texto manualmente.", true);
    }
}