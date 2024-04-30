const montaje = [
    {
        operacion: 1,
        color: 'blue',
        tipo: 'BD',
        nombre: 'BD-I',
        rodillos: [
            {
                tipo_plano: 'BD_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 410,
                    Dext: 550,
                    Df: 300,
                    R: 140,
                    alfa: 130
                }
            },
            {
                tipo_plano: 'BD_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 250,
                    Df: 740,
                    R: 125
                }
            }
        ]
    },
    
    {
        operacion: 2,
        color: 'magenta',
        tipo: 'BD',
        nombre: 'BD-II',
        rodillos: [
            {
                tipo_plano: 'BD_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 360,
                    Dext: 510,
                    Df: 300,
                    R: 85,
                    alfa: 140
                }
            },
            {
                tipo_plano: 'BD_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 150,
                    Df: 740,
                    R: 77.3
                }
            }
        ]   
    },
    {
        operacion: 4,
        color: 'red',
        tipo: 'FP',
        nombre: 'FP-I',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 140,
                    Dext: 423.945,
                    Df: 330,
                    Dc: 425.945,
                    R1: 38.638,
                    alfa1: 120,
                    R2: 57.307,
                    alfa2: 30,
                    R3: 171.921,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 140,
                    Dext: 420.456,
                    Df: 330,
                    Dc: 422.456,
                    R1: 0,
                    alfa1: 0,
                    R2: 57.307,
                    alfa2: 53.77,
                    R3: 171.921,
                    alfa3: 10.612,
                    Cuchilla: 35.3,
                    D_cuchilla: 350
                },
            }
        ]   
    },
    {
        operacion: 5,
        color: 'green',
        tipo: 'FP',
        nombre: 'FP-II',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 140,
                    Dext: 417.578,
                    Df: 330,
                    Dc: 419.578,
                    R1: 40.506,
                    alfa1: 120,
                    R2: 49.072,
                    alfa2: 30,
                    R3: 147.215,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 140,
                    Dext: 414.064,
                    Df: 330,
                    Dc: 416.064,
                    R1: 40.506,
                    alfa1: 120,
                    R2: 49.072,
                    alfa2: 30,
                    R3: 147.215,
                    alfa3: 11.584,
                    Cuchilla: 23.5,
                    D_cuchilla: 350
                },
                
            }
        ]   
    },
    {
        operacion: 6,
        color: 'orange',
        tipo: 'FP',
        nombre: 'FP-III',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 140,
                    Dext: 409.751,
                    Df: 330,
                    Dc: 411.751,
                    R1: 42.551,
                    alfa1: 120,
                    R2: 39.201,
                    alfa2: 30,
                    R3: 117.602,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 140,
                    Dext: 408.929,
                    Df: 330,
                    Dc: 410.929,
                    R1: 42.551,
                    alfa1: 120,
                    R2: 39.201,
                    alfa2: 30,
                    R3: 117.602,
                    alfa3: 13.262,
                    Cuchilla: 11.7,
                    D_cuchilla: 350
                }
            }
        ]   
    },
    {
        operacion: 7,
        color: 'lime',
        tipo: 'W-4', // Configuración de 4 rodillos de soldadura
        nombre: 'Welding',
        rodillos: [
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 110,
                    Df: 430,
                    R1: 42,
                    R2: 2,
                    alfa2: 10,
                    C: 2
                }
            },
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 110,
                    Df: 430,
                    R1: 42,
                    R2: 2,
                    alfa2: 10,
                    C: 2
                }
            }
        ]
    }
]

const fleje = {
    espesor: 5,
    ancho: 252,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}