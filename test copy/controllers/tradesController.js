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
          console.log('trade created :)')
          for (const type of types) {
            for (const side of sides) {
              for (const quantity of quantities) {
                const tradeTime = (Math.random() * 3).toFixed(2)
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
                await delay(1000)
                parentPort.postMessage(JSON.stringify(data_to_return))
              }
            }
          }
        }
      } else {
        for (const product of products) {
          const { product_id, min_quantity, max_quantity, product_name } = product
          const separator = +((max_quantity - min_quantity) / 5.0).toFixed(2)
          // creating array of quantities between max and min
          const quantities = [min_quantity, separator + min_quantity, separator * 2 + min_quantity, separator * 3 + min_quantity, max_quantity]
          console.log('trade created :)')
          for (const type of types) {
            for (const side of sides) {
              for (const quantity of quantities) {
                let tradeTime = (Math.random() * 3).toFixed(2)
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
                await delay(1000)
                parentPort.postMessage(JSON.stringify(data_to_return))
              }
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

parentPort.on('message', async (data) => {
  const { products, filters, type } = JSON.parse(data)
  if (type === 'stress') {
    while (true) {
      await tradesController(products, filters)
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
