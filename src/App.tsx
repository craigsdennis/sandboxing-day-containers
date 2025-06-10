import { useState, useEffect, useRef } from 'react'
import cloudflareLogo from './assets/Cloudflare_Logo.svg'

interface TerminalOutput {
  command: string
  cwd: string
  stdout: string
  stderr: string
  return_code: number
}

function App() {
  const [slug, setSlug] = useState('demo')
  const [cwd, setCwd] = useState('/app')
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<TerminalOutput[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sandbox/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: cmd,
          cwd: cwd
        })
      })

      const result = await response.json() as {
        cwd: string
        return_code: number
        stdout: string
        stderr: string
      }

      const output: TerminalOutput = {
        command: cmd,
        cwd: cwd,
        stdout: result.stdout,
        stderr: result.stderr,
        return_code: result.return_code
      }

      setHistory(prev => [...prev, output])
      setCwd(result.cwd)
    } catch (error) {
      const errorOutput: TerminalOutput = {
        command: cmd,
        cwd: cwd,
        stdout: '',
        stderr: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        return_code: 1
      }
      setHistory(prev => [...prev, errorOutput])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim() && !isLoading) {
      executeCommand(command)
      setCommand('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <img src={cloudflareLogo} className="h-8 w-auto" alt="Cloudflare logo" />
          <h1 className="text-xl font-bold text-orange-400">Cloudflare Container Sandbox</h1>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-300">Sandbox:</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="bg-gray-700 text-white px-2 py-1 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none"
              placeholder="sandbox-name"
            />
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 p-4">
        <div 
          ref={terminalRef}
          className="bg-black rounded-lg border border-gray-700 h-96 overflow-y-auto p-4 mb-4"
        >
          {history.length === 0 && (
            <div className="text-gray-400 text-sm mb-4">
              Welcome to Cloudflare Container Sandbox. Type commands to get started.
            </div>
          )}
          
          {history.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="text-orange-400 flex items-center gap-2">
                <span className="text-green-400">root@{slug}</span>
                <span className="text-blue-400">{entry.cwd}</span>
                <span className="text-white">$</span>
                <span className="text-gray-100">{entry.command}</span>
              </div>
              {entry.stdout && (
                <pre className="text-gray-100 whitespace-pre-wrap text-sm ml-2 mt-1">
                  {entry.stdout}
                </pre>
              )}
              {entry.stderr && (
                <pre className="text-red-400 whitespace-pre-wrap text-sm ml-2 mt-1">
                  {entry.stderr}
                </pre>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="text-orange-400 flex items-center gap-2">
              <span className="text-green-400">root@{slug}</span>
              <span className="text-blue-400">{cwd}</span>
              <span className="text-white">$</span>
              <span className="text-gray-100">{command}</span>
              <span className="animate-pulse">█</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400">root@{slug}</span>
            <span className="text-blue-400">{cwd}</span>
            <span className="text-white">$</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
            placeholder="Enter command..."
            disabled={isLoading}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  )
}

export default App
