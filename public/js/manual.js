function mostrarPagina(id) {
    const paginas = document.querySelectorAll('.page')
    paginas.forEach(pagina => pagina.classList.remove('ativa'))
    document.getElementById(id).classList.add('ativa')
}

