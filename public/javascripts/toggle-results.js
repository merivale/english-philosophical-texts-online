const showDetails = document.querySelectorAll('[data-action="show-details"]')

showDetails.forEach((a) => {
  a.addEventListener('click', (e) => {
    const details = document.getElementById(a.dataset.details)
    details.classList.toggle('active')
  })
})
