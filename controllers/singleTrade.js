const { v4: uuidv4 } = require('uuid')

const singleTrade = async (filters, products) => {
  const type = filters?.types ? filters.types[0] : 'MKT'
  const side = filters?.sides ? filters.sides[0] : 'BUY'
  const product_name = filters?.products ? filters.products[0] : 'BTC-EUR'
  const product = products.filter((product) => product.product_name === product_name)[0]
  const quantity = product.min_quantity
  await delay(Math.random() * 2000)
  return {
    type: 'singleTrade',
    data: {
      type, // EX. -> 'FOK'
      side, // EX. -> 'BUY'
      product_id: product.product_id,
      product_name,
      quantity,
      id: uuidv4(),
    },
  }
}
const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
module.exports = {
  singleTrade,
}
