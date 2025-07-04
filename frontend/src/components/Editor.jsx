import React, { useEffect, useState } from 'react'
import FileTreeNode from './FileTreeNode'
import MonacoEditor from '@monaco-editor/react'
import {
  getFileTree,
  getFileContent,
  writeFileContent,
  downloadProject
} from '../api/apiClient'
import clsx from 'clsx'

export default function Editor({
  outputDirectory,
  projectName
}) {
  const [tree, setTree] = useState([])
  const [currentFile, setCurrentFile] = useState(null)
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)

  // Load file tree
  useEffect(() => {
    getFileTree(outputDirectory, projectName)
      .then(r => setTree(r.data))
      .catch(console.error)
  }, [outputDirectory, projectName])

  // Open file
  const openFile = relPath => {
    getFileContent(outputDirectory, projectName, relPath)
      .then(r => {
        setCurrentFile(relPath)
        setCode(r.data.content)
      })
      .catch(console.error)
  }

  // Save file
  const saveFile = () => {
    if (!currentFile) return
    setSaving(true)
    writeFileContent({
      output_directory: outputDirectory,
      project_name: projectName,
      relative_path: currentFile,
      content: code
    })
      .then(()=> alert('Saved!'))
      .catch(err=> alert('Save failed: '+err))
      .finally(()=> setSaving(false))
  }

  // Download project
  const download = () => {
    downloadProject({
      output_directory: outputDirectory,
      project_name: projectName
    })
      .then(resp => {
        const url = window.URL.createObjectURL(new Blob([resp.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectName}.zip`
        a.click()
      })
      .catch(console.error)
  }

  return (
    <div className="flex h-full">
      {/* File Explorer */}
      <aside className="w-64 border-r border-gray-300 overflow-y-auto p-2">
        <h3 className="font-bold mb-2">Files</h3>
        {tree.map(node => (
          <FileTreeNode
            key={node.path}
            node={node}
            onFileClick={openFile}
          />
        ))}
      </aside>

      {/* Editor Pane */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between bg-gray-100 p-2 border-b">
          <span className="font-medium">{currentFile || 'Select a file…'}</span>
          <div>
            <button
              onClick={saveFile}
              disabled={saving || !currentFile}
              className="mr-2 px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={download}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Download Project
            </button>
          </div>
        </div>
        <div className="flex-1">
          <MonacoEditor
            height="100%"
            language={currentFile?.split('.').pop() || 'javascript'}
            theme="vs-dark"
            value={code}
            onChange={v=>setCode(v)}
            options={{ automaticLayout: true }}
          />
        </div>
      </div>
    </div>
  )
}