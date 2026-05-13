import moment from 'moment';

const calculo_OEE = (estado, filtro) => {
    // Calculo disponibilidad
    const inicio = moment(filtro.fecha + ' ' + filtro.hora_inicio,'YYYY-MM-DD HH:mm');
    const fin = moment(filtro.fecha_fin + ' ' + filtro.hora_fin,'YYYY-MM-DD HH:mm');
    const paradas_inicial = estado.paradas.map(p => {
        p.inicio = moment(p.inicio);
        if (p.inicio.isBefore(inicio)) {
            p.inicio = inicio;
        }
        
        p.fin = moment(p.fin);
        if (p.fin.isAfter(fin)) {
            p.fin = fin;
        }

        p.duracion = p.fin.diff(p.inicio, 'seconds')/60.0;

        return p;
    });
    const paradas_ordenadas = paradas_inicial.sort((a, b) => a.inicio - b.inicio);
    const paradas = paradas_ordenadas.filter(item => item.duracion !== 0);
    let t_tnp = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'TNP').map(t => { t_tnp += t.duracion});
    let t_total = 0;
    paradas.filter(p => p.tipo_parada_nombre !== 'TNP').map(t => { t_total += t.duracion});
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
    const disponibilidad = (t_producion/t_total)*100;

    // Calculo del rendimiento
    let rendimiento_velocidad = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Automatico').map(r => {
        rendimiento_velocidad += (r.rendimiento)*r.duracion;
    });
    
    if (rendimiento_velocidad === 0) {
        rendimiento_velocidad = 100;
    }
    else {
        rendimiento_velocidad = rendimiento_velocidad * 100 / t_run;
    }
    let rendimiento_cambios = 0;
    paradas.filter(p => p.tipo_parada_nombre === 'Cambio').map(r => {
        rendimiento_cambios += (r.rendimiento)*r.duracion;
    });
    
    if (rendimiento_cambios === 0) {
        rendimiento_cambios = 100;
    }
    else {
        rendimiento_cambios = rendimiento_cambios * 100 / t_cambio;
    }
    const rendimiento_total = (rendimiento_cambios * t_cambio + rendimiento_velocidad * t_run) / (t_cambio + t_run);

    // Calculo de calidad: Merma
    let calidad =0
    let peso_total = 0
    estado.flejes.map(f => {
        calidad += f.metros_tubo * f.peso / f.metros_medido;
        peso_total += f.peso;
    });
    if (peso_total > 0) {
        calidad = calidad *100 / peso_total;
    }
    else {
        calidad = 100;
    }

    // OEE
    const OEE = (disponibilidad/100) * (calidad/100) * (rendimiento_total/100) *100;

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
            }
        },
        rendimiento: {
            velocidad: rendimiento_velocidad,
            cambio: rendimiento_cambios,
            total: rendimiento_total
        },
        calidad: calidad,
        OEE: OEE
    }

    return indicadores;
}

export default calculo_OEE;