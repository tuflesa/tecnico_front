const ordenarLista = (lista) => {
        return [...lista].sort((a, b) => {
            // Convertimos 'DD/MM/YYYY HH:mm:ss' a Date
            const parseFechaHora = (fecha, hora) => {
            const [d, m, y] = fecha.split('/');
            return new Date(`${y}-${m}-${d}T${hora}`);
            };

            const fechaA = parseFechaHora(a.fechaInicio, a.horaInicio);
            const fechaB = parseFechaHora(b.fechaInicio, b.horaInicio);

            return fechaA - fechaB;
        });
    };

    export default ordenarLista;