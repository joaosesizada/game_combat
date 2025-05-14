const nexusMessages = [
  "Forjado além do tempo!",
  "Carregando realidades...",
  "Código ancestral quebrado!",
  "Versão 1.0.0-NEXUS!",
  "Já alimentou seu dragão?",
  "Experimento cósmico maluco!",
  "Limites não encontrados!",
  "Use fones... ou alumínio!",
  "Estável (até travar)!",
  "Fragmentos colados com fita!",
  "200% mais portais!",
  "Sombras contam piadas ruins!",
  "Espadas gigantes compensam!",
  "Modo caos: terça-feira!",
  "Mais épico que stories!",
  "Movido a magia e café!",
  "Cristal vermelho? Melhor não!",
  "Física galáctica instável!",
  "Respire... e reze!",
  "Sonhos e pesadelos incluídos!",
  "Você não tá pronto!",
  "Desde 2025!",
  "Cuidado Santos",
  "Feito em JS e gambiarra!",
  "Entrou sem querer?",
  "Senha da existência: 1234!",
  "Destino no easy mode!",
  "Colapso temporal em cores!",
  "EasterEgg dentro do EasterEgg!"
];

window.addEventListener("load", () => {
    const message = document.getElementById('message')
    const text = Math.floor(Math.random() * nexusMessages.length);

    message.innerHTML = nexusMessages[text];
})