import moment from 'moment';

function calculaCalidad(flejes) {
    let calidad =0
    let peso_total = 0
    flejes.map(f => {
        calidad += f.metros_tubo * f.peso / f.metros_medido;
        peso_total += f.peso;
    });
    if (peso_total > 0) {
        calidad = peso_total > 0?(calidad *100 / peso_total): 100;
    }
    else {
        calidad = 100;
    }
    return calidad
}

function filtrarFlejesPorIntervalo(flejes, inicio, fin) {
  return flejes.filter(fleje => {
    // Construir datetime de entrada
    const entradaStr = `${fleje.fecha_entrada} ${fleje.hora_entrada}`;
    const entrada = moment(entradaStr, "YYYY-MM-DD HH:mm:ss");

    // Construir datetime de salida
    const salidaStr = `${fleje.fecha_salida} ${fleje.hora_salida}`;
    const salida = moment(salidaStr, "YYYY-MM-DD HH:mm:ss");

    // Condición: entrada o salida dentro del intervalo
    const entradaDentro = entrada.isBetween(inicio, fin, null, "[]");
    const salidaDentro = salida.isBetween(inicio, fin, null, "[]");

    return entradaDentro || salidaDentro;
  });
}

function tiempoPorTurno(paradas) {
  const acumulado = {};

  paradas.forEach(parada => {
    if (Array.isArray(parada.duracion_por_turno)) {
      parada.duracion_por_turno.forEach(dpt => {
        const turno = dpt.turno;
        const duracion = dpt.duracion || 0;
        const inicio = dpt.inicio;
        const fin = dpt.fin;

        // Ignorar turnos null/undefined y duraciones <= 0
        if (turno == null || duracion <= 0) return;

        // Si no existe el turno aún, inicializarlo
        if (!acumulado[turno]) {
          acumulado[turno] = {
            turno,
            duracion: 0,
            inicio: inicio || null,
            fin: fin || null
          };
        }

        // Sumar duración
        acumulado[turno].duracion += duracion;

        // Actualizar inicio mínimo
        if (inicio && (!acumulado[turno].inicio || inicio < acumulado[turno].inicio)) {
          acumulado[turno].inicio = inicio;
        }

        // Actualizar fin máximo
        if (fin && (!acumulado[turno].fin || fin > acumulado[turno].fin)) {
          acumulado[turno].fin = fin;
        }
      });
    }
  });

  // Convertir a lista de objetos válidos
  return Object.values(acumulado).filter(item =>
    item.turno != null && item.duracion > 0
  );
}

const calculo_OEE = (estado, filtro) => {
    // Calculo disponibilidad
    const inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio,'YYYY-MM-DD HH:mm');
    const fin = moment(filtro.fecha_fin + ' ' + filtro.hora_fin,'YYYY-MM-DD HH:mm');
    const paradas_inicial = estado.paradas.map(p => {
        const inicio_moment = moment(p.inicio);
        const fin_moment = moment(p.fin);
        const filtro_inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio, 'YYYY-MM-DD HH:mm');
        const filtro_fin = moment(filtro.fecha_fin + ' ' + filtro.hora_fin, 'YYYY-MM-DD HH:mm');

        const inicio_ajustado = inicio_moment.isBefore(filtro_inicio) ? filtro_inicio : inicio_moment;
        const fin_ajustado = fin_moment.isAfter(filtro_fin) ? filtro_fin : fin_moment;

        return {
            ...p,
            inicio: inicio_ajustado,
            fin: fin_ajustado,
            duracion: fin_ajustado.diff(inicio_ajustado, 'seconds') / 60.0,
            duracion_por_turno: p.duracion_por_turno.map(dpt => {
                const start_moment = moment(dpt.inicio.replace("Z", ""));
                const end_moment = moment(dpt.fin.replace("Z", ""));
                let start_ajustado, end_ajustado;
                if (start_moment.isSameOrBefore(filtro_inicio)) {
                    start_ajustado = filtro_inicio;
                }
                    else {
                    if (start_moment.isSameOrAfter(filtro_fin)){
                        start_ajustado = filtro_fin;
                    }
                    else {
                        start_ajustado = start_moment
                    }
                }

                if (end_moment.isSameOrBefore(filtro_inicio)) {
                    end_ajustado = filtro_inicio;
                }
                else {
                    if (start_moment.isSameOrAfter(filtro_fin)){
                    end_ajustado = filtro_fin;
                    }
                    else {
                        end_ajustado = end_moment
                    }
                }

                return {
                    turno: dpt.turno,
                    inicio: start_ajustado,
                    fin: end_ajustado,
                    duracion: end_ajustado.diff(start_ajustado, 'seconds') / 60.0
                }
            })
        };
    });
    const paradas_ordenadas = paradas_inicial.sort((a, b) => a.inicio - b.inicio);
    const paradas = paradas_ordenadas.filter(item => item.duracion !== 0);
    let t_tnp = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'TNP').map(t => { t_tnp += t.duracion});
    let t_total = 0;
    paradas.filter(p => p.tipo_parada_nombre !== 'TNP').map(t => { t_total += t.duracion});
    // console.log(paradas);
    // console.log(tiempoPorTurno(paradas));
    let t_run = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Automatico').map(t => {t_run += t.duracion;});
    let t_cambio = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Cambio').map(t => { t_cambio += t.duracion});
    let t_incidencia = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Incidencia').map(t => { t_incidencia += t.duracion});
    let t_averia = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Avería').map(t => { t_averia += t.duracion});
    const t_stop = t_total - t_run - t_cambio;
    const t_unknown = t_stop - t_incidencia - t_averia;
    const t_producion = t_run + t_cambio;

    const disponibilidad = t_total > 0 ? (t_producion/t_total)*100: 0;
    // Disponibilidad por turno
    const disponibilidad_por_turno = [];
    tiempoPorTurno(paradas).map( tpt => {
        const produccion = paradas.filter(p => p.turnos.includes(tpt.turno) && 
                                             (p.tipo_parada_nombre === 'Automatico' || p.tipo_parada_nombre === 'Cambio'));
        
        let tiempo_produccion = 0;
        produccion.map(p => {
            p.duracion_por_turno.filter(dpt => dpt.turno == tpt.turno).map(t => {
                tiempo_produccion += t.duracion;
            });
        });

        disponibilidad_por_turno.push({
            turno: tpt.turno,
            disponibilidad: tiempo_produccion/tpt.duracion
        });
    });

    // Calculo del rendimiento
    let rendimiento_velocidad = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Automatico').map(r => {
        rendimiento_velocidad += (r.rendimiento)*r.duracion;
    });
    
    if (rendimiento_velocidad === 0) {
        rendimiento_velocidad = 100;
    }
    else {
        rendimiento_velocidad = t_run > 0 ? rendimiento_velocidad * 100 / t_run : 100;
    }
    let rendimiento_cambios = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Cambio').map(r => {
        rendimiento_cambios += (r.rendimiento)*r.duracion;
    });
    
    if (rendimiento_cambios === 0) {
        rendimiento_cambios = 100;
    }
    else {
        rendimiento_cambios = t_cambio > 0 ? rendimiento_cambios * 100 / t_cambio: 100;
    }
    const rendimiento_total = (t_cambio + t_run) > 0? (rendimiento_cambios * t_cambio + rendimiento_velocidad * t_run) / (t_cambio + t_run) : 0;
    // Rendimiento por turno
    const rendimiento_por_turno = [];
    tiempoPorTurno(paradas).map( tpt => {
        const produccion = paradas.filter(p => p.turnos.includes(tpt.turno) && 
                                             (p.tipo_parada_nombre === 'Automatico' || p.tipo_parada_nombre === 'Cambio'));
        let rendimiento = 0;
        let tiempo = 0;
        produccion.map(p => {
            const t = p.duracion_por_turno.filter(dpt => dpt.turno == tpt.turno)[0].duracion;
            const r = p.rendimiento_por_turno.filter(rpt => rpt.turno == tpt.turno)[0].rendimiento;
            rendimiento += r*t;
            tiempo += t;
        });
        rendimiento_por_turno.push({
            turno: tpt.turno,
            rendimiento: rendimiento / tiempo
        });
    });

    // Calculo de calidad: Merma
    const calidad = calculaCalidad(estado.flejes);
    // Por turno
    const calidad_por_turno = [];
    tiempoPorTurno(paradas).map(tpt => {
        const flejes_del_turno = filtrarFlejesPorIntervalo(estado.flejes, tpt.inicio, tpt.fin);
        calidad_por_turno.push({
            turno: tpt.turno,
            calidad: calculaCalidad(flejes_del_turno)/100
        });
    });

    // OEE
    const OEE = (disponibilidad/100) * (calidad/100) * (rendimiento_total/100) *100;
    // Calculo por turnos
    const oee_por_turno = [];
    calidad_por_turno.map(cpt => {
        const calidad = cpt.calidad;
        const rendimiento = rendimiento_por_turno.filter(rpt => rpt.turno == cpt.turno)[0].rendimiento;
        const disponibilidad = disponibilidad_por_turno.filter(dpt => dpt.turno ==cpt.turno)[0].disponibilidad;
        oee_por_turno.push({
            turno: cpt.turno,
            oee: calidad*rendimiento*disponibilidad
        });
    });

    const indicadores = {
        disponibilidad: {
            porcentaje: disponibilidad,
            tiempos: {
                total: t_total,
                produccion: t_producion,
                cambio: t_cambio,
                run: t_run,
                incidencia: t_incidencia,
                averia: t_averia,
                unknown: t_unknown,
                tnp: t_tnp
            },
            turnos: disponibilidad_por_turno
        },
        rendimiento: {
            velocidad: rendimiento_velocidad,
            cambio: rendimiento_cambios,
            total: rendimiento_total,
            turnos: rendimiento_por_turno
        },
        calidad: {
            porcentaje: calidad,
            turnos: calidad_por_turno
        },
        OEE: {
            porcentaje: OEE,
            turnos: oee_por_turno
        }
    }

    return indicadores;
}

export default calculo_OEE;