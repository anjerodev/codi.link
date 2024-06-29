/* eslint-disable no-undef */

function evalUserCode (code) {
  const whileTruePattern = /(?<!\/\/.*)(while\s*\(\s*true\s*\))\s*(?!\{\s*\})/

  try {
    if (whileTruePattern.test(code)) {
      return { success: false, error: 'Code contains infinite loop' }
    }

    // Override console methods to capture their output
    const capturedConsole = []

    const originalConsole = {
      log: console.log,
      info: console.info,
      error: console.error,
      warn: console.warn
    }

    const captureLog = (type, args) => {
      capturedConsole.push({ type, content: args })
    }

    console.log = function (...args) {
      captureLog('log:log', args)
    }

    console.info = function (...args) {
      captureLog('log:info', args)
    }

    console.error = function (...args) {
      captureLog('log:error', args)
    }

    console.warn = function (...args) {
      captureLog('log:warn', args)
    }

    // eslint-disable-next-line no-new-func
    const func = new Function(code)
    const result = func()
    // const result = eval(code)

    // Restore original console methods
    console.log = originalConsole.log
    console.info = originalConsole.info
    console.error = originalConsole.error
    console.warn = originalConsole.warn
    return { success: true, result, logs: capturedConsole }
  } catch (error) {
    return { success: false, error }
  }
}

self.onmessage = function (e) {
  const userCode = e.data.code
  const { success, result, error, logs } = evalUserCode(userCode)

  if (success) {
    self.postMessage({ result, logs })
  } else {
    self.postMessage({ error })
  }
}
