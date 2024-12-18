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
                    Ancho: 120,
                    Dext: 408.327,
                    Df: 330,
                    Dc: 410.327,
                    R1: 32.348,
                    alfa1: 120,
                    R2: 47.979,
                    alfa2: 30,
                    R3: 143.937,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 120,
                    Dext: 405.361,
                    Df: 330,
                    Dc: 407.361,
                    R1: 0,
                    alfa1: 0,
                    R2: 47.979,
                    alfa2: 53.73,
                    R3: 143.937,
                    alfa3: 10.612,
                    Cuchilla: 29.7,
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
                    Ancho: 120,
                    Dext: 402.986,
                    Df: 330,
                    Dc: 404.986,
                    R1: 33.908,
                    alfa1: 120,
                    R2: 41.078,
                    alfa2: 30,
                    R3: 123.234,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 120,
                    Dext: 400.031,
                    Df: 330,
                    Dc: 402.031,
                    R1: 33.908,
                    alfa1: 120,
                    R2: 41.078,
                    alfa2: 30,
                    R3: 123.234,
                    alfa3: 11.584,
                    Cuchilla: 19.8,
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
                    Ancho: 120,
                    Dext: 396.427,
                    Df: 330,
                    Dc: 398.427,
                    R1: 35.615,
                    alfa1: 120,
                    R2: 32.811,
                    alfa2: 30,
                    R3: 98.434,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 120,
                    Dext: 395.735,
                    Df: 330,
                    Dc: 397.735,
                    R1: 35.615,
                    alfa1: 120,
                    R2: 32.811,
                    alfa2: 30,
                    R3: 98.434,
                    alfa3: 13.262,
                    Cuchilla: 9.9,
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
                    Ancho: 100,
                    Df: 430,
                    R1: 35.5,
                    R2: 2,
                    alfa1: 30,
                    alfa2: 10,
                    C1: 3,
                    C2: 2
                }
            },
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 100,
                    Df: 430,
                    R1: 35.5,
                    R2: 2,
                    alfa1: 30,
                    alfa2: 10,
                    C1: 3,
                    C2: 2
                }
            },
            {
                tipo_plano: 'NONE',
                eje: 'CAB',
                parametros: {
                    Df: 600
                }
            }
        ]
    }
]

const fleje = {
    espesor: 7,
    ancho: 206,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}