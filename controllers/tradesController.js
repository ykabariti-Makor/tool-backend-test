const { parentPort } = require('worker_threads')
const { v4: uuidv4 } = require('uuid')

const tradesController = async (products, filters) => {
  try {
    let types = ['MKT', 'FOK', 'RFQ']
    let sides = ['BUY', 'SELL']

    if (filters && Object.entries(filters).length) {
      if (filters.types && filters.types.length) {
        types = filters.types
      }
      if (filters.sides && filters.sides.length) {
        sides = filters.sides
      }
    }

    try {
      if (filters?.products) {
        let filteredProducts = products.filter((product) => filters.products.includes(product.product_name))
        for (const product of filteredProducts) {
          const { product_id, min_quantity, max_quantity, product_name } = product
          const separator = +((max_quantity - min_quantity) / 5.0).toFixed(2)
          // creating array of quantities between max and min
          const quantities = [min_quantity, separator + min_quantity, separator * 2 + min_quantity, separator * 3 + min_quantity, max_quantity]
          for (const type of types) {
            for (const side of sides) {
              // let timeAvg = 0
              for (const quantity of quantities) {
                const tradeTime = +(Math.random() * 3).toFixed(2)
                // if (mode === 'stress') {
                //   timeAvg += tradeTime
                // } else {
                const data_to_return = {
                  type: 'trade',
                  data: {
                    type, // EX. -> 'FOK'
                    side, // EX. -> 'BUY'
                    product_id,
                    product_name,
                    quantity,
                    tradeTime,
                    id: uuidv4(),
                  },
                }
                await delay(Math.random() * 3000)
                parentPort.postMessage(JSON.stringify(data_to_return))
                // }
              }
              // if (mode === 'stress') {
              //   const avg_data = {
              //     type: 'trade',
              //     data: {
              //       type, // EX. -> 'FOK'
              //       side, // EX. -> 'BUY'
              //       product_id,
              //       product_name,
              //       quantity: quantities[2],
              //       tradeTime: +(timeAvg / quantities.length).toFixed(2),
              //       // server,
              //       id: uuidv4(),
              //     },
              //   }
              //   await delay(Math.random() * 3000)
              //   parentPort.postMessage(JSON.stringify(avg_data))
              // }
            }
          }
        }
      } else {
        for (const product of products) {
          const { product_id, min_quantity, max_quantity, product_name } = product
          const separator = +((max_quantity - min_quantity) / 5.0).toFixed(2)
          // creating array of quantities between max and min
          const quantities = [min_quantity, separator + min_quantity, separator * 2 + min_quantity, separator * 3 + min_quantity, max_quantity]
          for (const type of types) {
            for (const side of sides) {
              // let timeAvg = 0
              for (const quantity of quantities) {
                const tradeTime = +(Math.random() * 3).toFixed(2)
                // if (mode === 'stress') {
                //   timeAvg += tradeTime
                // } else {
                const data_to_return = {
                  type: 'trade',
                  data: {
                    type, // EX. -> 'FOK'
                    side, // EX. -> 'BUY'
                    product_id,
                    product_name,
                    quantity,
                    tradeTime,
                    id: uuidv4(),
                  },
                }
                await delay(Math.random() * 3000)
                parentPort.postMessage(JSON.stringify(data_to_return))
                // }
              }

              // if (mode === 'stress') {
              //   const avg_data = {
              //     type: 'trade',
              //     data: {
              //       type, // EX. -> 'FOK'
              //       side, // EX. -> 'BUY'
              //       product_id,
              //       product_name,
              //       quantity: quantities[2],
              //       tradeTime: +(timeAvg / quantities.length).toFixed(2),
              //       // server,
              //       id: uuidv4(),
              //     },
              //   }
              //   await delay(1000)
              //   // console.log(avg_data, 'stress')
              //   parentPort.postMessage(JSON.stringify(avg_data))
              // }
            }
          }
        }
      }
    } catch (error) {
      console.log(error.message)
      throw new Error('data not found')
    }
  } catch (error) {
    // ws.send({})
  }
}
const singleTrade = async (filters, products) => {
  const types = filters?.types ? filters.types : ['MKT', 'FOK', 'RFQ']
  const sides = filters?.sides ? filters.sides : ['BUY', 'SELL']
  const products_names = filters?.products ? filters.products : products.map((product) => product.product_name)
  const random_type = types[Math.floor(Math.random() * types.length)]
  const random_side = sides[Math.floor(Math.random() * sides.length)]
  const random_product = products_names[Math.floor(Math.random() * products_names.length)]
  const product = products.filter((product) => product.product_name === random_product)[0]
  const quantity = product.min_quantity
  const tradeTime = +(Math.random() * 3).toFixed(2)

  const data = {
    type: 'trade',
    data: {
      type: random_type, // EX. -> 'FOK'
      side: random_side, // EX. -> 'BUY'
      tradeTime,
      product_id: product.product_id,
      product_name: random_product,
      quantity,
      id: uuidv4(),
    },
  }
  await delay(Math.random() * 3000)
  parentPort.postMessage(JSON.stringify(data))
}
parentPort.on('message', async (data) => {
  const { req, products } = JSON.parse(data)
  const { filters, mode, power } = req
  if (mode === 'stress') {
    while (power) {
      await singleTrade(filters, products)
    }
  } else {
    await tradesController(products, filters)
  }
})

const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
module.exports = {
  tradesController,
}
