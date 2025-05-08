const setup = {
    ninja: {
        idle: {
            src: "../imgs/ninja/idle.png",
            framesWidth: 39,
            framesHeight: 52,
            totalFrames: 8,
            loop: true
        },
        run: {
            src: "../imgs/ninja/run.png",
            framesWidth: 48,
            framesHeight: 52,
            totalFrames: 8,
            loop: true
        },
        attack1: {
            src: "../imgs/ninja/attack1.png",
            framesWidth: 166,
            framesHeight: 70,
            totalFrames: 6,
            loop: true
        },
        attack2: {
            src: "../imgs/ninja/attack2.png",
            framesWidth: 160,
            framesHeight: 63,
            totalFrames: 4,
            loop: true
        },
        super: {
            src: "../imgs/ninja/super.png",
            framesWidth: 160,
            framesHeight: 63,
            totalFrames: 3,
            loop: false
        },
        jump: {
            src: "../imgs/ninja/jump.png",
            framesWidth: 40,
            framesHeight: 53,
            totalFrames: 1,
            loop: true
        },
        fall: {
            src: "../imgs/ninja/fall.png",
            framesWidth: 48,
            framesHeight: 56,
            totalFrames: 4,
            loop: true
        },
        hurt: {
            src: "../imgs/ninja/hurt.png",
            framesWidth: 50,
            framesHeight: 54,
            totalFrames: 4,
            loop: true
        },
        death: {
            src: "../imgs/ninja/death.png",
            framesWidth: 51,
            framesHeight: 53,
            totalFrames: 6,
            loop: false
        },
        attackClash: {
            src: "../imgs/ninja/attackClash.png",
            framesWidth: 48,
            framesHeight: 54,
            totalFrames: 4,
            loop: false
        },
    },
    heroKnight: {
        idle: {
            src: "../imgs/heroKnight/idle.png",
            framesWidth: 47,
            framesHeight: 51,
            totalFrames: 10,
            loop: true
        },
        run: {
            src: "../imgs/heroKnight/run.png",
            framesWidth: 42,
            framesHeight: 55,
            totalFrames: 8,
            loop: true
        },
        attack1: {
            src: "../imgs/heroKnight/attack1.png",
            framesWidth: 162,
            framesHeight: 67,
            totalFrames: 6,
            loop: true
        },
        attack2: {
            src: "../imgs/heroKnight/attack2.png",
            framesWidth: 150,
            framesHeight: 80,
            totalFrames: 8,
            loop: false
        },
        super: {
            src: "../imgs/heroKnight/super.png",
            framesWidth: 162,
            framesHeight: 67,
            totalFrames: 4,
            loop: false
        },
        jump: {
            src: "../imgs/heroKnight/jump.png",
            framesWidth: 35,
            framesHeight: 56,
            totalFrames: 3,
            loop: true
        },
        fall: {
            src: "../imgs/heroKnight/fall.png",
            framesWidth: 38,
            framesHeight: 65,
            totalFrames: 3,
            loop: true
        },
        hurt: {
            src: "../imgs/heroKnight/hurt.png",
            framesWidth: 52,
            framesHeight: 51,
            totalFrames: 4,
            loop: true
        },
        death: {
            src: "../imgs/heroKnight/death.png",
            framesWidth: 76,
            framesHeight: 56,
            totalFrames: 10,
            loop: false
        },
        attackClash: {
            src: "../imgs/heroKnight/attackClash.png",
            framesWidth: 52,
            framesHeight: 51,
            totalFrames: 3,
            loop: false
        }
    },
    effects: {
        clash: { src: "../imgs/effects/clash.png", totalFrames: 8, frameWidth: 50, frameHeight: 68, loop: true },
        smokeDust: { src: "../imgs/effects/smokeDust.png", totalFrames: 9, frameWidth: 47, frameHeight: 42, loop: false },
        fenix: { src: "../imgs/effects/fenix.png", totalFrames: 24, frameWidth: 45, frameHeight: 48, loop: false },
        tornado: { src: "../imgs/effects/tornado.png", totalFrames: 5, frameWidth: 31, frameHeight: 32, loop: true }
    }
}

export const hud = {
    profilesImg: {
        ninja: '../imgs/ninja/perfil.png',
        heroKnight: '../imgs/heroKnight/perfil.png'
    },
    player1: {
        balls: {
            ballOne: {
                x: 400,
                y: 102.5
            },
            ballTwo: {
                x: 430,
                y: 102.5
            }
        },
        bars: {
            health: {
                type: 'health',
                max: 'maxHealth',
                x: 150,
                y: 50,
                width: 300,
                height: 17.5,
                invert: false,
                startSide: 'left',
                color: {
                    dark: "#800000",
                    light: "#FF0333",
                }
            },
            superEnergy: {
                type: 'superEnergy',
                max: 'maxSuperEnergy',
                x: 140,
                y: 70,
                width: 300,
                height: 15,
                invert: true,
                startSide: 'right',
                color: {
                    dark: "#FFD700",
                    light: "#FF4500",
                }
            },
            stamina: {
                type: 'stamina',
                max: 'maxStamina',
                x: 155,
                y: 95,
                width: 200,
                height: 12.5,
                invert: true,
                startSide: 'right',
                color: {
                    dark: "#000080",
                    light: "#0070FF",
                }
            }
        }, 
        profile: {
            x: 50,
            y: 35,
            width: 80,
            height: 80,
            flip: false
        }
    },
    player2: {
        balls: {
            ballOne: {
                x: 800,
                y: 102.5
            },
            ballTwo: {
                x: 770,
                y: 102.5
            }
        },
        bars: {
            health: {
                type: 'health',
                max: 'maxHealth',
                x: 750,
                y: 50,
                width: 300,
                height: 17.5,
                invert: true,
                startSide: 'left',
                color: {
                    dark: "#800000",
                    light: "#FF0333",
                }
            },
            superEnergy: {
                type: 'superEnergy',
                max: 'maxSuperEnergy',
                x: 760,
                y: 70,
                width: 300,
                height: 15,
                invert: false,
                startSide: 'right',
                color: {
                    dark: "#FFD700",
                    light: "#FF4500",
                }
            },
            stamina: {
                type: 'stamina',
                max: 'maxStamina',
                x: 850,
                y: 95,
                width: 200,
                height: 12.5,
                invert: false,
                startSide: 'right',
                color: {
                    dark: "#000080",
                    light: "#0070FF",
                }
            }
        },
        profile: {
            x: 1080,
            y: 35,
            width: 80,
            height: 80,
            flip: true
        }
    }
}      


export default setup