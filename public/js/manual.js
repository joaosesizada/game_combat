<<<<<<< HEAD
function mostrarPagina(id) {
    const paginas = document.querySelectorAll('.page')
    paginas.forEach(pagina => pagina.classList.remove('ativa'))
    document.getElementById(id).classList.add('ativa')
}

=======
function showPage(id, nextPage) {
    document.getElementById('page'+nextPage).style.display = 'block'
    
    document.getElementById('page'+id).style.display = 'none'
}
>>>>>>> 8bfcfa4997d696fe814d24ad29d5f4593c4cd82e
