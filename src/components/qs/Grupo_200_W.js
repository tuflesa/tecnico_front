const montaje = [
    {
        operacion: 1,
        color: 'blue',
        tipo: 'BD_W',
        nombre: 'BD-I',
        rodillos: [
            {
                tipo_plano: 'BD_W_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 660,
                    Dext: 550,
                    Df: 300,
                    Dc: 338.5,
                    R1: 126,
                    alfa1: 63,
                    xc1: 155.3,
                    R2: 489,
                    alfa2: 12,
                    R3:15
                }
            },
            {
                tipo_plano: 'BD_W_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 246,
                    Df: 740,
                    R: 123,
                    H: 310.5
                }
            }
        ]
    },
    {
        operacion: 2,
        color: 'magenta',
        tipo: 'BD_2R',
        nombre: 'BD-II',
        rodillos: [
            {
                tipo_plano: 'BD_2R_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 606,
                    Dext: 660,
                    Df: 300,
                    R1: 422,
                    alfa1: 20,
                    R2: 126,
                    alfa2: 35,
                    R3: 377,
                    alfa3: 21.24,
                    R4: 40
                }
            },
            {
                tipo_plano: 'BD_2R_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 277,
                    Df: 740,
                    R1: 419,
                    alfa1: 10,
                    R2: 123,
                    alfa2: 24.57,
                    R3: 40
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
                    Dext: 534.266,
                    Df: 300,
                    Dc: 543.266,
                    R1: 97.965,
                    alfa1: 120,
                    R2: 145.301,
                    alfa2: 30,
                    R3: 435.903,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 522.316,
                    Df: 300,
                    Dc: 534.316,
                    R1: 0,
                    alfa1: 0,
                    R2: 145.301,
                    alfa2: 53.74,
                    R3: 435.903,
                    alfa3: 10.612,
                    Cuchilla: 89.90,
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
                    Dext: 518.098,
                    Df: 300,
                    Dc: 527.098,
                    R1: 102.691,
                    alfa1: 120,
                    R2: 124.407,
                    alfa2: 30,
                    R3: 373.22,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 509.158,
                    Df: 300,
                    Dc: 518.158,
                    R1: 102.691,
                    alfa1: 120,
                    R2: 124.407,
                    alfa2: 30,
                    R3: 373.22,
                    alfa3: 11.584,
                    Cuchilla: 59.94,
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
                    Dext: 498.239,
                    Df: 300,
                    Dc: 507.239,
                    R1: 107.866,
                    alfa1: 120,
                    R2: 99.379,
                    alfa2: 30,
                    R3: 298.119,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 290,
                    Dext: 496.147,
                    Df: 300,
                    Dc: 505.147,
                    R1: 107.866,
                    alfa1: 120,
                    R2: 99.373,
                    alfa2: 30,
                    R3: 298.119,
                    alfa3: 13.262,
                    Cuchilla: 29.96,
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
                    Ancho: 220,
                    Df: 330,
                    R1: 102.5,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 4
                }
            },
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 220,
                    Df: 330,
                    R1: 102.5,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 4
                }
            },
            {
                tipo_plano: 'W_Inf',
                eje: 'INF',
                parametros: {
                    Ancho: 145,
                    Df: 350,
                    R1: 102.5,
                    alfa1: 60,
                    R2: 3,
                    alfa2: 7,
                    C: 4
                }
            }
        ]
    }
]

const fleje = {
    espesor: 3,
    ancho: 635,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}