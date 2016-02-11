
var envs = {
  "localhost": "http://localhost:4000",
  "staged.tiny-mesh.com": "http://http.stage.highlands.tiny-mesh.com/v2",
  "http.cloud-ng.tiny-mesh.com": "https://http.cloud-ng.tiny-mesh.com/v2"
}
var fallback = window.location.protocol + "//http." + window.location.hostname + "/v2";

var base = window.location.search.match(/BASE_URL=([^&#]*)/)

if (base)
  sessionStorage.BASE_URL = base[1]

export default {
  BASE_URL: sessionStorage.BASE_URL || envs[window.location.hostname] || fallback
}
