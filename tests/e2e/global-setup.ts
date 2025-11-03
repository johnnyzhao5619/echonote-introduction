import { FullConfig } from '@playwright/test'
import { spawn } from 'child_process'

async function globalSetup(_config: FullConfig) {
  // Build the application before running tests
  return new Promise<void>((resolve, reject) => {
    console.log('Building application for E2E tests...')
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    buildProcess.on('close', code => {
      if (code === 0) {
        console.log('Application built successfully')
        resolve()
      } else {
        reject(new Error(`Build process exited with code ${code}`))
      }
    })

    buildProcess.on('error', error => {
      reject(error)
    })
  })
}

export default globalSetup
