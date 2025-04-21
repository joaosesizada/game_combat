const config = {
    ninja: {
        speed: 8,
        health: 80,
        maxStamina: 30,
        staminaRegenRate: 0.25,
        attacks: {
            attack1: {
                staminaCost: 20,
                damage: 35,
                duration: 400,
                cooldown: 600,
                boxConfig: {
                    lWidth: 100,
                    lHeight: 160,
                    lThickness: 40
                }
              },
              attack2: {
                staminaCost: 25,
                damage: 50,
                duration: 500,
                cooldown: 800,
                boxConfig: {
                    lWidth: 100,       
                    lHeight: 160,    
                    lThickness: 40  
                }
              }
        },
    },
    heroKnight: {
        speed: 6.5,
        health: 120,
        maxStamina: 30,
        staminaRegenRate: 0.25,
        attacks: {
            attack1: {
                staminaCost: 20,
                damage: 35,
                duration: 400,
                cooldown: 600,
                boxConfig: {
                    lWidth: 100,
                    lHeight: 160,
                    lThickness: 40
                }
              },
              attack2: {
                staminaCost: 25,
                damage: 50,
                duration: 500,
                cooldown: 800,
                boxConfig: {
                    lWidth: 100,       
                    lHeight: 160,    
                    lThickness: 40  
                }
              }
        },
    },
}

export default config