function showPage(id, nextPage) {
    document.getElementById('page'+nextPage).style.display = 'block'
    
    document.getElementById('page'+id).style.display = 'none'
}
