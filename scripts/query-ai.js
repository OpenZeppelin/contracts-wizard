const axios = require('axios')

async function main() {

  console.log('starting')
  const { data } = await axios.post('http://localhost:8888/ai', {
    messages: [{
      role: 'user',
      content: 'write a smart contract for an erc20 token called bobcoin'
    }]
  })

  const choice = data.choices[0].message
  if (choice.function_call) {
    console.log('Function call!')
    console.log(choice.function_call)
  }
  else {
    console.log(choice.content)
  }
}

main()
