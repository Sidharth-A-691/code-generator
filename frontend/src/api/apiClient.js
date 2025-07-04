import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
})

// Kick off generation
export function generateCode(payload) {
  return api.post('/generate', payload)
}

// File tree
export function getFileTree(project_name) {
  return api.get('/files/tree', { params:{ project_name }})
}

// File content
export function getFileContent(project_name, relative_path) {
  return api.get('/files/content', {
    params:{ project_name, relative_path }
  })
}

// Write file
export function writeFileContent(payload) {
  return api.post('/files/content', payload)
}

// Download ZIP
export function downloadProject(payload) {
  return api.post('/download', payload, { responseType:'blob' })
}