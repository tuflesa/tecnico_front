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
                    Ancho: 500,
                    Dext: 600,
                    Df: 300,
                    R: 220,
                    alfa: 100
                }
            },
            {
                tipo_plano: 'BD_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 330,
                    Df: 740,
                    R: 201
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
        operacion: 4,
        color: 'red',
        tipo: 'FP',
        nombre: 'FP-I',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 180,
                    Dext: 436.456,
                    Df: 295,
                    Dc: 444.956,
                    R1: 60.388,
                    alfa1: 120,
                    R2: 89.567,
                    alfa2: 30,
                    R3: 268.702,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 180,
                    Dext: 430.951,
                    Df: 295,
                    Dc: 439.451,
                    R1: 0,
                    alfa1: 0,
                    R2: 89.567,
                    alfa2: 53.74,
                    R3: 268.702,
                    alfa3: 10.612,
                    Cuchilla: 55.3,
                    D_cuchilla: 328
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
                    Ancho: 180,
                    Dext: 428.492,
                    Df: 297,
                    Dc: 436.992,
                    R1: 63.303,
                    alfa1: 120,
                    R2: 76.689,
                    alfa2: 30,
                    R3: 230.067,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 180,
                    Dext: 422.985,
                    Df: 297,
                    Dc: 431.485,
                    R1: 63.303,
                    alfa1: 120,
                    R2: 76.689,
                    alfa2: 30,
                    R3: 230.067,
                    alfa3: 11.584,
                    Cuchilla: 36.8,
                    D_cuchilla: 332
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
                    Ancho: 180,
                    Dext: 415.252,
                    Df: 296,
                    Dc: 423.752,
                    R1: 66.494,
                    alfa1: 120,
                    R2: 61.258,
                    alfa2: 30,
                    R3: 183.775,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 180,
                    Dext: 413.964,
                    Df: 296,
                    Dc: 422.464,
                    R1: 66.494,
                    alfa1: 120,
                    R2: 61.258,
                    alfa2: 30,
                    R3: 183.775,
                    alfa3: 13.262,
                    Cuchilla: 18.4,
                    D_cuchilla: 332
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
                    Ancho: 160,
                    Df: 385,
                    R1: 64.7,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 5
                }
            },
            {
                tipo_plano: 'W_Lat',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 160,
                    Df: 385,
                    R1: 64.7,
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
                    Ancho: 110,
                    Df: 395,
                    R1: 64.7,
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
    ancho: 374,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}