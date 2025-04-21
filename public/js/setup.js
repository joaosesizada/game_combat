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
        }  
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
            src: "../imgs/heroKnight/attack.png",
            framesWidth: 162,
            framesHeight: 67,
            totalFrames: 6,
            loop: true
        },
        attack2: {
            src: "../imgs/heroKnight/attack.png",
            framesWidth: 162,
            framesHeight: 67,
            totalFrames: 6,
            loop: true
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
    }
}

export default setup