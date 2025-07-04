import React, { useState } from 'react'
import { Folder, File } from 'lucide-react'
import clsx from 'clsx'

export default function FileTreeNode({
  node,
  onFileClick,
  indent = 0
}) {
  const [open, setOpen] = useState(false)
  const isDir = node.type === 'directory'

  return (
    <div className={clsx('pl-' + indent)}>
      <div
        className="flex items-center cursor-pointer hover:bg-gray-300/20 p-1 rounded"
        onClick={() => {
          if (isDir) setOpen(o => !o)
          else onFileClick(node.path)
        }}
      >
        {isDir
          ? <Folder size={16} className="mr-1" />
          : <File size={16} className="mr-1" />}
        <span>{node.name}</span>
      </div>
      {isDir && open && node.children?.map(child => (
        <FileTreeNode
          key={child.path}
          node={child}
          onFileClick={onFileClick}
          indent={indent + 4}
        />
      ))}
    </div>
  )
}