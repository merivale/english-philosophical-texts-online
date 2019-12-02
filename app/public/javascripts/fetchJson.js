/*
 * A little helper function to make JSON fetch requests simpler.
 */
export default function (url, callback) {
  window.fetch(`/data/${url}.json`)
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          callback(data)
        })
      }
    })
}
