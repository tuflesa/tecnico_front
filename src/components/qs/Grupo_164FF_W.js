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
        operacion: 3,
        color: 'steelblue',
        tipo: 'IS1',
        nombre: 'IS1',
        rodillos: [
            {
                tipo_plano: 'IS1',
                eje: 'ANCHO_S1',
                parametros: {
                    Ancho: 310,
                    Dext: 275,
                    Dsup: 180,
                    Df: 105,
                    Dc: 838.212,
                    R1: 400,
                    alfa1: 24,
                    R2: 50,
                    Hc: 365
                }
            },
            {
                tipo_plano: 'NONE',
                eje: 'ALTO_S1',
                parametros: {
                    Df: 0
                }
            }
        ]
    },
    {
        operacion: 4,
        color: 'magenta',
        tipo: 'LINEAL',
        nombre: 'Lineal',
        rodillos: []
    },
    {
        operacion: 5,
        color: 'red',
        tipo: 'FP',
        nombre: 'FP-I',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 245,
                    Dext: 492.38,
                    Df: 300,
                    Dc: 495.38,
                    R1: 78.68,
                    alfa1: 120,
                    R2: 116.7,
                    alfa2: 30,
                    R3: 350.07,
                    alfa3: 10.612
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 245,
                    Dext: 485.19,
                    Df: 300,
                    Dc: 488.19,
                    R1: 0,
                    alfa1: 0,
                    R2: 116.7,
                    alfa2: 53.73,
                    R3: 350.07,
                    alfa3: 10.612,
                    Cuchilla: 72.1,
                    D_cuchilla: 332
                },
            }
        ]   
    },
    {
        operacion: 6,
        color: 'coral',
        tipo: 'IS2-3',
        nombre: 'IS2',
        rodillos: [
            {
                tipo_plano: 'IS2-3',
                eje: 'ANCHO',
                parametros: {
                    Ancho: 330,
                    Dext: 270,
                    Dsup: 255,
                    Df: 115,
                    Dc: 348.4,
                    R1: 78.7,
                    alfa1: 60,
                    R2: 116.7
                }
            },
            {
                tipo_plano: 'NONE',
                eje: 'ALTO',
                parametros: {
                    Df: 0
                }
            }
        ]
    },
    {
        operacion: 7,
        color: 'green',
        tipo: 'FP',
        nombre: 'FP-II',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 245,
                    Dext: 479.38,
                    Df: 300,
                    Dc: 482.38,
                    R1: 82.47,
                    alfa1: 120,
                    R2: 99.91,
                    alfa2: 30,
                    R3: 299.73,
                    alfa3: 11.584
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 245,
                    Dext: 472.2,
                    Df: 300,
                    Dc: 475.2,
                    R1: 82.47,
                    alfa1: 120,
                    R2: 99.91,
                    alfa2: 30,
                    R3: 299.73,
                    alfa3: 11.584,
                    Cuchilla: 48.04,
                    D_cuchilla: 338
                },
                
            }
        ]   
    },
    {
        operacion: 8,
        color: 'brown',
        tipo: 'IS2-3',
        nombre: 'IS3',
        rodillos: [
            {
                tipo_plano: 'IS2-3',
                eje: 'ANCHO',
                parametros: {
                    Ancho: 330,
                    Dext: 265,
                    Dsup: 260,
                    Df: 100,
                    Dc: 299.8,
                    R1: 82.5,
                    alfa1: 60,
                    R2: 99.9
                }
            },
            {
                tipo_plano: 'NONE',
                eje: 'ALTO',
                parametros: {
                    Df: 0
                }
            }
        ]
    },
    {
        operacion: 9,
        color: 'orange',
        tipo: 'FP',
        nombre: 'FP-III',
        rodillos: [
            {
                tipo_plano: 'FP_INF',
                eje: 'INF',
                parametros: {
                    Ancho: 245,
                    Dext: 463.43,
                    Df: 300,
                    Dc: 466.43,
                    R1: 86.63,
                    alfa1: 120,
                    R2: 79.8,
                    alfa2: 30,
                    R3: 239.41,
                    alfa3: 13.262
                }
            },
            {
                tipo_plano: 'FP_SUP',
                eje: 'SUP',
                parametros: {
                    Ancho: 245,
                    Dext: 461.76,
                    Df: 300,
                    Dc: 464.76,
                    R1: 86.63,
                    alfa1: 120,
                    R2: 79.8,
                    alfa2: 30,
                    R3: 239.41,
                    alfa3: 13.262,
                    Cuchilla: 23.9,
                    D_cuchilla: 338
                }
            }
        ]   
    },
    {
        operacion: 10,
        color: 'lime',
        tipo: 'W', 
        nombre: 'Welding',
        rodillos: [
            {
                tipo_plano: 'W_Lat_5',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 200,
                    Df: 335,
                    R1: 82.3,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            },
            {
                tipo_plano: 'W_Lat_5',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 200,
                    Df: 335,
                    R1: 82.3,
                    alfa1: 120,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            },
            {
                tipo_plano: 'W_Inf',
                eje: 'INF_W',
                parametros: {
                    Ancho: 130,
                    Df: 360,
                    R1: 82.3,
                    alfa1: 60,
                    R2: 3,
                    alfa2: 7,
                    C: 3
                }
            },
            {
                tipo_plano: 'NONE',
                eje: 'CAB',
                parametros: {
                    Df: 600
                }
            },
            {
                tipo_plano: 'W_Sup',
                eje: 'SUP_V_OP',
                parametros: {
                    Ancho: 90,
                    Df: 410.71,
                    Dc: 576.92,
                    R1: 115.22,
                    C1: 6.3,
                    C2: 4,
                    L1: 32.92
                }
            },
            {
                tipo_plano: 'NONE',
                eje: 'SUP_H_OP',
                parametros: {
                    Df: 410.71
                }
            },
            {
                tipo_plano: 'W_Sup',
                eje: 'SUP_V_MO',
                parametros: {
                    Ancho: 90,
                    Df: 410.71,
                    Dc: 576.92,
                    R1: 115.22,
                    C1: 6.3,
                    C2: 4,
                    L1: 32.92
                }
            },
            {
                tipo_plano: 'NONE',
                eje: 'SUP_H_MO',
                parametros: {
                    Df: 410.71
                }
            }
        ]
    },
    {
        operacion: 11,
        color: 'orange',
        tipo: 'CB',
        nombre: 'CB-I',
        rodillos: [
            {
                tipo_plano: 'CB-CR-123',
                eje: 'SUP',
                parametros: {
                    Ancho: 145,
                    Dext: 396,
                    Df: 372.9,
                    R1: 166.6667,
                    L1: 122
                }
            },
            {
                tipo_plano: 'CB-CR-123',
                eje: 'INF',
                parametros: {
                    Ancho: 145,
                    Dext: 396,
                    Df: 372.9,
                    R1: 166.6667,
                    L1: 122
                }
            },
            {
                tipo_plano: 'CB-CR-123',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 140,
                    Dext: 352.2,
                    Df: 330,
                    R1: 166.6667,
                    L1: 122
                }
            },
            {
                tipo_plano: 'CB-CR-123',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 140,
                    Dext: 352.2,
                    Df: 330,
                    R1: 166.6667,
                    L1: 122
                }
            }
        ]   
    },
    {
        operacion: 12,
        color: 'blue',
        tipo: 'CB',
        nombre: 'CB-II',
        rodillos: [
            {
                tipo_plano: 'CB-R-4',
                eje: 'SUP',
                parametros: {
                    Ancho: 140,
                    Dext: 419.057,
                    Df: 373,
                    R1: 63.69,
                    R2: 3,
                    C : 2,
                    alfa1: 105,
                    alfa2: 8
                }
            },
            {
                tipo_plano: 'CB-R-4',
                eje: 'INF',
                parametros: {
                    Ancho: 140,
                    Dext: 419.057,
                    Df: 373,
                    R1: 63.69,
                    R2: 3,
                    C : 2,
                    alfa1: 105,
                    alfa2: 8
                }
            },
            {
                tipo_plano: 'CB-R-4',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 120,
                    Dext: 351.52,
                    Df: 328,
                    R1: 63.69,
                    R2: 3,
                    C : 2,
                    alfa1: 75,
                    alfa2: 8
                }
            },
            {
                tipo_plano: 'CB-R-4',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 120,
                    Dext: 351.52,
                    Df: 328,
                    R1: 63.69,
                    R2: 3,
                    C : 2,
                    alfa1: 75,
                    alfa2: 8
                }
            }
        ]   
    },
    {
        operacion: 13,
        color: 'teal',
        tipo: 'CB',
        nombre: 'CB-III',
        rodillos: [
            {
                tipo_plano: 'CB-CONVEX',
                eje: 'SUP',
                parametros: {
                    Ancho: 270,
                    Df: 465,
                    R1: 800
                }
            },
            {
                tipo_plano: 'CB-CONVEX',
                eje: 'INF',
                parametros: {
                    Ancho: 270,
                    Df: 465,
                    R1: 800
                }
            },
            {
                tipo_plano: 'CB-CONVEX',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 178,
                    Df: 330,
                    R1: 800
                }
            },
            {
                tipo_plano: 'CB-CONVEX',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 178,
                    Df: 330,
                    R1: 800
                }
            }
        ]   
    },
    {
        operacion: 14,
        color: 'olivedrab',
        tipo: 'CB',
        nombre: 'CB-IV',
        rodillos: [
            {
                tipo_plano: 'CB-CR-4',
                eje: 'SUP',
                parametros: {
                    Ancho: 145,
                    Df: 396,
                    L1: 122
                }
            },
            {
                tipo_plano: 'CB-CR-4',
                eje: 'INF',
                parametros: {
                    Ancho: 145,
                    Df: 396,
                    L1: 122
                }
            },
            // {
            //     tipo_plano: 'CB-R-2',
            //     eje: 'SUP',
            //     parametros: {
            //         Ancho: 270,
            //         Df: 340,
            //         Dext: 496.4,
            //         Dc: 500.4,
            //         R1: 80.2,
            //         R2:3,
            //         alfa1: 10
            //     }
            // },
            // {
            //     tipo_plano: 'CB-R-2',
            //     eje: 'INF',
            //     parametros: {
            //         Ancho: 270,
            //         Df: 340,
            //         Dext: 496.4,
            //         Dc: 500.4,
            //         R1: 80.2,
            //         R2:3,
            //         alfa1: 10
            //     }
            // },
            {
                tipo_plano: 'CB-CR-4',
                eje: 'LAT_OP',
                parametros: {
                    Ancho: 140,
                    Df: 330,
                    L1: 122
                }
            },
            {
                tipo_plano: 'CB-CR-4',
                eje: 'LAT_MO',
                parametros: {
                    Ancho: 140,
                    Df: 330,
                    L1: 122
                }
            }
            // {
            //     tipo_plano: 'CB-R-2',
            //     eje: 'LAT_OP',
            //     parametros: {
            //         Ancho: 186,
            //         Df: 211,
            //         Dext: 365,
            //         Dc: 371,
            //         R1: 80,
            //         R2: 3,
            //         alfa1: 8
            //     }
            // },
            // {
            //     tipo_plano: 'CB-R-2',
            //     eje: 'LAT_MO',
            //     parametros: {
            //         Ancho: 186,
            //         Df: 211,
            //         Dext: 365,
            //         Dc: 371,
            //         R1: 80,
            //         R2: 3,
            //         alfa1: 8
            //     }
            // }
        ]   
    }
]

const fleje = {
    espesor: 3.5,
    ancho: 506,
    calidad: 'S350',
    color: 'aqua'
}

export {fleje, montaje}