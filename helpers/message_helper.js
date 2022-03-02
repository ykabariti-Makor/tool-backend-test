// const { tradesController } = require('../controllers/tradesController')
const { Worker } = require('worker_threads')
const path = require('path')
const products = require('./product.json')
// const { singleTrade } = require('../controllers/singleTrade')
let clients = {}

const handle_message = async (ws, message) => {
  try {
    const req = JSON.parse(message)
    switch (req.type) {
      case 'get_data': // regular
        switch (req.mode) {
          case 'regular':
            if (req.power === true) {
              let worker = new Worker(path.resolve('controllers/tradesController.js'))
              const regular_data = {
                req,
                products,
              }
              worker.postMessage(JSON.stringify(regular_data))

              worker.on('message', (data) => {
                const newData = JSON.parse(data)
                console.log(req.server.name)
                newData.data.location = req.server.name
                ws.send(JSON.stringify(newData))
              })
              clients[ws.id] = worker
            } else if (req.power === false) {
              if (clients[ws.id]) {
                clients[ws.id].terminate()
              }
              delete clients[ws.id]
            }
            break
          case 'stress':
            if (req.power === true) {
              const stressed_data = {
                req,
                products,
              }
              const threads = req.threads ? +req.threads : 1
              for (let i = 1; i <= threads; i++) {
                const worker = new Worker(path.resolve('controllers/tradesController.js'))
                worker.postMessage(JSON.stringify(stressed_data))
                worker.on('message', (data) => {
                  const newData = JSON.parse(data)
                  newData.data.thread = i
                  newData.data.location = req.server.name
                  ws.send(JSON.stringify(newData))
                })
                clients[ws.id] = clients[ws.id] ? [...clients[ws.id], worker] : [worker]
              }
            } else if (req.power === false) {
              if (clients[ws.id]) {
                clients[ws.id].forEach((worker) => {
                  worker.terminate()
                })
                delete clients[ws.id]
              }
            }
            break
        }
        break
      // case 'random':
      //   const types = ['MKT', 'FOK', 'RFQ']
      //   const sides = ['BUY', 'SELL']
      //   const products_names = products.map((product) => product.product_name)
      //   const random_type = types[Math.floor(Math.random() * types.length)]
      //   const random_side = sides[Math.floor(Math.random() * sides.length)]
      //   const random_product = products_names[Math.floor(Math.random() * products_names.length)]
      //   ws.send(JSON.stringify({ type: random_type, side: random_side, product: random_product }))

      //   break
      case 'products':
        ws.send(JSON.stringify({ type: 'products', data: products.map((product) => product.product_name) }))
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
