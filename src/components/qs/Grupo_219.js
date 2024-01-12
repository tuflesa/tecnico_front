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
                    Ancho: 760,
                    Dext: 620,
                    Df: 300, 
                    R: 480,
                    alfa: 90
                }
            },
            {
                tipo_plano: 'BD_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 650,
                    Df: 740,
                    R: 461
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
                    Ancho: 660,
                    Dext: 740,
                    Df: 300,
                    R: 300,
                    alfa: 120
                }
            },
            {
                tipo_plano: 'BD_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 520,
                    Df: 740,
                    R: 281
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
                    Ancho: 290,
                    Dext: 557.599,
                    Df: 300,
                    Dc: 566.599,
                    R1: 107.361,
                    alfa1: 120,
                    R2: 159.237,
                    alfa2: 30,
                    R3: 477.711,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 547.733,
                    Df: 300,
                    Dc: 556.733,
                    R1: 0,
                    alfa1: 0,
                    R2: 159.237,
                    alfa2: 53.72,
                    R3: 477.711,
                    alfa3: 10.612,
                    Cuchilla: 98.6,
                    D_cuchilla: 325
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
                    Ancho: 290,
                    Dext: 539.865,
                    Df: 300,
                    Dc: 548.865,
                    R1: 112.534,
                    alfa1: 120,
                    R2: 136.331,
                    alfa2: 30,
                    R3: 408.993,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 530.052,
                    Df: 300,
                    Dc: 539.052,
                    R1: 112.534,
                    alfa1: 120,
                    R2: 136.331,
                    alfa2: 30,
                    R3: 408.993,
                    alfa3: 11.584,
                    Cuchilla: 65.74,
                    D_cuchilla: 330
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
                    Ancho: 290,
                    Dext: 518.094,
                    Df: 300,
                    Dc: 527.094,
                    R1: 118.2,
                    alfa1: 120,
                    R2: 108.894,
                    alfa2: 30,
                    R3: 326.681,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 515.798,
                    Df: 300,
                    Dc: 524.798,
                    R1: 118.2,
                    alfa1: 120,
                    R2: 108.894,
                    alfa2: 30,
                    R3: 326.681,
                    alfa3: 13.262,
                    Cuchilla: 32.86,
                    D_cuchilla: 330
                }
            }
        ]   
    },
    {
        operacion: 7,
        color: 'lime',
        tipo: 'W',
        nombre: 'Welding',
        rodillos: [
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 235,
                    Df: 330,
                    R1: 112.2,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 5
                }
            },
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 235,
                    Df: 330,
                    R1: 112.2,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 5
                }
            },
            {
                tipo_plano: 'W_Inf',
                eje: 'INF',
                parametros: {
                    Ancho: 160,
                    Df: 350,
                    R1: 112.2,
                    alfa1: 60,
                    R2: 3,
                    alfa2: 7,
                    C: 5
                }
            }
        ]
    }
]

const fleje = {
    espesor: 8,
    ancho: 665,
    calidad: 'S355',
    color: 'aqua'
}

export {fleje, montaje}