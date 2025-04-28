const config = {
    ninja: {
        speed: 8,
        health: 200,
        maxStamina: 30,
        staminaRegenRate: 0.25,
        attacks: {
            attack1: {
                staminaCost: 20,
                damage: 10,
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
                damage: 20,
                duration: 550,
                cooldown: 800,
                boxConfig: {
                    lWidth: 100,       
                    lHeight: 135,    
                    lThickness: 82.5  
                }
              },
              super: {
                staminaCost: 25,
                damage: 50,
                speed: 10,
                width: 100,
                height: 100
              }
        },
    },
    heroKnight: {
        speed: 6.5,
        health: 230,
        maxStamina: 30,
        staminaRegenRate: 0.25,
        attacks: {
            attack1: {
                staminaCost: 20,
                damage: 10,
                duration: 550,
                cooldown: 600,
                boxConfig: {
                    lWidth: 100,
                    lHeight: 160,
                    lThickness: 40
                }
              },
              attack2: {
                staminaCost: 25,
                damage: 25,
                duration: 780,
                cooldown: 800,
                boxConfig: {
                    lWidth: 150,       
                    lHeight: 160,    
                    lThickness: 40  
                }
              }, 
              super: {
                staminaCost: 25,
                damage: 50,
                speed: 10,
                width: 100,
                height: 100
              }
        },
    },
}

export default config