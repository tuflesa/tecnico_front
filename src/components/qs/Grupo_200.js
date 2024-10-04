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