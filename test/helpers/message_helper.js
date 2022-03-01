// const { tradesController } = require('../controllers/tradesController')
const axios = require('axios')
const { Worker } = require('worker_threads')
const path = require('path')
const products = require('./product.json')

var workers = []

const handle_message = async (ws, message) => {
  try {
    const req = JSON.parse(message)
    // console.log(req)
    let time = Math.floor((Date.now() - req.timestamp) / 1000)
    let time2 = Date.now()
    switch (req.type) {
      case 'get_data': // regular
        switch (req.mode) {
          case 'regular':
            if (req.power === true) {
              for (const server of req.servers) {
                const worker = new Worker(path.resolve('controllers/tradesController.js'))
                console.log('global worker created')
                const regular_data = {
                  server,
                  type: req.type,
                  products,
                  filters: req.filters,
                }
                worker.postMessage(JSON.stringify(regular_data))
                worker.on('message', (data) => {
                  let timeTook = Math.floor((Date.now() - time2) / 1000) + time
                  console.log(timeTook)
                  ws.send(JSON.stringify({ ...JSON.parse(data), timeTook }))
                })
                workers.push(worker)
              }
            } else if (req.power === false) {
              if (workers.length) {
                workers.forEach((worker) => {
                  worker.terminate()
                })
              }
            }
            break
          case 'stress':
            if (req.power === true) {
              for (const server of req.servers) {
                const stressed_data = {
                  type: req.type,
                  server,
                  products,
                  filters: req.filters,
                }
                const threads = req.threads ? +req.threads : 1
                for (let i = 1; i <= +threads; i++) {
                  const worker = new Worker(path.resolve('controllers/tradesController.js'))
                  worker.postMessage(JSON.stringify(stressed_data))
                  worker.on('message', (data) => {
                    const newData = JSON.parse(data)
                    newData.data.thread = i
                    ws.send(JSON.stringify(newData))
                  })
                  workers.push(worker)
                }
              }
            } else if (req.power === false) {
              if (workers.length) {
                workers.forEach((worker) => {
                  worker.terminate()
                })
              }
            }
            break
        }
        break
      case 'products':
        ws.send(JSON.stringify(products))
        break
      default:
        throw new Error('Invalid message type')
    }
  } catch (err) {
    ws.send(
      JSON.stringify({
        error: true,
        message: err.message,
      })
    )
  }
}

module.exports = {
  handle_message,
}

// {
//   type: "getData",
//   filters: {
//     type: 'MKT',
//     side: "BUY",
//     product_id: 2
//   }
// }
