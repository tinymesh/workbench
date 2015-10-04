var BASE_URL = 'https://http.cloud.tiny-mesh.com/v1';

export default {
  BASE_URL: BASE_URL,
  NETWORK_URL: BASE_URL + '/network',
  Actions: {
    new:    'network:new',
    update: 'network:update',
    list:   'network:list',
    change: 'network:change'
  }
}
