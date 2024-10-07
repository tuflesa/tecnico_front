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
                    Ancho: 170,
                    Dext: 421.298,
                    Df: 289,
                    Dc: 423.298,
                    R1: 54.083,
                    alfa1: 120,
                    R2: 80.215,
                    alfa2: 30,
                    R3: 240.644,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 190,
                    Dext: 416.379,
                    Df: 289,
                    Dc: 418.379,
                    R1: 0,
                    alfa1: 0,
                    R2: 80.215,
                    alfa2: 53.74,
                    R3: 240.844,
                    alfa3: 10.612,
                    Cuchilla: 49.5,
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
                    Ancho: 170,
                    Dext: 414.377,
                    Df: 291,
                    Dc: 416.377,
                    R1: 56.694,
                    alfa1: 120,
                    R2: 68.683,
                    alfa2: 30,
                    R3: 206.049,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 170,
                    Dext: 409.448,
                    Df: 291,
                    Dc: 411.448,
                    R1: 56.694,
                    alfa1: 120,
                    R2: 68.683,
                    alfa2: 30,
                    R3: 206.049,
                    alfa3: 11.584,
                    Cuchilla: 33,
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
                    Ancho: 170,
                    Dext: 403.917,
                    Df: 291.5,
                    Dc: 405.917,
                    R1: 59.553,
                    alfa1: 120,
                    R2: 54.864,
                    alfa2: 30,
                    R3: 164.592,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 170,
                    Dext: 402.764,
                    Df: 291.5,
                    Dc: 404.764,
                    R1: 59.553,
                    alfa1: 120,
                    R2: 54.864,
                    alfa2: 30,
                    R3: 164.592,
                    alfa3: 13.262,
                    Cuchilla: 16.4,
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
                    Ancho: 140,
                    Df: 390,
                    R1: 58.2,
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
                    Ancho: 140,
                    Df: 390,
                    R1: 58.2,
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
                    Ancho: 100,
                    Df: 410,
                    R1: 58.2,
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
    espesor: 3,
    ancho: 352,
    calidad: 'S275',
    color: 'aqua'
}

export {fleje, montaje}