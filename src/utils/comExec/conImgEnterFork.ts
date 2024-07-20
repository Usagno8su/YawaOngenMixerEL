import { createImgFile } from './comEnter'
import fs from 'fs'

fs.writeFileSync('/tmp/YOMtempDir/aaaaa.txt', '3322fewfgererw')


process.parentPort.on('message', (e) => {
  const [port] = e.ports
  console.log(`Message from parent: ${e.data}`)
  port.on('message', (g) => {
    console.log(`Message from parent: ${g.data}`)
    e.ports
  })
  port.start()
  port.postMessage('hello')
  fs.writeFileSync('/tmp/YOMtempDir/aaaaa.txt', 'asdadifjwsnevouisd')

  port.once('message', (data) => {
    console.log(`Received chunk ${data}`)
  })


  process.send('pong')
})

setTimeout(() => {
  process.exit(20)
}, 4_00)

